import { Router } from 'express';
import ProductService from '../services/ProductService.js';
import { uploader } from '../utils/multerUtil.js';
import { ErrorResponseDTO, SuccessResponseDTO } from '../dto/ResponseDTO.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { logAdminActions, validateProductData, validatePartialProductData, validateObjectId } from '../middleware/validationMiddleware.js';

const router = Router();
const productService = new ProductService();

// Aplicar middleware de autenticación de admin a todas las rutas
router.use(requireAdminAuth);

// GET /admin/products - Obtener todos los productos (con filtros avanzados para admin)
router.get('/', 
    logAdminActions('GET_ALL_PRODUCTS'),
    async (req, res) => {
        try {
            // Para la vista de administración, establecer un límite alto por defecto
            const adminParams = {
                ...req.query,
                limit: req.query.limit || 1000, // Límite alto por defecto para admin
                page: req.query.page || 1
            };
            
            const result = await productService.getAllProducts(adminParams);
            
            // Log de la acción
            console.log(`Admin ${req.user.email} consultó productos - Filtros:`, adminParams);
            
            res.json(result.toResponse ? result.toResponse() : result);
        } catch (error) {
            console.error('Error en GET /admin/products:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Error interno del servidor al obtener productos'
                });
            }
        }
    }
);

// GET /admin/products/:pid - Obtener producto por ID
router.get('/:pid', 
    validateObjectId('pid'),
    logAdminActions('GET_PRODUCT_BY_ID'),
    async (req, res) => {
        try {
            const result = await productService.getProductById(req.params.pid);
            
            console.log(`Admin ${req.user.email} consultó producto ID: ${req.params.pid}`);
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en GET /admin/products/:pid:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Error interno del servidor al obtener producto'
                });
            }
        }
    }
);

// POST /admin/products - Crear nuevo producto
router.post('/', 
    uploader.array('thumbnails', 5), // Permitir hasta 5 imágenes para admin
    validateProductData,
    logAdminActions('CREATE_PRODUCT'),
    async (req, res) => {
        try {
            // Procesar archivos subidos
            if (req.files && req.files.length > 0) {
                req.body.thumbnails = req.files.map(file => file.path);
            }
            
            // Agregar información del admin que creó el producto
            req.body.createdBy = req.user._id;
            req.body.createdByEmail = req.user.email;
            req.body.createdAt = new Date();
            
            const result = await productService.createProduct(req.body);
            
            console.log(`Admin ${req.user.email} creó producto:`, req.body.title);
            
            res.status(201).json(result.toResponse());
        } catch (error) {
            console.error('Error en POST /admin/products:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Error interno del servidor al crear producto'
                });
            }
        }
    }
);

// PUT /admin/products/:pid - Actualizar producto completo
router.put('/:pid', 
    validateObjectId('pid'),
    uploader.array('thumbnails', 5),
    validateProductData,
    logAdminActions('UPDATE_PRODUCT'),
    async (req, res) => {
        try {
            // Procesar archivos subidos
            if (req.files && req.files.length > 0) {
                req.body.thumbnails = req.files.map(file => file.path);
            }
            
            // Agregar información de actualización
            req.body.updatedBy = req.user._id;
            req.body.updatedByEmail = req.user.email;
            req.body.updatedAt = new Date();
            
            const result = await productService.updateProduct(req.params.pid, req.body);
            
            console.log(`Admin ${req.user.email} actualizó producto ID: ${req.params.pid}`);
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en PUT /admin/products/:pid:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Error interno del servidor al actualizar producto'
                });
            }
        }
    }
);

// PATCH /admin/products/:pid - Actualizar campos específicos del producto
router.patch('/:pid', 
    validateObjectId('pid'),
    uploader.array('thumbnails', 5),
    validatePartialProductData,
    logAdminActions('PATCH_PRODUCT'),
    async (req, res) => {
        try {
            // Validar que al menos un campo esté presente
            const allowedFields = ['title', 'description', 'price', 'category', 'stock', 'status', 'thumbnails'];
            const updateFields = Object.keys(req.body).filter(key => allowedFields.includes(key));
            
            if (updateFields.length === 0 && (!req.files || req.files.length === 0)) {
                const errorResponse = new ErrorResponseDTO('Debe proporcionar al menos un campo para actualizar');
                return res.status(400).json(errorResponse.toResponse());
            }
            
            // Procesar archivos subidos
            if (req.files && req.files.length > 0) {
                req.body.thumbnails = req.files.map(file => file.path);
            }
            
            // Validar campos específicos si están presentes
            if (req.body.price !== undefined) {
                const price = parseFloat(req.body.price);
                if (isNaN(price) || price <= 0) {
                    const errorResponse = new ErrorResponseDTO('El precio debe ser un número positivo');
                    return res.status(400).json(errorResponse.toResponse());
                }
                req.body.price = price;
            }
            
            if (req.body.stock !== undefined) {
                const stock = parseInt(req.body.stock);
                if (isNaN(stock) || stock < 0) {
                    const errorResponse = new ErrorResponseDTO('El stock debe ser un número no negativo');
                    return res.status(400).json(errorResponse.toResponse());
                }
                req.body.stock = stock;
            }
            
            // Agregar información de actualización
            req.body.updatedBy = req.user._id;
            req.body.updatedByEmail = req.user.email;
            req.body.updatedAt = new Date();
            
            const result = await productService.updateProduct(req.params.pid, req.body);
            
            console.log(`Admin ${req.user.email} actualizó campos específicos del producto ID: ${req.params.pid}`, updateFields);
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en PATCH /admin/products/:pid:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Error interno del servidor al actualizar producto'
                });
            }
        }
    }
);

// DELETE /admin/products/:pid - Eliminar producto
router.delete('/:pid', 
    validateObjectId('pid'),
    logAdminActions('DELETE_PRODUCT'),
    async (req, res) => {
        try {
            const result = await productService.deleteProduct(req.params.pid);
            
            console.log(`Admin ${req.user.email} eliminó producto ID: ${req.params.pid}`);
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en DELETE /admin/products/:pid:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Error interno del servidor al eliminar producto'
                });
            }
        }
    }
);

// DELETE /admin/products - Eliminar múltiples productos
router.delete('/', 
    logAdminActions('DELETE_MULTIPLE_PRODUCTS'),
    async (req, res) => {
        try {
            const { productIds } = req.body;
            
            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                const errorResponse = new ErrorResponseDTO('Debe proporcionar un array de IDs de productos');
                return res.status(400).json(errorResponse.toResponse());
            }
            
            // Validar que todos los IDs sean válidos
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            const invalidIds = productIds.filter(id => !objectIdRegex.test(id));
            
            if (invalidIds.length > 0) {
                const errorResponse = new ErrorResponseDTO(`IDs inválidos: ${invalidIds.join(', ')}`);
                return res.status(400).json(errorResponse.toResponse());
            }
            
            const results = [];
            const errors = [];
            
            for (const productId of productIds) {
                try {
                    const result = await productService.deleteProduct(productId);
                    results.push({ productId, status: 'success' });
                } catch (error) {
                    errors.push({ productId, status: 'error', message: error.message });
                }
            }
            
            console.log(`Admin ${req.user.email} eliminó múltiples productos:`, productIds);
            
            const response = new SuccessResponseDTO('Operación de eliminación completada', {
                successful: results,
                failed: errors,
                totalProcessed: productIds.length,
                successCount: results.length,
                errorCount: errors.length
            });
            
            res.json(response.toResponse());
        } catch (error) {
            console.error('Error en DELETE /admin/products:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor al eliminar productos'
            });
        }
    }
);

export default router;
