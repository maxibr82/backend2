import productModel from "./models/productModel.js";
import ProductDAO from './interfaces/ProductDAO.js';
import ProductDTO from '../dto/ProductDTO.js';
import { PaginationResponseDTO, ErrorResponseDTO } from '../dto/ResponseDTO.js';
import dotenv from 'dotenv';

dotenv.config();

class ProductDBManager extends ProductDAO {

    async getAllProducts(params) {
        try {
            const paginate = {
                page: params.page ? parseInt(params.page) : 1,
                limit: params.limit ? parseInt(params.limit) : 10,
            }

            if (params.sort && (params.sort === 'asc' || params.sort === 'desc')) {
                paginate.sort = { price: params.sort };
            }

            const products = await productModel.paginate({}, paginate);

            // Convertir productos a DTOs
            products.docs = products.docs.map(product => new ProductDTO(product).toResponse());

            // Usar el puerto correcto de las variables de entorno
            const port = process.env.PORT || 3000;
            const baseUrl = `http://localhost:${port}`;
            
            products.prevLink = products.hasPrevPage ? `${baseUrl}/products?page=${products.prevPage}` : null;
            products.nextLink = products.hasNextPage ? `${baseUrl}/products?page=${products.nextPage}` : null;

            //Add limit
            if (products.prevLink && paginate.limit !== 10) products.prevLink += `&limit=${paginate.limit}`;
            if (products.nextLink && paginate.limit !== 10) products.nextLink += `&limit=${paginate.limit}`;

            //Add sort
            if (products.prevLink && paginate.sort) products.prevLink += `&sort=${params.sort}`;
            if (products.nextLink && paginate.sort) products.nextLink += `&sort=${params.sort}`;

            return new PaginationResponseDTO(products);
        } catch (error) {
            throw new ErrorResponseDTO(`Error al obtener productos: ${error.message}`);
        }
    }

    async getProductByID(pid) {
        try {
            const product = await productModel.findOne({_id: pid});

            if (!product) {
                throw new Error(`El producto ${pid} no existe!`);
            }

            return new ProductDTO(product);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async createProduct(product) {
        try {
            // Validar datos usando DTO
            const validation = ProductDTO.validate(product);
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            const productDTO = ProductDTO.fromRequest(product);
            const createdProduct = await productModel.create(productDTO.toDatabase());
            
            return new ProductDTO(createdProduct);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async updateProduct(pid, productUpdate) {
        try {
            const result = await productModel.updateOne({_id: pid}, productUpdate);
            
            if (result.matchedCount === 0) {
                throw new Error(`El producto ${pid} no existe!`);
            }

            const updatedProduct = await productModel.findOne({_id: pid});
            return new ProductDTO(updatedProduct);
        } catch (error) {
            throw new ErrorResponseDTO(error.message);
        }
    }

    async deleteProduct(pid) {
        try {
            const result = await productModel.deleteOne({_id: pid});

            if (result.deletedCount === 0) {
                throw new Error(`El producto ${pid} no existe!`);
            }

            return { success: true, message: `Producto ${pid} eliminado correctamente` };
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

export { ProductDBManager };