import { Router } from 'express';
import { UserService } from '../services/UserService.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { logAdminActions, validateObjectId } from '../middleware/validationMiddleware.js';
import { ErrorResponseDTO, SuccessResponseDTO } from '../dto/ResponseDTO.js';

const router = Router();
const userService = new UserService();

// Aplicar middleware de autenticación de admin a todas las rutas
router.use(requireAdminAuth);

// GET /admin/users - Obtener todos los usuarios
router.get('/', 
    logAdminActions('GET_ALL_USERS'),
    async (req, res) => {
        try {
            const result = await userService.getAllUsers(req.query);
            
            console.log(`Admin ${req.user.email} consultó todos los usuarios`);
            
            res.json(result.toResponse ? result.toResponse() : result);
        } catch (error) {
            console.error('Error en GET /admin/users:', error);
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al obtener usuarios');
            res.status(500).json(errorResponse.toResponse());
        }
    }
);

// GET /admin/users/:uid - Obtener usuario por ID
router.get('/:uid', 
    validateObjectId('uid'),
    logAdminActions('GET_USER_BY_ID'),
    async (req, res) => {
        try {
            const result = await userService.getUserById(req.params.uid);
            
            console.log(`Admin ${req.user.email} consultó usuario ID: ${req.params.uid}`);
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en GET /admin/users/:uid:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                const errorResponse = new ErrorResponseDTO('Error interno del servidor al obtener usuario');
                res.status(500).json(errorResponse.toResponse());
            }
        }
    }
);

// PATCH /admin/users/:uid/role - Actualizar rol de usuario
router.patch('/:uid/role', 
    validateObjectId('uid'),
    logAdminActions('UPDATE_USER_ROLE'),
    async (req, res) => {
        try {
            const { role } = req.body;
            
            // Validar que el rol sea válido
            const validRoles = ['user', 'admin'];
            if (!role || !validRoles.includes(role)) {
                const errorResponse = new ErrorResponseDTO(`Rol inválido. Roles válidos: ${validRoles.join(', ')}`);
                return res.status(400).json(errorResponse.toResponse());
            }
            
            // Evitar que un admin se quite permisos a sí mismo
            if (req.params.uid === req.user._id.toString() && role !== 'admin') {
                const errorResponse = new ErrorResponseDTO('No puedes cambiar tu propio rol de administrador');
                return res.status(400).json(errorResponse.toResponse());
            }
            
            const result = await userService.updateUserRole(req.params.uid, role);
            
            console.log(`Admin ${req.user.email} cambió rol del usuario ${req.params.uid} a: ${role}`);
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en PATCH /admin/users/:uid/role:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                const errorResponse = new ErrorResponseDTO('Error interno del servidor al actualizar rol');
                res.status(500).json(errorResponse.toResponse());
            }
        }
    }
);

// PUT /admin/users/:uid - Actualizar información completa del usuario
router.put('/:uid', 
    validateObjectId('uid'),
    logAdminActions('UPDATE_USER'),
    async (req, res) => {
        try {
            const allowedFields = ['first_name', 'last_name', 'email', 'age', 'role'];
            const updateData = {};
            
            // Filtrar solo campos permitidos
            Object.keys(req.body).forEach(key => {
                if (allowedFields.includes(key)) {
                    updateData[key] = req.body[key];
                }
            });
            
            if (Object.keys(updateData).length === 0) {
                const errorResponse = new ErrorResponseDTO(`Debe proporcionar al menos un campo válido para actualizar: ${allowedFields.join(', ')}`);
                return res.status(400).json(errorResponse.toResponse());
            }
            
            // Validar email si está presente
            if (updateData.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(updateData.email)) {
                    const errorResponse = new ErrorResponseDTO('Email inválido');
                    return res.status(400).json(errorResponse.toResponse());
                }
            }
            
            // Validar rol si está presente
            if (updateData.role) {
                const validRoles = ['user', 'admin'];
                if (!validRoles.includes(updateData.role)) {
                    const errorResponse = new ErrorResponseDTO(`Rol inválido. Roles válidos: ${validRoles.join(', ')}`);
                    return res.status(400).json(errorResponse.toResponse());
                }
                
                // Evitar que un admin se quite permisos a sí mismo
                if (req.params.uid === req.user._id.toString() && updateData.role !== 'admin') {
                    const errorResponse = new ErrorResponseDTO('No puedes cambiar tu propio rol de administrador');
                    return res.status(400).json(errorResponse.toResponse());
                }
            }
            
            // Validar edad si está presente
            if (updateData.age !== undefined) {
                const age = parseInt(updateData.age);
                if (isNaN(age) || age < 0 || age > 150) {
                    const errorResponse = new ErrorResponseDTO('Edad debe ser un número entre 0 y 150');
                    return res.status(400).json(errorResponse.toResponse());
                }
                updateData.age = age;
            }
            
            const result = await userService.updateUser(req.params.uid, updateData);
            
            console.log(`Admin ${req.user.email} actualizó usuario ${req.params.uid}:`, Object.keys(updateData));
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en PUT /admin/users/:uid:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                const errorResponse = new ErrorResponseDTO('Error interno del servidor al actualizar usuario');
                res.status(500).json(errorResponse.toResponse());
            }
        }
    }
);

