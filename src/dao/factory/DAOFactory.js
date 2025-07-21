import ProductDAOFactory from './ProductDAOFactory.js';
import CartDAOFactory from './CartDAOFactory.js';
import { UserDAOFactory } from './UserDAOFactory.js';
import { PERSISTENCE_TYPE, PERSISTENCE_CONFIG } from './PersistenceConfig.js';

/**
 * Factory principal que maneja todos los tipos de DAO
 * Implementa el patrón Factory para centralizar la creación de objetos DAO
 */
class DAOFactory {
    static async createProductDAO() {
        console.log(`🏭 Factory: Creando ProductDAO con persistencia: ${PERSISTENCE_TYPE}`);
        return await ProductDAOFactory.create();
    }

    static async createCartDAO() {
        console.log(`🏭 Factory: Creando CartDAO con persistencia: ${PERSISTENCE_TYPE}`);
        return await CartDAOFactory.create();
    }

    static async createUserDAO() {
        console.log(`🏭 Factory: Creando UserDAO con persistencia: ${PERSISTENCE_TYPE}`);
        return UserDAOFactory.create(PERSISTENCE_TYPE);
    }

    static async createAllDAOs() {
        const productDAO = await this.createProductDAO();
        const cartDAO = await this.createCartDAO();
        const userDAO = await this.createUserDAO();

        return {
            productDAO,
            cartDAO,
            userDAO
        };
    }

    static getPersistenceInfo() {
        return {
            current: PERSISTENCE_TYPE,
            config: PERSISTENCE_CONFIG[PERSISTENCE_TYPE],
            available: Object.keys(PERSISTENCE_CONFIG)
        };
    }

    static validatePersistenceType(type) {
        return Object.keys(PERSISTENCE_CONFIG).includes(type);
    }
}

export default DAOFactory;
