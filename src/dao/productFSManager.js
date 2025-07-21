import fs from 'fs';
import ProductDAO from './interfaces/ProductDAO.js';
import ProductDTO from '../dto/ProductDTO.js';
import { PaginationResponseDTO, ErrorResponseDTO } from '../dto/ResponseDTO.js';

class ProductFSManager extends ProductDAO {
    
    constructor(file = './data/products.json') {
        super();
        this.file = file;
    }

    async getAllProducts(params = {}) {
        try {
            const products = await fs.promises.readFile(this.file, 'utf-8');
            let parsedProducts = JSON.parse(products);
            
            // Convertir a DTOs
            parsedProducts = parsedProducts.map(product => new ProductDTO(product).toResponse());

            // Simular paginación para FS
            const page = params.page ? parseInt(params.page) : 1;
            const limit = params.limit ? parseInt(params.limit) : 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            const paginatedProducts = parsedProducts.slice(startIndex, endIndex);
            const totalPages = Math.ceil(parsedProducts.length / limit);

            const paginationData = {
                docs: paginatedProducts,
                totalDocs: parsedProducts.length,
                limit: limit,
                totalPages: totalPages,
                page: page,
                pagingCounter: startIndex + 1,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null
            };

            return new PaginationResponseDTO(paginationData);
        } catch (error) {
            console.error(error.message);
            throw new ErrorResponseDTO('Error al obtener productos desde el archivo');
        }
    }

    async getProductByID(pid) {
        try {
            const products = await this.getAllProductsFromFile();

            const productFilter = products.filter(product => product.id == pid);

            if (productFilter.length > 0) {
                return new ProductDTO(productFilter[0]);
            }

            throw new Error(`El producto ${pid} no existe!`);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    // Método auxiliar para obtener productos sin paginación
    async getAllProductsFromFile() {
        try {
            const products = await fs.promises.readFile(this.file, 'utf-8');
            return JSON.parse(products);
        } catch (error) {
            console.error(error.message);
            return [];
        }
    }

    async createProduct(product) {
        try {
            // Validar datos usando DTO
            const validation = ProductDTO.validate(product);
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            const products = await this.getAllProductsFromFile();

            const productDTO = ProductDTO.fromRequest(product);
            const newProduct = {
                id: this.getProductID(products),
                ...productDTO.toDatabase()
            };

            products.push(newProduct);

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(products, null, '\t'));
                return new ProductDTO(newProduct);
            } catch(e) {
                throw new Error('Error al crear el producto');
            }
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    getProductID(products) {
        const productsLength = products.length;
        if (productsLength > 0) {
            return parseInt(products[productsLength - 1].id) + 1;
        }
        return 1;
    }

    async updateProduct(pid, productUpdate) {
        try {
            const products = await this.getAllProductsFromFile();

            let i = 0;
            const productFilter = products.filter(
                (product, index) => {
                    i = index;
                    return product.id == pid
                }
            );

            if (productFilter.length > 0) {
                const {title, description, code, price, status, stock, category, thumbnails} = productUpdate;

                products[i].title = title ? title : products[i].title;
                products[i].description = description ? description : products[i].description;
                products[i].code = code ? code : products[i].code;
                products[i].price = price ? price : products[i].price;
                products[i].status = status !== undefined ? status : products[i].status;
                products[i].stock = stock !== undefined ? stock : products[i].stock;
                products[i].category = category ? category : products[i].category;
                products[i].thumbnails = thumbnails ? thumbnails : products[i].thumbnails;
            } else {
                throw new Error(`El producto ${pid} no existe!`);
            }

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(products, null, '\t'));
                return new ProductDTO(products[i]);
            } catch(e) {
                throw new Error('Error al actualizar el producto');
            }
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async deleteProduct(pid) {
        try {
            const products = await this.getAllProductsFromFile();

            const productsFilter = products.filter(product => product.id != pid);

            if (products.length === productsFilter.length) {
                throw new Error(`El producto ${pid} no existe!`);
            }

            try {
                await fs.promises.writeFile(this.file, JSON.stringify(productsFilter, null, '\t'));
                return { success: true, message: `Producto ${pid} eliminado correctamente` };
            } catch(e) {
                throw new Error(`Error al eliminar el producto ${pid}`);
            }
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    // Implementación de métodos de BaseDAO
    async create(data) {
        return this.createProduct(data);
    }

    async getById(id) {
        return this.getProductByID(id);
    }

    async getAll(params = {}) {
        return this.getAllProducts(params);
    }

    async update(id, data) {
        return this.updateProduct(id, data);
    }

    async delete(id) {
        return this.deleteProduct(id);
    }
}

export { ProductFSManager };