// DELETE /admin/users/:uid - Eliminar usuario
router.delete('/:uid', 
    validateObjectId('uid'),
    logAdminActions('DELETE_USER'),
    async (req, res) => {
        try {
            // Evitar que un admin se elimine a sí mismo
            if (req.params.uid === req.user._id.toString()) {
                const errorResponse = new ErrorResponseDTO('No puedes eliminar tu propia cuenta de administrador');
                return res.status(400).json(errorResponse.toResponse());
            }
            
            const result = await userService.deleteUser(req.params.uid);
            
            console.log(`Admin ${req.user.email} eliminó usuario ID: ${req.params.uid}`);
            
            res.json(result.toResponse());
        } catch (error) {
            console.error('Error en DELETE /admin/users/:uid:', error);
            if (error instanceof ErrorResponseDTO) {
                res.status(400).json(error.toResponse());
            } else {
                const errorResponse = new ErrorResponseDTO('Error interno del servidor al eliminar usuario');
                res.status(500).json(errorResponse.toResponse());
            }
        }
    }
);

// POST /admin/users/promote - Promover usuario a administrador por email
router.post('/promote', 
    logAdminActions('PROMOTE_USER_TO_ADMIN'),
    async (req, res) => {
        try {
            const { email } = req.body;
            
            if (!email) {
                const errorResponse = new ErrorResponseDTO('Email es requerido');
                return res.status(400).json(errorResponse.toResponse());
            }
            
            // Validar formato del email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                const errorResponse = new ErrorResponseDTO('Email inválido');
                return res.status(400).json(errorResponse.toResponse());
            }
            
            // Buscar usuario por email
            const userResponse = await userService.findUserByEmail(email);
            if (userResponse.status !== 'success') {
                const errorResponse = new ErrorResponseDTO('Usuario no encontrado con ese email');
                return res.status(404).json(errorResponse.toResponse());
            }
            
            const user = userResponse.data;
            
            // Verificar si ya es admin
            if (user.role === 'admin') {
                const errorResponse = new ErrorResponseDTO('El usuario ya es administrador');
                return res.status(400).json(errorResponse.toResponse());
            }
            
            // Promover a admin
            const result = await userService.updateUserRole(user._id, 'admin');
            
            console.log(`Admin ${req.user.email} promovió a administrador el usuario: ${email}`);
            
            const response = new SuccessResponseDTO('Usuario promovido a administrador exitosamente', {
                user: result.data,
                promotedBy: {
                    id: req.user._id,
                    email: req.user.email
                },
                timestamp: new Date().toISOString()
            });
            
            res.json(response.toResponse());
        } catch (error) {
            console.error('Error en POST /admin/users/promote:', error);
            const errorResponse = new ErrorResponseDTO('Error interno del servidor al promover usuario');
            res.status(500).json(errorResponse.toResponse());
        }
    }
);

export default router;
