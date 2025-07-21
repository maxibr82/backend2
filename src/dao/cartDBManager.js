import { cartModel } from "./models/cartModel.js";
import CartDAO from './interfaces/CartDAO.js';
import { CartDTO, CartItemDTO } from '../dto/CartDTO.js';
import { ErrorResponseDTO } from '../dto/ResponseDTO.js';

class CartDBManager extends CartDAO {

    constructor(productDBManager) {
        super();
        this.productDBManager = productDBManager;
    }

    async getAllCarts() {
        try {
            const carts = await cartModel.find();
            return carts.map(cart => new CartDTO(cart).toResponse());
        } catch (error) {
            throw new ErrorResponseDTO(`Error al obtener carritos: ${error.message}`);
        }
    }

    async getProductsFromCartByID(cid) {
        try {
            const cart = await cartModel.findOne({_id: cid}).populate('products.product');

            if (!cart) {
                throw new Error(`El carrito ${cid} no existe!`);
            }
            
            return new CartDTO(cart);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async createCart() {
        try {
            const newCart = await cartModel.create({products: []});
            return new CartDTO(newCart);
        } catch (error) {
            throw new ErrorResponseDTO(`Error al crear carrito: ${error.message}`);
        }
    }

    async addProductByID(cid, pid) {
        try {
            await this.productDBManager.getProductByID(pid);

            const cart = await cartModel.findOne({ _id: cid});

            if (!cart) {
                throw new Error(`El carrito ${cid} no existe!`);
            }
        
            let i = null;
            const result = cart.products.filter(
                (item, index) => {
                    if (item.product.toString() === pid) i = index;
                    return item.product.toString() === pid;
                }
            );

            if (result.length > 0) {
                cart.products[i].quantity += 1;
            } else {
                cart.products.push({
                    product: pid,
                    quantity: 1
                });
            }
            await cartModel.updateOne({ _id: cid }, { products: cart.products});

            return await this.getProductsFromCartByID(cid);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async deleteProductByID(cid, pid) {
        try {
            await this.productDBManager.getProductByID(pid);

            const cart = await cartModel.findOne({ _id: cid});

            if (!cart) {
                throw new Error(`El carrito ${cid} no existe!`);
            }
        
            const newProducts = cart.products.filter(item => item.product.toString() !== pid);

            await cartModel.updateOne({ _id: cid }, { products: newProducts});
            
            return await this.getProductsFromCartByID(cid);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async updateAllProducts(cid, products) {
        try {
            // Validar productos usando DTO
            const validation = CartDTO.validate({ products });
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            //Validate if exist products
            for (let key in products) {
                await this.productDBManager.getProductByID(products[key].product);
            }

            await cartModel.updateOne({ _id: cid }, { products: products });
            
            return await this.getProductsFromCartByID(cid);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async updateProductByID(cid, pid, quantity) {
        try {
            if (!quantity || isNaN(parseInt(quantity))) {
                throw new Error(`La cantidad ingresada no es válida!`);
            }

            await this.productDBManager.getProductByID(pid);

            const cart = await cartModel.findOne({ _id: cid});

            if (!cart) {
                throw new Error(`El carrito ${cid} no existe!`);
            }
        
            let i = null;
            const result = cart.products.filter(
                (item, index) => {
                    if (item.product.toString() === pid) i = index;
                    return item.product.toString() === pid;
                }
            );

            if (result.length === 0) {
                throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);
            }

            cart.products[i].quantity = parseInt(quantity);

            await cartModel.updateOne({ _id: cid }, { products: cart.products});

            return await this.getProductsFromCartByID(cid);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async deleteAllProducts(cid) {
        try {
            await cartModel.updateOne({ _id: cid }, { products: [] });
            
            return await this.getProductsFromCartByID(cid);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    // Implementación de métodos de BaseDAO
    async create(data) {
        return this.createCart();
    }

    async getById(id) {
        return this.getProductsFromCartByID(id);
    }

    async getAll(params = {}) {
        return this.getAllCarts();
    }

    async update(id, data) {
        return this.updateAllProducts(id, data.products);
    }

    async delete(id) {
        const result = await cartModel.deleteOne({_id: id});
        if (result.deletedCount === 0) {
            throw new ErrorResponseDTO(`El carrito ${id} no existe!`);
        }
        return { success: true, message: `Carrito ${id} eliminado correctamente` };
    }
}

export { CartDBManager };