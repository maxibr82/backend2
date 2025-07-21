/**
 * DTO para tickets de compra
 * Define la estructura de datos para transferir información de tickets
 */
class TicketDTO {
    constructor(ticket) {
        this.id = ticket._id ? ticket._id.toString() : (ticket.id ? ticket.id.toString() : null);
        this.code = ticket.code;
        this.purchase_datetime = ticket.purchase_datetime;
        this.amount = ticket.amount;
        this.purchaser = ticket.purchaser;
        this.products = ticket.products ? ticket.products.map(item => new TicketItemDTO(item)) : [];
        this.status = ticket.status || 'completed';
        this.createdAt = ticket.createdAt;
        this.updatedAt = ticket.updatedAt;
    }

    // Método para validar los datos del ticket
    static validate(ticketData) {
        const errors = [];

        if (!ticketData.purchaser || typeof ticketData.purchaser !== 'string') {
            errors.push('El email del comprador es requerido');
        }

        if (!ticketData.amount || typeof ticketData.amount !== 'number' || ticketData.amount <= 0) {
            errors.push('El monto debe ser un número mayor a 0');
        }

        if (!ticketData.products || !Array.isArray(ticketData.products) || ticketData.products.length === 0) {
            errors.push('Los productos son requeridos');
        }

        if (ticketData.products) {
            ticketData.products.forEach((item, index) => {
                if (!item.product) {
                    errors.push(`El producto en la posición ${index} es requerido`);
                }
                
                if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    errors.push(`La cantidad en la posición ${index} debe ser un número mayor a 0`);
                }

                if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
                    errors.push(`El precio en la posición ${index} debe ser un número mayor a 0`);
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
        return new TicketDTO({
            purchaser: requestData.purchaser,
            amount: requestData.amount,
            products: requestData.products || []
        });
    }

    // Método para convertir a objeto plano para la base de datos
    toDatabase() {
        return {
            code: this.code,
            purchase_datetime: this.purchase_datetime,
            amount: this.amount,
            purchaser: this.purchaser,
            products: this.products.map(item => item.toDatabase()),
            status: this.status
        };
    }

    // Método para la respuesta de la API
    toResponse() {
        return {
            id: this.id,
            code: this.code,
            purchase_datetime: this.purchase_datetime,
            amount: this.amount,
            purchaser: this.purchaser,
            products: this.products.map(item => item.toResponse()),
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Método para la respuesta resumida de la API
    toSummaryResponse() {
        return {
            id: this.id,
            code: this.code,
            purchase_datetime: this.purchase_datetime,
            amount: this.amount,
            purchaser: this.purchaser,
            totalItems: this.products.length,
            status: this.status
        };
    }
}

/**
 * DTO para item de ticket
 */
class TicketItemDTO {
    constructor(item) {
        this.product = item.product;
        this.title = item.title;
        this.price = item.price;
        this.quantity = item.quantity;
        this.subtotal = item.subtotal || (item.price * item.quantity);
    }

    static validate(productData) {
        const errors = [];

        if (!productData.product) {
            errors.push('El ID del producto es requerido');
        }

        if (!productData.title || typeof productData.title !== 'string') {
            errors.push('El título del producto es requerido');
        }

        if (!productData.price || typeof productData.price !== 'number' || productData.price <= 0) {
            errors.push('El precio debe ser un número mayor a 0');
        }

        if (!productData.quantity || typeof productData.quantity !== 'number' || productData.quantity <= 0) {
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
            title: this.title,
            price: this.price,
            quantity: this.quantity,
            subtotal: this.subtotal
        };
    }

    toResponse() {
        return {
            product: this.product,
            title: this.title,
            price: this.price,
            quantity: this.quantity,
            subtotal: this.subtotal
        };
    }
}

export { TicketDTO, TicketItemDTO };
