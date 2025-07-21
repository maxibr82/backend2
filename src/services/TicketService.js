import { ticketModel } from '../dao/models/ticketModel.js';
import { cartModel } from '../dao/models/cartModel.js';
import { productModel } from '../dao/models/productModel.js';
import { TicketDTO, TicketItemDTO } from '../dto/TicketDTO.js';
import { ErrorResponseDTO, SuccessResponseDTO } from '../dto/ResponseDTO.js';
import CartService from './CartService.js';
import crypto from 'crypto';

/**
 * Servicio para manejar la lógica de negocio de tickets
 */
class TicketService {
    constructor() {
        this.cartService = new CartService();
    }

    /**
     * Generar código único para el ticket
     */
    generateTicketCode() {
        const timestamp = Date.now().toString();
        const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `TICKET-${timestamp}-${randomBytes}`;
    }

    /**
     * Procesar checkout - crear ticket y vaciar carrito
     */
    async processCheckout(cartId, purchaserEmail) {
        try {
            // Obtener el carrito con productos populados
            const cart = await cartModel.findById(cartId).populate('products.product');
            
            if (!cart) {
                throw new ErrorResponseDTO('Carrito no encontrado');
            }

            if (!cart.products || cart.products.length === 0) {
                throw new ErrorResponseDTO('El carrito está vacío');
            }

            // Validar stock y calcular productos disponibles
            const availableProducts = [];
            const unavailableProducts = [];
            let totalAmount = 0;

            for (const item of cart.products) {
                const product = item.product;
                
                if (!product) {
                    unavailableProducts.push({
                        reason: 'Producto no encontrado',
                        productId: item.product
                    });
                    continue;
                }

                if (product.stock >= item.quantity) {
                    // Producto disponible
                    const subtotal = product.price * item.quantity;
                    availableProducts.push({
                        product: product._id,
                        title: product.title,
                        price: product.price,
                        quantity: item.quantity,
                        subtotal: subtotal
                    });
                    totalAmount += subtotal;
                } else {
                    // Stock insuficiente
                    unavailableProducts.push({
                        reason: `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${item.quantity}`,
                        productId: product._id,
                        title: product.title,
                        availableStock: product.stock,
                        requestedQuantity: item.quantity
                    });
                }
            }

            if (availableProducts.length === 0) {
                throw new ErrorResponseDTO(
                    'No hay productos disponibles para procesar la compra', 
                    'error',
                    { unavailableProducts }
                );
            }

            // Crear el ticket
            const ticketCode = this.generateTicketCode();
            
            const ticketData = {
                code: ticketCode,
                purchase_datetime: new Date(),
                amount: totalAmount,
                purchaser: purchaserEmail,
                products: availableProducts,
                status: 'completed'
            };

            // Validar datos del ticket usando DTO
            const validation = TicketDTO.validate(ticketData);
            if (!validation.isValid) {
                throw new ErrorResponseDTO(`Datos de ticket inválidos: ${validation.errors.join(', ')}`);
            }

            // Crear el ticket en la base de datos
            const newTicket = await ticketModel.create(ticketData);

            // Actualizar stock de productos comprados
            for (const item of availableProducts) {
                await productModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } }
                );
            }

            // Eliminar productos comprados del carrito
            const remainingProducts = cart.products.filter(cartItem => {
                return !availableProducts.some(availableItem => 
                    availableItem.product.toString() === cartItem.product._id.toString()
                );
            });

            await cartModel.findByIdAndUpdate(cartId, {
                products: remainingProducts
            });

            // Preparar respuesta
            const ticketDTO = new TicketDTO(newTicket);
            const responseData = {
                ticket: ticketDTO.toResponse(),
                summary: {
                    totalPurchased: availableProducts.length,
                    totalAmount: totalAmount,
                    remainingInCart: remainingProducts.length
                }
            };

            // Incluir productos no disponibles si los hay
            if (unavailableProducts.length > 0) {
                responseData.unavailableProducts = unavailableProducts;
            }

            console.log(`Ticket creado: ${ticketCode} para ${purchaserEmail} - Monto: $${totalAmount}`);

            return new SuccessResponseDTO(
                'Compra procesada exitosamente',
                responseData
            );

        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            console.error('Error en processCheckout:', error);
            throw new ErrorResponseDTO('Error interno al procesar la compra');
        }
    }

    /**
     * Obtener ticket por ID
     */
    async getTicketById(ticketId) {
        try {
            const ticket = await ticketModel.findById(ticketId).populate('products.product');
            
            if (!ticket) {
                throw new ErrorResponseDTO('Ticket no encontrado');
            }

            const ticketDTO = new TicketDTO(ticket);
            return new SuccessResponseDTO(
                'Ticket obtenido exitosamente',
                ticketDTO.toResponse()
            );

        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            console.error('Error en getTicketById:', error);
            throw new ErrorResponseDTO('Error al obtener el ticket');
        }
    }

    /**
     * Obtener ticket por código
     */
    async getTicketByCode(ticketCode) {
        try {
            const ticket = await ticketModel.findOne({ code: ticketCode }).populate('products.product');
            
            if (!ticket) {
                throw new ErrorResponseDTO('Ticket no encontrado');
            }

            const ticketDTO = new TicketDTO(ticket);
            return new SuccessResponseDTO(
                'Ticket obtenido exitosamente',
                ticketDTO.toResponse()
            );

        } catch (error) {
            if (error instanceof ErrorResponseDTO) {
                throw error;
            }
            console.error('Error en getTicketByCode:', error);
            throw new ErrorResponseDTO('Error al obtener el ticket');
        }
    }

    /**
     * Obtener tickets de un usuario
     */
    async getUserTickets(userEmail, params = {}) {
        try {
            const limit = parseInt(params.limit) || 10;
            const page = parseInt(params.page) || 1;
            const skip = (page - 1) * limit;

            const tickets = await ticketModel
                .find({ purchaser: userEmail })
                .sort({ purchase_datetime: -1 })
                .skip(skip)
                .limit(limit)
                .populate('products.product');

            const total = await ticketModel.countDocuments({ purchaser: userEmail });

            const ticketsDTO = tickets.map(ticket => new TicketDTO(ticket).toSummaryResponse());

            return new SuccessResponseDTO(
                'Tickets del usuario obtenidos exitosamente',
                {
                    tickets: ticketsDTO,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                        hasMore: page < Math.ceil(total / limit)
                    }
                }
            );

        } catch (error) {
            console.error('Error en getUserTickets:', error);
            throw new ErrorResponseDTO('Error al obtener tickets del usuario');
        }
    }

    /**
     * Obtener todos los tickets (para administradores)
     */
    async getAllTickets(params = {}) {
        try {
            const limit = parseInt(params.limit) || 10;
            const page = parseInt(params.page) || 1;
            const skip = (page - 1) * limit;

            const filter = {};
            if (params.status) {
                filter.status = params.status;
            }
            if (params.purchaser) {
                filter.purchaser = { $regex: params.purchaser, $options: 'i' };
            }

            const tickets = await ticketModel
                .find(filter)
                .sort({ purchase_datetime: -1 })
                .skip(skip)
                .limit(limit)
                .populate('products.product');

            const total = await ticketModel.countDocuments(filter);

            const ticketsDTO = tickets.map(ticket => new TicketDTO(ticket).toSummaryResponse());

            return new SuccessResponseDTO(
                'Tickets obtenidos exitosamente',
                {
                    tickets: ticketsDTO,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                        hasMore: page < Math.ceil(total / limit)
                    }
                }
            );

        } catch (error) {
            console.error('Error en getAllTickets:', error);
            throw new ErrorResponseDTO('Error al obtener tickets');
        }
    }

    /**
     * Obtener estadísticas de tickets
     */
    async getTicketStats() {
        try {
            const stats = await ticketModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: 1 },
                        totalRevenue: { $sum: '$amount' },
                        avgOrderValue: { $avg: '$amount' },
                        totalProducts: { $sum: { $size: '$products' } }
                    }
                }
            ]);

            const statusStats = await ticketModel.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const result = {
                general: stats[0] || {
                    totalTickets: 0,
                    totalRevenue: 0,
                    avgOrderValue: 0,
                    totalProducts: 0
                },
                byStatus: statusStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            };

            return new SuccessResponseDTO('Estadísticas obtenidas exitosamente', result);

        } catch (error) {
            console.error('Error en getTicketStats:', error);
            throw new ErrorResponseDTO('Error al obtener estadísticas');
        }
    }
}

export default TicketService;
