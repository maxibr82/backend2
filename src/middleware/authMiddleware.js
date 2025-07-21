import jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService.js';
import { ErrorResponseDTO } from '../dto/ResponseDTO.js';
import dotenv from 'dotenv';

dotenv.config();

const userService = new UserService();

// Middleware para verificar autenticación básica
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            const errorResponse = new ErrorResponseDTO('Token de acceso requerido');
            return res.status(401).json(errorResponse.toResponse());
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userResponse = await userService.getUserById(decoded.id);
        
        if (userResponse.status !== 'success') {
            const errorResponse = new ErrorResponseDTO('Usuario no encontrado');
            return res.status(401).json(errorResponse.toResponse());
        }

        req.user = userResponse.data;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            const errorResponse = new ErrorResponseDTO('Token inválido');
            return res.status(403).json(errorResponse.toResponse());
        } else if (error.name === 'TokenExpiredError') {
            const errorResponse = new ErrorResponseDTO('Token expirado');
            return res.status(403).json(errorResponse.toResponse());
        } else {
            const errorResponse = new ErrorResponseDTO('Error de autenticación');
            return res.status(500).json(errorResponse.toResponse());
        }
    }
};

// Middleware específico para verificar rol de administrador
export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            const errorResponse = new ErrorResponseDTO('Usuario no autenticado');
            return res.status(401).json(errorResponse.toResponse());
        }

        if (req.user.role !== 'admin') {
            const errorResponse = new ErrorResponseDTO('Acceso denegado. Se requieren permisos de administrador');
            return res.status(403).json(errorResponse.toResponse());
        }

        next();
    } catch (error) {
        const errorResponse = new ErrorResponseDTO('Error al verificar permisos de administrador');
        return res.status(500).json(errorResponse.toResponse());
    }
};

// Middleware combinado: autenticación + admin
export const requireAdminAuth = [authenticateToken, requireAdmin];

// Middleware para verificar si el usuario es admin o propietario del recurso
export const requireAdminOrOwner = (getOwnerId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                const errorResponse = new ErrorResponseDTO('Usuario no autenticado');
                return res.status(401).json(errorResponse.toResponse());
            }

            // Si es admin, permitir acceso
            if (req.user.role === 'admin') {
                return next();
            }

            // Si no es admin, verificar si es el propietario
            const ownerId = getOwnerId(req);
            if (req.user._id.toString() === ownerId.toString()) {
                return next();
            }

            const errorResponse = new ErrorResponseDTO('Acceso denegado. No tienes permisos para este recurso');
            return res.status(403).json(errorResponse.toResponse());
        } catch (error) {
            const errorResponse = new ErrorResponseDTO('Error al verificar permisos');
            return res.status(500).json(errorResponse.toResponse());
        }
    };
};
