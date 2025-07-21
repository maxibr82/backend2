import DAOFactory from '../dao/factory/DAOFactory.js';
import ProductDTO from '../dto/ProductDTO.js';
import { PaginationResponseDTO, ErrorResponseDTO, SuccessResponseDTO } from '../dto/ResponseDTO.js';

/**
 * Servicio de productos que maneja la lógica de negocio
 * Utiliza el patrón Factory para obtener el DAO apropiado
 */
class ProductService {
    constructor() {
        this.productDAO = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            this.productDAO = await DAOFactory.createProductDAO();
            this.initialized = true;
        }
    }

    async getAllProducts(params) {
        await this.initialize();
        
        try {
            const result = await this.productDAO.getAllProducts(params);
            return result;
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al obtener productos: ${error.message}`);
        }
    }

    async getProductById(pid) {
        await this.initialize();
        
        try {
            const product = await this.productDAO.getProductByID(pid);
            return new SuccessResponseDTO(product.toResponse ? product.toResponse() : product);
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al obtener el producto: ${error.message}`);
        }
    }

    async createProduct(productData) {
        await this.initialize();
        
        try {
            const product = await this.productDAO.createProduct(productData);
            return new SuccessResponseDTO(
                product.toResponse ? product.toResponse() : product, 
                'Producto creado exitosamente'
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al crear el producto: ${error.message}`);
        }
    }

    async updateProduct(pid, productUpdate) {
        await this.initialize();
        
        try {
            const product = await this.productDAO.updateProduct(pid, productUpdate);
            return new SuccessResponseDTO(
                product.toResponse ? product.toResponse() : product,
                'Producto actualizado exitosamente'
            );
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al actualizar el producto: ${error.message}`);
        }
    }

    async deleteProduct(pid) {
        await this.initialize();
        
        try {
            const result = await this.productDAO.deleteProduct(pid);
            return new SuccessResponseDTO(result, 'Producto eliminado exitosamente');
        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            throw new ErrorResponseDTO(`Error al eliminar el producto: ${error.message}`);
        }
    }

    // Método para obtener información sobre el tipo de persistencia actual
    async getPersistenceInfo() {
        return DAOFactory.getPersistenceInfo();
    }
}

export default ProductService;
