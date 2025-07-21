import { Router } from 'express';
import TicketService from '../services/TicketService.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { ErrorResponseDTO } from '../dto/ResponseDTO.js';

const router = Router();
const ticketService = new TicketService();

/**
 * POST /api/tickets/checkout
 * Procesar checkout - crear ticket desde carrito
 */
router.post('/checkout', authenticateToken, async (req, res) => {
    try {
        const { cartId } = req.body;
        const purchaserEmail = req.user.email;

        if (!cartId) {
            const errorResponse = new ErrorResponseDTO('ID del carrito es requerido');
            return res.status(400).json(errorResponse.toResponse());
        }

        const result = await ticketService.processCheckout(cartId, purchaserEmail);
        
        console.log(`Checkout procesado para usuario ${purchaserEmail}, carrito ${cartId}`);
        
        res.status(201).json(result.toResponse());

    } catch (error) {
        console.error('Error en POST /tickets/checkout:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al procesar checkout');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * GET /api/tickets/:tid
 * Obtener ticket por ID
 */
router.get('/:tid', authenticateToken, async (req, res) => {
    try {
        const { tid } = req.params;
        const result = await ticketService.getTicketById(tid);
        
        // Verificar que el usuario sea el propietario del ticket o sea admin
        const ticket = result.data;
        if (ticket.purchaser !== req.user.email && req.user.role !== 'admin') {
            const errorResponse = new ErrorResponseDTO('No tienes permisos para ver este ticket');
            return res.status(403).json(errorResponse.toResponse());
        }

        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en GET /tickets/:tid:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al obtener ticket');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * GET /api/tickets/code/:code
 * Obtener ticket por código
 */
router.get('/code/:code', authenticateToken, async (req, res) => {
    try {
        const { code } = req.params;
        const result = await ticketService.getTicketByCode(code);
        
        // Verificar que el usuario sea el propietario del ticket o sea admin
        const ticket = result.data;
        if (ticket.purchaser !== req.user.email && req.user.role !== 'admin') {
            const errorResponse = new ErrorResponseDTO('No tienes permisos para ver este ticket');
            return res.status(403).json(errorResponse.toResponse());
        }

        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en GET /tickets/code/:code:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al obtener ticket');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * GET /api/tickets/user/my-tickets
 * Obtener tickets del usuario autenticado
 */
router.get('/user/my-tickets', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const result = await ticketService.getUserTickets(userEmail, req.query);
        
        console.log(`Usuario ${userEmail} consultó sus tickets`);
        
        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en GET /tickets/user/my-tickets:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al obtener tickets');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * GET /api/tickets/admin/all
 * Obtener todos los tickets (solo administradores)
 */
router.get('/admin/all', requireAdmin, async (req, res) => {
    try {
        const result = await ticketService.getAllTickets(req.query);
        
        console.log(`Admin ${req.user.email} consultó todos los tickets`);
        
        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en GET /tickets/admin/all:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al obtener tickets');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

/**
 * GET /api/tickets/admin/stats
 * Obtener estadísticas de tickets (solo administradores)
 */
router.get('/admin/stats', requireAdmin, async (req, res) => {
    try {
        const result = await ticketService.getTicketStats();
        
        console.log(`Admin ${req.user.email} consultó estadísticas de tickets`);
        
        res.json(result.toResponse());

    } catch (error) {
        console.error('Error en GET /tickets/admin/stats:', error);
        
        if (error instanceof ErrorResponseDTO) {
            res.status(400).json(error.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al obtener estadísticas');
            res.status(500).json(errorResponse.toResponse());
        }
    }
});

export default router;
