import { Router } from 'express';
import adminProductRouter from './adminProductRouter.js';
import adminUserRouter from './adminUserRouter.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { logAdminActions } from '../middleware/validationMiddleware.js';
import { SuccessResponseDTO, ErrorResponseDTO } from '../dto/ResponseDTO.js';
import { UserService } from '../services/UserService.js';

const router = Router();
const userService = new UserService();

// Aplicar middleware de autenticación de admin a todas las rutas
router.use(requireAdminAuth);

// Ruta de información del dashboard de administrador
router.get('/dashboard', 
    logAdminActions('ACCESS_ADMIN_DASHBOARD'),
    async (req, res) => {
        try {
            // Aquí podrías agregar estadísticas del ecommerce
            const dashboardData = {
                admin: {
                    id: req.user._id,
                    email: req.user.email,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name
                },
                accessTime: new Date().toISOString(),
                permissions: ['products:read', 'products:write', 'products:delete', 'users:read', 'users:write', 'users:delete'],
                availableActions: [
                    'Gestionar productos',
                    'Gestionar usuarios',
                    'Ver estadísticas',
                    'Gestionar categorías (próximamente)'
                ]
            };
            
            const response = new SuccessResponseDTO('Dashboard de administrador', dashboardData);
            res.json(response.toResponse());
        } catch (error) {
            console.error('Error en GET /admin/dashboard:', error);
            const errorResponse = new ErrorResponseDTO('Error al cargar dashboard de administrador');
            res.status(500).json(errorResponse.toResponse());
        }
    }
);

// Ruta para verificar permisos de administrador
router.get('/verify', 
    logAdminActions('VERIFY_ADMIN_PERMISSIONS'),
    async (req, res) => {
        try {
            const response = new SuccessResponseDTO('Permisos de administrador verificados', {
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    role: req.user.role,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name
                },
                permissions: ['admin'],
                timestamp: new Date().toISOString()
            });
            
            res.json(response.toResponse());
        } catch (error) {
            console.error('Error en GET /admin/verify:', error);
            const errorResponse = new ErrorResponseDTO('Error al verificar permisos');
            res.status(500).json(errorResponse.toResponse());
        }
    }
);

// Subrutas para diferentes recursos
router.use('/products', adminProductRouter);
router.use('/users', adminUserRouter);

// Middleware para manejo de rutas no encontradas en admin
router.use('*', (req, res) => {
    const errorResponse = new ErrorResponseDTO(`Ruta de administrador no encontrada: ${req.originalUrl}`);
    res.status(404).json(errorResponse.toResponse());
});

export default router;
