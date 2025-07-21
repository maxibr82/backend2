import { ErrorResponseDTO } from '../dto/ResponseDTO.js';

// Middleware para logging de acciones de administrador
export const logAdminActions = (action) => {
    return (req, res, next) => {
        const timestamp = new Date().toISOString();
        const adminEmail = req.user?.email || 'Unknown';
        const adminId = req.user?._id || 'Unknown';
        
        console.log(`[ADMIN ACTION] ${timestamp} - Admin: ${adminEmail} (${adminId}) - Action: ${action} - Path: ${req.originalUrl} - Method: ${req.method}`);
        
        // También podríamos guardar esto en una base de datos de auditoría
        req.adminAction = {
            timestamp,
            adminId,
            adminEmail,
            action,
            path: req.originalUrl,
            method: req.method,
            params: req.params,
            body: req.body
        };
        
        next();
    };
};

// Middleware para validar parámetros de entrada
export const validateProductData = (req, res, next) => {
    const { title, description, price, category, stock } = req.body;
    
    const errors = [];
    
    if (!title || title.trim() === '') {
        errors.push('El título es requerido');
    }
    
    if (!description || description.trim() === '') {
        errors.push('La descripción es requerida');
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        errors.push('El precio debe ser un número positivo');
    }
    
    if (!category || category.trim() === '') {
        errors.push('La categoría es requerida');
    }
    
    if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
        errors.push('El stock debe ser un número no negativo');
    }
    
    if (errors.length > 0) {
        const errorResponse = new ErrorResponseDTO(`Datos inválidos: ${errors.join(', ')}`);
        return res.status(400).json(errorResponse.toResponse());
    }
    
    // Limpiar y formatear los datos
    req.body.title = title.trim();
    req.body.description = description.trim();
    req.body.price = parseFloat(price);
    req.body.category = category.trim();
    if (stock !== undefined) {
        req.body.stock = parseInt(stock);
    }
    
    next();
};

// Middleware para validar datos de actualización parcial (PATCH)
export const validatePartialProductData = (req, res, next) => {
    const { title, description, price, category, stock } = req.body;
    
    const errors = [];
    
    // Solo validar campos que están presentes
    if (title !== undefined && (!title || title.trim() === '')) {
        errors.push('El título no puede estar vacío');
    }
    
    if (description !== undefined && (!description || description.trim() === '')) {
        errors.push('La descripción no puede estar vacía');
    }
    
    if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
        errors.push('El precio debe ser un número positivo');
    }
    
    if (category !== undefined && (!category || category.trim() === '')) {
        errors.push('La categoría no puede estar vacía');
    }
    
    if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
        errors.push('El stock debe ser un número no negativo');
    }
    
    if (errors.length > 0) {
        const errorResponse = new ErrorResponseDTO(`Datos inválidos: ${errors.join(', ')}`);
        return res.status(400).json(errorResponse.toResponse());
    }
    
    // Limpiar y formatear los datos que están presentes
    if (title !== undefined) req.body.title = title.trim();
    if (description !== undefined) req.body.description = description.trim();
    if (price !== undefined) req.body.price = parseFloat(price);
    if (category !== undefined) req.body.category = category.trim();
    if (stock !== undefined) req.body.stock = parseInt(stock);
    
    next();
};
// Middleware para validar ObjectId de MongoDB
export const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        // Expresión regular para validar ObjectId de MongoDB
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        
        if (!id || !objectIdRegex.test(id)) {
            const errorResponse = new ErrorResponseDTO(`ID inválido: ${id}`);
            return res.status(400).json(errorResponse.toResponse());
        }
        
        next();
    };
};
