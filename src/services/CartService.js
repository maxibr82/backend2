import DAOFactory from '../dao/factory/DAOFactory.js';
import { CartDTO, CartItemDTO } from '../dto/CartDTO.js';
import { ErrorResponseDTO, SuccessResponseDTO } from '../dto/ResponseDTO.js';

/**
 * Servicio de carritos que maneja la lógica de negocio
 * Utiliza el patrón Factory para obtener el DAO apropiado
 */
class CartService {
    constructor() {
        this.cartDAO = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            this.cartDAO = await DAOFactory.createCartDAO();
            this.initialized = true;
        }
    }

    async getAllCarts() {
        await this.initialize();
        
        try {
            const carts = await this.cartDAO.getAllCarts();
            return new SuccessResponseDTO('Carritos obtenidos exitosamente', carts);
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al obtener carritos: ${error.message}`);
        }
    }

    async getCartById(cid) {
        await this.initialize();
        
        try {
            const cart = await this.cartDAO.getProductsFromCartByID(cid);
            return new SuccessResponseDTO('Carrito obtenido exitosamente', cart.toResponse ? cart.toResponse() : cart);
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al obtener el carrito: ${error.message}`);
        }
    }

    async createCart() {
        await this.initialize();
        
        try {
            const cart = await this.cartDAO.createCart();
            return new SuccessResponseDTO(
                'Carrito creado exitosamente',
                cart.toResponse ? cart.toResponse() : cart
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al crear el carrito: ${error.message}`);
        }
    }

    async addProductToCart(cid, pid) {
        await this.initialize();
        
        try {
            const cart = await this.cartDAO.addProductByID(cid, pid);
            return new SuccessResponseDTO(
                'Producto agregado al carrito exitosamente',
                cart.toResponse ? cart.toResponse() : cart
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al agregar producto al carrito: ${error.message}`);
        }
    }

    async removeProductFromCart(cid, pid) {
        await this.initialize();
        
        try {
            const cart = await this.cartDAO.deleteProductByID(cid, pid);
            return new SuccessResponseDTO(
                cart.toResponse ? cart.toResponse() : cart,
                'Producto eliminado del carrito exitosamente'
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al eliminar producto del carrito: ${error.message}`);
        }
    }

    async updateAllProductsInCart(cid, products) {
        await this.initialize();
        
        try {
            const cart = await this.cartDAO.updateAllProducts(cid, products);
            return new SuccessResponseDTO(
                cart.toResponse ? cart.toResponse() : cart,
                'Productos del carrito actualizados exitosamente'
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al actualizar productos del carrito: ${error.message}`);
        }
    }

    async updateProductQuantityInCart(cid, pid, quantity) {
        await this.initialize();
        
        try {
            const cart = await this.cartDAO.updateProductByID(cid, pid, quantity);
            return new SuccessResponseDTO(
                cart.toResponse ? cart.toResponse() : cart,
                'Cantidad del producto actualizada exitosamente'
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al actualizar cantidad del producto: ${error.message}`);
        }
    }

    async clearCart(cid) {
        await this.initialize();
        
        try {
            const cart = await this.cartDAO.deleteAllProducts(cid);
            return new SuccessResponseDTO(
                cart.toResponse ? cart.toResponse() : cart,
                'Carrito vaciado exitosamente'
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al vaciar el carrito: ${error.message}`);
        }
    }

    async deleteCart(cid) {
        await this.initialize();
        
        try {
            const result = await this.cartDAO.delete(cid);
            return new SuccessResponseDTO(result, 'Carrito eliminado exitosamente');
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al eliminar el carrito: ${error.message}`);
        }
    }

    // Método para obtener información sobre el tipo de persistencia actual
    async getPersistenceInfo() {
        return DAOFactory.getPersistenceInfo();
    }
}

export default CartService;
