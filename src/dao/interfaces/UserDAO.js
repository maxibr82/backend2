import { BaseDAO } from './BaseDAO.js';

/**
 * Interfaz específica para User DAO
 * Define métodos específicos para la gestión de usuarios
 */
class UserDAO extends BaseDAO {
    constructor() {
        super();
        if (this.constructor === UserDAO) {
            throw new Error('UserDAO es una clase abstracta y no puede ser instanciada directamente');
        }
    }

    async findByEmail(email) {
        throw new Error('El método findByEmail debe ser implementado');
    }

    async findByEmailAndPassword(email, password) {
        throw new Error('El método findByEmailAndPassword debe ser implementado');
    }

    async updatePassword(id, newPassword) {
        throw new Error('El método updatePassword debe ser implementado');
    }

    async updateRole(id, newRole) {
        throw new Error('El método updateRole debe ser implementado');
    }
}

export { UserDAO };
