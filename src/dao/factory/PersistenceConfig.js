/**
 * Configuración para el patrón Factory
 * Define qué tipo de persistencia usar (DB, FS, etc.)
 */
const PERSISTENCE_TYPE = process.env.PERSISTENCE_TYPE || 'DB';

/**
 * Configuración de los tipos de persistencia disponibles
 */
const PERSISTENCE_CONFIG = {
    DB: {
        name: 'Database',
        description: 'Persistencia en base de datos MongoDB'
    },
    FS: {
        name: 'File System',
        description: 'Persistencia en sistema de archivos'
    }
};

export { PERSISTENCE_TYPE, PERSISTENCE_CONFIG };
