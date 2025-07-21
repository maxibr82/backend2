import { UserDAO } from './interfaces/UserDAO.js';
import { userModel } from './models/userModel.js';

/**
 * Implementación del DAO para Users usando MongoDB
 */
class UserDBManager extends UserDAO {
    constructor() {
        super();
        this.model = userModel;
    }

    async create(userData) {
        try {
            const newUser = await this.model.create(userData);
            return newUser.toObject();
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    async getById(id) {
        try {
            const user = await this.model.findById(id);
            return user ? user.toObject() : null;
        } catch (error) {
            throw new Error(`Error al obtener usuario por ID: ${error.message}`);
        }
    }

    async getAll(params = {}) {
        try {
            const { limit = 10, page = 1, ...filters } = params;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            
            const result = await this.model.paginate(filters, options);
            return {
                users: result.docs.map(doc => doc.toObject()),
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage
            };
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    async update(id, userData) {
        try {
            const updatedUser = await this.model.findByIdAndUpdate(
                id, 
                userData, 
                { new: true, runValidators: true }
            );
            return updatedUser ? updatedUser.toObject() : null;
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const deletedUser = await this.model.findByIdAndDelete(id);
            return deletedUser ? deletedUser.toObject() : null;
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            const user = await this.model.findOne({ email });
            return user ? user.toObject() : null;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    async findByEmailAndPassword(email, password) {
        try {
            const user = await this.model.findOne({ email, password });
            return user ? user.toObject() : null;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email y password: ${error.message}`);
        }
    }

    async updatePassword(id, newPassword) {
        try {
            const updatedUser = await this.model.findByIdAndUpdate(
                id, 
                { password: newPassword }, 
                { new: true }
            );
            return updatedUser ? updatedUser.toObject() : null;
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }

    async updateRole(id, newRole) {
        try {
            const updatedUser = await this.model.findByIdAndUpdate(
                id, 
                { role: newRole }, 
                { new: true }
            );
            return updatedUser ? updatedUser.toObject() : null;
        } catch (error) {
            throw new Error(`Error al actualizar rol: ${error.message}`);
        }
    }
}

export { UserDBManager };
