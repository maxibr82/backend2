import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { userModel } from '../dao/models/userModel.js';
import { passwordResetModel } from '../dao/models/passwordResetModel.js';
import EmailService from './EmailService.js';
import { ErrorResponseDTO, SuccessResponseDTO } from '../dto/ResponseDTO.js';

class PasswordResetService {
    constructor() {
        this.emailService = new EmailService();
    }

    /**
     * Generar y enviar token de recuperación de contraseña
     */
    async requestPasswordReset(email) {
        try {
            // Buscar al usuario por email
            const user = await userModel.findOne({ email });
            if (!user) {
                // Por seguridad, no revelamos si el email existe o no
                return new SuccessResponseDTO(
                    { message: 'Si el email existe en nuestro sistema, recibirás un correo de recuperación.' },
                    'Solicitud procesada'
                );
            }

            // Verificar que no haya tokens activos
            await passwordResetModel.deleteMany({ 
                email, 
                used: false,
                createdAt: { $gt: new Date(Date.now() - 3600000) } // No expirados
            });

            // Generar token único
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Guardar el token en la base de datos
            const passwordReset = new passwordResetModel({
                userId: user._id,
                email: user.email,
                token: resetToken
            });

            await passwordReset.save();

            // Enviar email
            await this.emailService.sendPasswordResetEmail(
                user.email, 
                resetToken, 
                user.first_name
            );

            console.log(`Token de recuperación generado para: ${email}`);

            return new SuccessResponseDTO(
                { message: 'Si el email existe en nuestro sistema, recibirás un correo de recuperación.' },
                'Solicitud procesada'
            );

        } catch (error) {
            console.error('Error en requestPasswordReset:', error);
            throw new ErrorResponseDTO('Error interno al procesar la solicitud');
        }
    }

    /**
     * Verificar si un token es válido
     */
    async verifyResetToken(token) {
        try {
            const resetRecord = await passwordResetModel.findOne({
                token,
                used: false,
                createdAt: { $gt: new Date(Date.now() - 3600000) } // No expirado
            }).populate('userId');

            if (!resetRecord) {
                throw new ErrorResponseDTO('Token inválido o expirado');
            }

            return new SuccessResponseDTO(
                {
                    email: resetRecord.email,
                    userId: resetRecord.userId._id
                },
                'Token válido'
            );

        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            console.error('Error en verifyResetToken:', error);
            throw new ErrorResponseDTO('Error al verificar el token');
        }
    }

    /**
     * Restablecer la contraseña
     */
    async resetPassword(token, newPassword) {
        try {
            // Verificar token
            const resetRecord = await passwordResetModel.findOne({
                token,
                used: false,
                createdAt: { $gt: new Date(Date.now() - 3600000) }
            });

            if (!resetRecord) {
                throw new ErrorResponseDTO('Token inválido o expirado');
            }

            // Buscar al usuario
            const user = await userModel.findById(resetRecord.userId);
            if (!user) {
                throw new ErrorResponseDTO('Usuario no encontrado');
            }

            // Verificar que la nueva contraseña no sea igual a las anteriores
            const isCurrentPassword = await bcrypt.compare(newPassword, user.password);
            if (isCurrentPassword) {
                throw new ErrorResponseDTO('No puedes usar tu contraseña actual');
            }

            // Verificar historial de contraseñas (últimas 3)
            if (user.passwordHistory && user.passwordHistory.length > 0) {
                const recentPasswords = user.passwordHistory.slice(-3);
                
                for (const oldPasswordRecord of recentPasswords) {
                    const isOldPassword = await bcrypt.compare(newPassword, oldPasswordRecord.password);
                    if (isOldPassword) {
                        throw new ErrorResponseDTO('No puedes usar una de tus últimas contraseñas');
                    }
                }
            }

            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar historial de contraseñas
            const passwordHistory = user.passwordHistory || [];
            passwordHistory.push({
                password: user.password, // Guardar la contraseña actual en el historial
                createdAt: user.lastPasswordChange || new Date()
            });

            // Mantener solo las últimas 5 contraseñas en el historial
            if (passwordHistory.length > 5) {
                passwordHistory.splice(0, passwordHistory.length - 5);
            }

            // Actualizar usuario
            await userModel.findByIdAndUpdate(user._id, {
                password: hashedPassword,
                passwordHistory,
                lastPasswordChange: new Date()
            });

            // Marcar el token como usado
            await passwordResetModel.findByIdAndUpdate(resetRecord._id, {
                used: true
            });

            // Invalidar todos los otros tokens del usuario
            await passwordResetModel.updateMany(
                { 
                    userId: user._id, 
                    _id: { $ne: resetRecord._id },
                    used: false 
                },
                { used: true }
            );

            // Enviar email de confirmación
            try {
                await this.emailService.sendPasswordChangeConfirmation(
                    user.email,
                    user.first_name
                );
            } catch (emailError) {
                console.error('Error al enviar email de confirmación:', emailError);
                // No fallar por el email, la contraseña ya se cambió
            }

            console.log(`Contraseña restablecida para usuario: ${user.email}`);

            return new SuccessResponseDTO(
                { message: 'Contraseña restablecida exitosamente' },
                'Contraseña actualizada'
            );

        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            console.error('Error en resetPassword:', error);
            throw new ErrorResponseDTO('Error interno al restablecer la contraseña');
        }
    }

    /**
     * Limpiar tokens expirados
     */
    async cleanupExpiredTokens() {
        try {
            const result = await passwordResetModel.deleteMany({
                createdAt: { $lt: new Date(Date.now() - 3600000) }
            });

            console.log(`Tokens expirados eliminados: ${result.deletedCount}`);
            return result.deletedCount;

        } catch (error) {
            console.error('Error al limpiar tokens expirados:', error);
            return 0;
        }
    }

    /**
     * Obtener estadísticas de recuperación
     */
    async getResetStats(userId) {
        try {
            const stats = await passwordResetModel.aggregate([
                { $match: { userId: mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalRequests: { $sum: 1 },
                        usedTokens: { $sum: { $cond: ['$used', 1, 0] } },
                        lastRequest: { $max: '$createdAt' }
                    }
                }
            ]);

            return stats.length > 0 ? stats[0] : {
                totalRequests: 0,
                usedTokens: 0,
                lastRequest: null
            };

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalRequests: 0,
                usedTokens: 0,
                lastRequest: null
            };
        }
    }
}

export default PasswordResetService;
