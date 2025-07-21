/**
 * DTO para productos
 * Define la estructura de datos para transferir información de productos
 */
class ProductDTO {
    constructor(product) {
        this.id = product._id || product.id;
        this.title = product.title;
        this.description = product.description;
        this.code = product.code;
        this.price = product.price;
        this.stock = product.stock;
        this.category = product.category;
        this.thumbnails = product.thumbnails || [];
        this.status = product.status !== undefined ? product.status : true;
    }

    // Método para validar los datos del producto
    static validate(productData) {
        const errors = [];

        if (!productData.title || typeof productData.title !== 'string') {
            errors.push('El título es requerido y debe ser una cadena de texto');
        }

        if (!productData.description || typeof productData.description !== 'string') {
            errors.push('La descripción es requerida y debe ser una cadena de texto');
        }

        if (!productData.code || typeof productData.code !== 'string') {
            errors.push('El código es requerido y debe ser una cadena de texto');
        }

        if (!productData.price || typeof productData.price !== 'number' || productData.price <= 0) {
            errors.push('El precio es requerido y debe ser un número mayor a 0');
        }

        if (productData.stock === undefined || typeof productData.stock !== 'number' || productData.stock < 0) {
            errors.push('El stock es requerido y debe ser un número mayor o igual a 0');
        }

        if (!productData.category || typeof productData.category !== 'string') {
            errors.push('La categoría es requerida y debe ser una cadena de texto');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Método para crear un DTO desde datos de entrada
    static fromRequest(requestData) {
        return new ProductDTO({
            title: requestData.title,
            description: requestData.description,
            code: requestData.code,
            price: parseFloat(requestData.price),
            stock: parseInt(requestData.stock),
            category: requestData.category,
            thumbnails: requestData.thumbnails || [],
            status: requestData.status !== undefined ? Boolean(requestData.status) : true
        });
    }

    // Método para convertir a objeto plano para la base de datos
    toDatabase() {
        return {
            title: this.title,
            description: this.description,
            code: this.code,
            price: this.price,
            stock: this.stock,
            category: this.category,
            thumbnails: this.thumbnails,
            status: this.status
        };
    }

    // Método para la respuesta de la API
    toResponse() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            code: this.code,
            price: this.price,
            stock: this.stock,
            category: this.category,
            thumbnails: this.thumbnails,
            status: this.status
        };
    }
}

export default ProductDTO;
