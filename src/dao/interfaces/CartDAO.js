import BaseDAO from './BaseDAO.js';

/**
 * Interfaz específica para DAOs de carritos
 * Extiende BaseDAO con métodos específicos para carritos
 */
class CartDAO extends BaseDAO {
    constructor() {
        super();
        if (this.constructor === CartDAO) {
            throw new Error('CartDAO es una clase abstracta y no puede ser instanciada directamente');
        }
    }

    async getAllCarts() {
        throw new Error('El método getAllCarts debe ser implementado');
    }

    async getProductsFromCartByID(cid) {
        throw new Error('El método getProductsFromCartByID debe ser implementado');
    }

    async createCart() {
        throw new Error('El método createCart debe ser implementado');
    }

    async addProductByID(cid, pid) {
        throw new Error('El método addProductByID debe ser implementado');
    }

    async deleteProductByID(cid, pid) {
        throw new Error('El método deleteProductByID debe ser implementado');
    }

    async updateAllProducts(cid, products) {
        throw new Error('El método updateAllProducts debe ser implementado');
    }

    async updateProductByID(cid, pid, quantity) {
        throw new Error('El método updateProductByID debe ser implementado');
    }

    async deleteAllProducts(cid) {
        throw new Error('El método deleteAllProducts debe ser implementado');
    }
}

export default CartDAO;
