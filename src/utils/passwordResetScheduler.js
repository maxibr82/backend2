import cron from 'node-cron';
import PasswordResetService from '../services/PasswordResetService.js';

const passwordResetService = new PasswordResetService();

/**
 * Tarea programada para limpiar tokens expirados
 * Se ejecuta cada hora
 */
const setupPasswordResetCleanup = () => {
    // Ejecutar cada hora
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🧹 Ejecutando limpieza de tokens de recuperación...');
            const deletedCount = await passwordResetService.cleanupExpiredTokens();
            console.log(`✅ Limpieza completada. Tokens eliminados: ${deletedCount}`);
        } catch (error) {
            console.error('❌ Error en limpieza de tokens:', error);
        }
    });
    
    console.log('📅 Tarea programada de limpieza de tokens configurada (cada hora)');
};

export { setupPasswordResetCleanup };
