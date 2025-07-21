import DAOFactory from '../dao/factory/DAOFactory.js';
import { UserDTO } from '../dto/UserDTO.js';
import { ResponseDTO } from '../dto/ResponseDTO.js';

/**
 * Servicio para manejar la lógica de negocio de usuarios
 */
class UserService {
    constructor() {
        this.initializeDAO();
    }

    async initializeDAO() {
        this.userDAO = await DAOFactory.createUserDAO();
    }

    async createUser(userData) {
        try {
            await this.initializeDAO();
            
            // Verificar si el usuario ya existe
            const existingUser = await this.userDAO.findByEmail(userData.email);
            if (existingUser) {
                return new ResponseDTO(
                    'error',
                    null,
                    'El usuario ya existe con ese email'
                );
            }

            const newUser = await this.userDAO.create(userData);
            const userDTO = new UserDTO(newUser);
            
            return new ResponseDTO(
                'success',
                userDTO,
                'Usuario creado exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async getUserById(id) {
        try {
            await this.initializeDAO();
            const user = await this.userDAO.getById(id);
            
            if (!user) {
                return new ResponseDTO(
                    'error',
                    null,
                    'Usuario no encontrado'
                );
            }

            const userDTO = new UserDTO(user);
            return new ResponseDTO(
                'success',
                userDTO,
                'Usuario obtenido exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async getAllUsers(params = {}) {
        try {
            await this.initializeDAO();
            const result = await this.userDAO.getAll(params);
            
            const usersDTO = result.users.map(user => new UserDTO(user));
            
            return new ResponseDTO(
                'success',
                {
                    users: usersDTO,
                    pagination: {
                        totalPages: result.totalPages,
                        prevPage: result.prevPage,
                        nextPage: result.nextPage,
                        page: result.page,
                        hasPrevPage: result.hasPrevPage,
                        hasNextPage: result.hasNextPage
                    }
                },
                'Usuarios obtenidos exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async updateUser(id, userData) {
        try {
            await this.initializeDAO();
            const updatedUser = await this.userDAO.update(id, userData);
            
            if (!updatedUser) {
                return new ResponseDTO(
                    'error',
                    null,
                    'Usuario no encontrado'
                );
            }

            const userDTO = new UserDTO(updatedUser);
            return new ResponseDTO(
                'success',
                userDTO,
                'Usuario actualizado exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async deleteUser(id) {
        try {
            await this.initializeDAO();
            const deletedUser = await this.userDAO.delete(id);
            
            if (!deletedUser) {
                return new ResponseDTO(
                    'error',
                    null,
                    'Usuario no encontrado'
                );
            }

            return new ResponseDTO(
                'success',
                null,
                'Usuario eliminado exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async findUserByEmail(email) {
        try {
            await this.initializeDAO();
            const user = await this.userDAO.findByEmail(email);
            
            if (!user) {
                return new ResponseDTO(
                    'error',
                    null,
                    'Usuario no encontrado'
                );
            }

            const userDTO = new UserDTO(user, true); // Incluir password para autenticación
            return new ResponseDTO(
                'success',
                userDTO,
                'Usuario encontrado exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async validateUserCredentials(email, password) {
        try {
            await this.initializeDAO();
            const user = await this.userDAO.findByEmailAndPassword(email, password);
            
            if (!user) {
                return new ResponseDTO(
                    'error',
                    null,
                    'Credenciales inválidas'
                );
            }

            const userDTO = new UserDTO(user);
            return new ResponseDTO(
                'success',
                userDTO,
                'Credenciales válidas'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async updateUserPassword(id, newPassword) {
        try {
            await this.initializeDAO();
            const updatedUser = await this.userDAO.updatePassword(id, newPassword);
            
            if (!updatedUser) {
                return new ResponseDTO(
                    'error',
                    null,
                    'Usuario no encontrado'
                );
            }

            return new ResponseDTO(
                'success',
                null,
                'Contraseña actualizada exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }

    async updateUserRole(id, newRole) {
        try {
            await this.initializeDAO();
            const updatedUser = await this.userDAO.updateRole(id, newRole);
            
            if (!updatedUser) {
                return new ResponseDTO(
                    'error',
                    null,
                    'Usuario no encontrado'
                );
            }

            const userDTO = new UserDTO(updatedUser);
            return new ResponseDTO(
                'success',
                userDTO,
                'Rol actualizado exitosamente'
            );
        } catch (error) {
            return new ResponseDTO(
                'error',
                null,
                error.message
            );
        }
    }
}

export { UserService };
