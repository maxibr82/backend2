/**
 * Interfaz base para todos los DAOs
 * Define los métodos comunes que deben implementar todos los DAOs
 */
class BaseDAO {
    constructor() {
        if (this.constructor === BaseDAO) {
            throw new Error('BaseDAO es una clase abstracta y no puede ser instanciada directamente');
        }
    }

    async create(data) {
        throw new Error('El método create debe ser implementado');
    }

    async getById(id) {
        throw new Error('El método getById debe ser implementado');
    }

    async getAll(params = {}) {
        throw new Error('El método getAll debe ser implementado');
    }

    async update(id, data) {
        throw new Error('El método update debe ser implementado');
    }

    async delete(id) {
        throw new Error('El método delete debe ser implementado');
    }
}

export { BaseDAO };
export default BaseDAO;
