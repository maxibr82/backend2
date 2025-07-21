import { PERSISTENCE_TYPE } from './PersistenceConfig.js';

/**
 * Factory para crear instancias de DAOs de productos
 * Implementa el patrón Factory para abstraer la creación de objetos DAO
 */
class ProductDAOFactory {
    static async create() {
        switch (PERSISTENCE_TYPE) {
            case 'DB':
                const { ProductDBManager } = await import('../productDBManager.js');
                return new ProductDBManager();
            
            case 'FS':
                const { ProductFSManager } = await import('../productFSManager.js');
                return new ProductFSManager();
            
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

export default ProductDAOFactory;
