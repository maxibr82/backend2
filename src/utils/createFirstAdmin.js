import mongoose from 'mongoose';
import { userModel } from '../dao/models/userModel.js';
import { createHash } from './hashUtil.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para crear el primer usuario administrador
 * Este script debe ejecutarse solo una vez para inicializar el sistema
 */
async function createFirstAdmin() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a MongoDB Atlas');

        // Verificar si ya existe un administrador
        const existingAdmin = await userModel.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Ya existe un usuario administrador en el sistema');
            console.log(`Email del admin existente: ${existingAdmin.email}`);
            return;
        }

        // Datos del primer administrador
        const adminData = {
            first_name: 'Admin',
            last_name: 'System',
            email: 'admin@ecommerce.com',
            age: 30,
            password: createHash('admin123'), // Cambiar esta contraseña en producción
            role: 'admin'
        };

        // Crear el usuario administrador
        const newAdmin = await userModel.create(adminData);
        console.log('Usuario administrador creado exitosamente');
        console.log('=====================================');
        console.log('Credenciales de acceso:');
        console.log(`Email: ${adminData.email}`);
        console.log('Password: admin123');
        console.log('=====================================');
        console.log('IMPORTANTE: Cambiar la contraseña en producción');
        console.log('=====================================');

    } catch (error) {
        console.error('Error al crear el usuario administrador:', error);
    } finally {
        // Cerrar la conexión
        await mongoose.disconnect();
        console.log('Conexión a MongoDB cerrada');
    }
}

// Ejecutar la función si el script es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    createFirstAdmin();
}

export { createFirstAdmin };
