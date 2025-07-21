import { PERSISTENCE_TYPE } from './PersistenceConfig.js';
import ProductDAOFactory from './ProductDAOFactory.js';

/**
 * Factory para crear instancias de DAOs de carritos
 * Implementa el patrón Factory para abstraer la creación de objetos DAO
 */
class CartDAOFactory {
    static async create() {
        switch (PERSISTENCE_TYPE) {
            case 'DB':
                const { CartDBManager } = await import('../cartDBManager.js');
                const productDAO = await ProductDAOFactory.create();
                return new CartDBManager(productDAO);
            
            case 'FS':
                const { CartFSManager } = await import('../cartFSManager.js');
                const productFSDAO = await ProductDAOFactory.create();
                return new CartFSManager('./data/carts.json', productFSDAO);
            
            default:
                throw new Error(`Tipo de persistencia no soportado: ${PERSISTENCE_TYPE}`);
        }
    }

    static getSupportedTypes() {
        return ['DB', 'FS'];
    }

    static getCurrentType() {
        return PERSISTENCE_TYPE;
    }
}

export default CartDAOFactory;
