import { UserDBManager } from '../userDBManager.js';
import { UserFSManager } from '../userFSManager.js';

/**
 * Factory para crear instancias de User DAO
 */
class UserDAOFactory {
    static create(type) {
        switch (type.toUpperCase()) {
            case 'DB':
                return new UserDBManager();
            case 'FS':
                return new UserFSManager();
            default:
                throw new Error(`Tipo de persistencia no soportado para User: ${type}`);
        }
    }
}

export { UserDAOFactory };
