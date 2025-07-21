import { UserDAO } from './interfaces/UserDAO.js';
import fs from 'fs';
import path from 'path';

/**
 * Implementación del DAO para Users usando File System
 */
class UserFSManager extends UserDAO {
    constructor() {
        super();
        this.path = path.join(process.cwd(), 'data', 'users.json');
        this.ensureFileExists();
    }

    ensureFileExists() {
        try {
            if (!fs.existsSync(this.path)) {
                const dir = path.dirname(this.path);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(this.path, JSON.stringify([]));
            }
        } catch (error) {
            throw new Error(`Error al crear archivo de usuarios: ${error.message}`);
        }
    }

    async readUsers() {
        try {
            const data = fs.readFileSync(this.path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Error al leer usuarios: ${error.message}`);
        }
    }

    async writeUsers(users) {
        try {
            fs.writeFileSync(this.path, JSON.stringify(users, null, 2));
        } catch (error) {
            throw new Error(`Error al escribir usuarios: ${error.message}`);
        }
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    async create(userData) {
        try {
            const users = await this.readUsers();
            const newUser = {
                id: this.generateId(),
                ...userData,
                cart: userData.cart || null,
                role: userData.role || 'user'
            };
            users.push(newUser);
            await this.writeUsers(users);
            return newUser;
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    async getById(id) {
        try {
            const users = await this.readUsers();
            return users.find(user => user.id === id) || null;
        } catch (error) {
            throw new Error(`Error al obtener usuario por ID: ${error.message}`);
        }
    }

    async getAll(params = {}) {
        try {
            const users = await this.readUsers();
            const { limit = 10, page = 1 } = params;
            
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedUsers = users.slice(startIndex, endIndex);
            
            return {
                users: paginatedUsers,
                totalPages: Math.ceil(users.length / limit),
                prevPage: page > 1 ? page - 1 : null,
                nextPage: endIndex < users.length ? page + 1 : null,
                page: page,
                hasPrevPage: page > 1,
                hasNextPage: endIndex < users.length
            };
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    async update(id, userData) {
        try {
            const users = await this.readUsers();
            const userIndex = users.findIndex(user => user.id === id);
            
            if (userIndex === -1) {
                return null;
            }
            
            users[userIndex] = { ...users[userIndex], ...userData };
            await this.writeUsers(users);
            return users[userIndex];
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const users = await this.readUsers();
            const userIndex = users.findIndex(user => user.id === id);
            
            if (userIndex === -1) {
                return null;
            }
            
            const deletedUser = users[userIndex];
            users.splice(userIndex, 1);
            await this.writeUsers(users);
            return deletedUser;
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            const users = await this.readUsers();
            return users.find(user => user.email === email) || null;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    async findByEmailAndPassword(email, password) {
        try {
            const users = await this.readUsers();
            return users.find(user => user.email === email && user.password === password) || null;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email y password: ${error.message}`);
        }
    }

    async updatePassword(id, newPassword) {
        try {
            return await this.update(id, { password: newPassword });
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }

    async updateRole(id, newRole) {
        try {
            return await this.update(id, { role: newRole });
        } catch (error) {
            throw new Error(`Error al actualizar rol: ${error.message}`);
        }
    }
}

export { UserFSManager };
