import fs from 'fs';
import CartDAO from './interfaces/CartDAO.js';
import { CartDTO, CartItemDTO } from '../dto/CartDTO.js';
import { ErrorResponseDTO } from '../dto/ResponseDTO.js';

class CartFSManager extends CartDAO {
    
    constructor(file = './data/carts.json', productDAO) {
        super();
        this.file = file;
        this.productDAO = productDAO;
    }

    async getAllCarts() {
        try {
            const carts = await fs.promises.readFile(this.file, 'utf-8');
            const parsedCarts = JSON.parse(carts);
            return parsedCarts.map(cart => new CartDTO(cart).toResponse());
        } catch (error) {
            console.error(error.message);
            throw new ErrorResponseDTO('Error al obtener carritos desde el archivo');
        }
    }

    // Método auxiliar para obtener carritos sin DTOs
    async getAllCartsFromFile() {
        try {
            const carts = await fs.promises.readFile(this.file, 'utf-8');
            return JSON.parse(carts);
        } catch (error) {
            console.error(error.message);
            return [];
        }
    }

    async getProductsFromCartByID(cid) {
        try {
            const carts = await this.getAllCartsFromFile();

            const cartFilter = carts.filter(cart => cart.id == cid);

            if (cartFilter.length > 0) {
                return new CartDTO(cartFilter[0]);
            }

            throw new Error(`El carrito ${cid} no existe!`);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async createCart() {
        try {
            const carts = await this.getAllCartsFromFile();

            const newCart = {
                id: this.getCartID(carts),
                products: []
            };

            carts.push(newCart);

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(carts, null, '\t'));
                return new CartDTO(newCart);
            } catch (error) {
                throw new Error('Error al crear el carrito');
            }
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    getCartID(carts) {
        const cartsLength = carts.length;
        if (cartsLength > 0) {
            return parseInt(carts[cartsLength - 1].id) + 1;
        }
        return 1;
    }

    async addProductByID(cid, pid) {
        try {
            // Check if exist product
            await this.productDAO.getProductByID(pid);

            const carts = await this.getAllCartsFromFile();
            let i = 0;
            const cartFilter = carts.filter(
                (cart, index) => {
                    if (cart.id == cid) i = index;
                    return cart.id == cid;
                }
            );

            if (cartFilter.length > 0) {
                let exist = false;
                for (let key in carts[i].products) {
                    if (carts[i].products[key].product == pid) {
                        exist = true;
                        carts[i].products[key].quantity++;
                    }
                }

                if (!exist) {
                    carts[i].products.push({
                        product: pid,
                        quantity: 1
                    });
                }
            } else {
                throw new Error(`El carrito ${cid} no existe!`);
            }

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(carts, null, '\t'));
                return new CartDTO(carts[i]);
            } catch(e) {
                throw new Error('Error al actualizar el carrito');
            }
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async deleteProductByID(cid, pid) {
        try {
            await this.productDAO.getProductByID(pid);

            const carts = await this.getAllCartsFromFile();
            let i = 0;
            const cartFilter = carts.filter(
                (cart, index) => {
                    if (cart.id == cid) i = index;
                    return cart.id == cid;
                }
            );

            if (cartFilter.length > 0) {
                carts[i].products = carts[i].products.filter(item => item.product != pid);
            } else {
                throw new Error(`El carrito ${cid} no existe!`);
            }

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(carts, null, '\t'));
                return new CartDTO(carts[i]);
            } catch(e) {
                throw new Error('Error al actualizar el carrito');
            }
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

            // Validate if exist products
            for (let key in products) {
                await this.productDAO.getProductByID(products[key].product);
            }

            const carts = await this.getAllCartsFromFile();
            let i = 0;
            const cartFilter = carts.filter(
                (cart, index) => {
                    if (cart.id == cid) i = index;
                    return cart.id == cid;
                }
            );

            if (cartFilter.length > 0) {
                carts[i].products = products;
            } else {
                throw new Error(`El carrito ${cid} no existe!`);
            }

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(carts, null, '\t'));
                return new CartDTO(carts[i]);
            } catch(e) {
                throw new Error('Error al actualizar el carrito');
            }
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async updateProductByID(cid, pid, quantity) {
        try {
            if (!quantity || isNaN(parseInt(quantity))) {
                throw new Error(`La cantidad ingresada no es válida!`);
            }

            await this.productDAO.getProductByID(pid);

            const carts = await this.getAllCartsFromFile();
            let i = 0;
            const cartFilter = carts.filter(
                (cart, index) => {
                    if (cart.id == cid) i = index;
                    return cart.id == cid;
                }
            );

            if (cartFilter.length > 0) {
                let productFound = false;
                for (let key in carts[i].products) {
                    if (carts[i].products[key].product == pid) {
                        carts[i].products[key].quantity = parseInt(quantity);
                        productFound = true;
                        break;
                    }
                }

                if (!productFound) {
                    throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);
                }
            } else {
                throw new Error(`El carrito ${cid} no existe!`);
            }

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(carts, null, '\t'));
                return new CartDTO(carts[i]);
            } catch(e) {
                throw new Error('Error al actualizar el carrito');
            }
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async deleteAllProducts(cid) {
        try {
            const carts = await this.getAllCartsFromFile();
            let i = 0;
            const cartFilter = carts.filter(
                (cart, index) => {
                    if (cart.id == cid) i = index;
                    return cart.id == cid;
                }
            );

            if (cartFilter.length > 0) {
                carts[i].products = [];
            } else {
                throw new Error(`El carrito ${cid} no existe!`);
            }

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(carts, null, '\t'));
                return new CartDTO(carts[i]);
            } catch(e) {
                throw new Error('Error al actualizar el carrito');
            }
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
        try {
            const carts = await this.getAllCartsFromFile();
            const cartsFilter = carts.filter(cart => cart.id != id);

            if (carts.length === cartsFilter.length) {
                throw new Error(`El carrito ${id} no existe!`);
            }

            await fs.promises.writeFile(this.file, JSON.stringify(cartsFilter, null, '\t'));
            return { success: true, message: `Carrito ${id} eliminado correctamente` };
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }
}

export { CartFSManager };