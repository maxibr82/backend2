import BaseDAO from './BaseDAO.js';

/**
 * Interfaz específica para DAOs de productos
 * Extiende BaseDAO con métodos específicos para productos
 */
class ProductDAO extends BaseDAO {
    constructor() {
        super();
        if (this.constructor === ProductDAO) {
            throw new Error('ProductDAO es una clase abstracta y no puede ser instanciada directamente');
        }
    }

    async getAllProducts(params) {
        throw new Error('El método getAllProducts debe ser implementado');
    }

    async getProductByID(pid) {
        throw new Error('El método getProductByID debe ser implementado');
    }

    async createProduct(product) {
        throw new Error('El método createProduct debe ser implementado');
    }

    async updateProduct(pid, productUpdate) {
        throw new Error('El método updateProduct debe ser implementado');
    }

    async deleteProduct(pid) {
        throw new Error('El método deleteProduct debe ser implementado');
    }
}

export default ProductDAO;
