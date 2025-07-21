import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true para 465, false para otros puertos
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendPasswordResetEmail(email, resetToken, userName) {
        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Recuperación de Contraseña - E-commerce',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Recuperación de Contraseña</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        }
                        .header {
                            background-color: #ffa500;
                            color: #181818;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content h2 {
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .content p {
                            color: #666;
                            line-height: 1.6;
                            margin-bottom: 20px;
                        }
                        .reset-button {
                            display: inline-block;
                            background-color: #ffa500;
                            color: #181818;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            font-size: 16px;
                            margin: 20px 0;
                            transition: background-color 0.3s;
                        }
                        .reset-button:hover {
                            background-color: #ffb733;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border: 1px solid #ffeaa7;
                            color: #856404;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px 30px;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                        }
                        .alternative-link {
                            color: #007bff;
                            word-break: break-all;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Recuperación de Contraseña</h1>
                        </div>
                        
                        <div class="content">
                            <h2>Hola ${userName || 'Usuario'},</h2>
                            
                            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en nuestro e-commerce.</p>
                            
                            <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="reset-button">
                                    🔑 Restablecer Contraseña
                                </a>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Importante:</strong>
                                <ul>
                                    <li>Este enlace expirará en <strong>1 hora</strong></li>
                                    <li>Solo puedes usar este enlace una vez</li>
                                    <li>No podrás usar tu contraseña anterior</li>
                                    <li>Si no solicitaste este cambio, ignora este correo</li>
                                </ul>
                            </div>
                            
                            <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                            <p class="alternative-link">${resetUrl}</p>
                            
                            <p>Si no solicitaste este restablecimiento de contraseña, puedes ignorar este correo de forma segura.</p>
                        </div>
                        
                        <div class="footer">
                            <p>Este correo fue enviado automáticamente, por favor no respondas.</p>
                            <p>© 2025 E-commerce. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email de recuperación enviado:', result.messageId);
            return {
                success: true,
                messageId: result.messageId
            };
        } catch (error) {
            console.error('Error al enviar email:', error);
            throw error;
        }
    }

    async sendPasswordChangeConfirmation(email, userName) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Contraseña Cambiada Exitosamente - E-commerce',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Contraseña Cambiada</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        }
                        .header {
                            background-color: #1da81d;
                            color: #ffffff;
                            padding: 30px;
                            text-align: center;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px 30px;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Contraseña Actualizada</h1>
                        </div>
                        
                        <div class="content">
                            <h2>Hola ${userName || 'Usuario'},</h2>
                            
                            <p>Tu contraseña ha sido cambiada exitosamente.</p>
                            
                            <p>Fecha y hora: <strong>${new Date().toLocaleString()}</strong></p>
                            
                            <p>Si no realizaste este cambio, contacta inmediatamente con nuestro soporte.</p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2025 E-commerce. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email de confirmación enviado:', result.messageId);
            return {
                success: true,
                messageId: result.messageId
            };
        } catch (error) {
            console.error('Error al enviar email de confirmación:', error);
            throw error;
        }
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Servidor de email listo para enviar correos');
            return true;
        } catch (error) {
            console.error('Error en la configuración del email:', error);
            return false;
        }
    }
}

export default EmailService;
