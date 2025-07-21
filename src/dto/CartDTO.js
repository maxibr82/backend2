import ProductDTO from './ProductDTO.js';

/**
 * DTO para carritos
 * Define la estructura de datos para transferir información de carritos
 */
class CartDTO {
    constructor(cart) {
        // Asegurar que el ID siempre sea un string
        this.id = cart._id ? cart._id.toString() : (cart.id ? cart.id.toString() : null);
        this.products = cart.products ? cart.products.map(item => {
            // Si el producto está poblado (es un objeto completo), usar ProductDTO
            if (item.product && typeof item.product === 'object' && item.product._id) {
                return {
                    product: new ProductDTO(item.product).toResponse(),
                    quantity: item.quantity
                };
            }
            // Si es solo un ID, mantenerlo como está
            return {
                product: item.product,
                quantity: item.quantity
            };
        }) : [];
    }

    // Método para validar los datos del carrito
    static validate(cartData) {
        const errors = [];

        if (cartData.products && !Array.isArray(cartData.products)) {
            errors.push('Los productos deben ser un array');
        }

        if (cartData.products) {
            cartData.products.forEach((item, index) => {
                if (!item.product) {
                    errors.push(`El producto en la posición ${index} es requerido`);
                }
                
                if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    errors.push(`La cantidad en la posición ${index} debe ser un número mayor a 0`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Método para crear un DTO desde datos de entrada
    static fromRequest(requestData) {
        return new CartDTO({
            products: requestData.products || []
        });
    }

    // Método para convertir a objeto plano para la base de datos
    toDatabase() {
        return {
            products: this.products
        };
    }

    // Método para la respuesta de la API
    toResponse() {
        return {
            id: this.id,
            products: this.products
        };
    }

    // Método para la respuesta de la API con productos populados
    toResponseWithPopulatedProducts() {
        return {
            id: this.id,
            products: this.products.map(item => ({
                product: item.product,
                quantity: item.quantity
            }))
        };
    }
}

/**
 * DTO para item de carrito
 */
class CartItemDTO {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    static validate(productId, quantity) {
        const errors = [];

        if (!productId) {
            errors.push('El ID del producto es requerido');
        }

        if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
            errors.push('La cantidad debe ser un número mayor a 0');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    toDatabase() {
        return {
            product: this.product,
            quantity: this.quantity
        };
    }
}

export { CartDTO, CartItemDTO };
