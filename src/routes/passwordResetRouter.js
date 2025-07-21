import { Router } from 'express';
import PasswordResetService from '../services/PasswordResetService.js';
import { ErrorResponseDTO } from '../dto/ResponseDTO.js';

const router = Router();
const passwordResetService = new PasswordResetService();

/**
 * POST /api/password-reset/request
 * Solicitar recuperación de contraseña
 */
router.post('/request', async (req, res) => {
    try {
        const { email } = req.body;

        // Validación básica
        if (!email || !email.includes('@')) {
            const errorResponse = new ErrorResponseDTO('Email válido es requerido');
            return res.status(400).json(errorResponse.toResponse());
        }

        const result = await passwordResetService.requestPasswordReset(email.toLowerCase().trim());
        
        // Siempre devolver 200 por seguridad (no revelar si el email existe)
        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en POST /request:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * GET /api/password-reset/verify/:token
 * Verificar si un token es válido
 */
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            const errorResponse = new ErrorResponseDTO('Token es requerido');
            return res.status(400).json(errorResponse.toResponse());
        }

        const result = await passwordResetService.verifyResetToken(token);
        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en GET /verify:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * POST /api/password-reset/reset
 * Restablecer la contraseña
 */
router.post('/reset', async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // Validaciones
        if (!token) {
            const errorResponse = new ErrorResponseDTO('Token es requerido');
            return res.status(400).json(errorResponse.toResponse());
        }

        if (!newPassword || newPassword.length < 6) {
            const errorResponse = new ErrorResponseDTO('La contraseña debe tener al menos 6 caracteres');
            return res.status(400).json(errorResponse.toResponse());
        }

        if (newPassword !== confirmPassword) {
            const errorResponse = new ErrorResponseDTO('Las contraseñas no coinciden');
            return res.status(400).json(errorResponse.toResponse());
        }

        // Validación de fortaleza de contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            const errorResponse = new ErrorResponseDTO(
                'La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial'
            );
            return res.status(400).json(errorResponse.toResponse());
        }

        const result = await passwordResetService.resetPassword(token, newPassword);
        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en POST /reset:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * POST /api/password-reset/cleanup
 * Limpiar tokens expirados (endpoint administrativo)
 */
router.post('/cleanup', async (req, res) => {
    try {
        // Solo permitir en desarrollo o con autenticación admin
        if (process.env.NODE_ENV === 'production') {
            const errorResponse = new ErrorResponseDTO('Endpoint no disponible en producción');
            return res.status(403).json(errorResponse.toResponse());
        }

        const deletedCount = await passwordResetService.cleanupExpiredTokens();
        
        res.json({
            status: 'success',
            payload: {
                deletedTokens: deletedCount,
                message: `${deletedCount} tokens expirados eliminados`
            }
        });

    } catch (error) {
        console.error('Error en POST /cleanup:', error);
        
        const errorResponse = new ErrorResponseDTO('Error interno del servidor');
        res.status(500).json(errorResponse.toResponse());
    }
});

export default router;
