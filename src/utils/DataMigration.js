import { ProductDBManager } from '../dao/productDBManager.js';
import { CartDBManager } from '../dao/cartDBManager.js';
import { ProductFSManager } from '../dao/productFSManager.js';
import { CartFSManager } from '../dao/cartFSManager.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Utilidad para migrar datos entre MongoDB y File System
 */
class DataMigration {
    constructor() {
        this.productDBManager = null;
        this.cartDBManager = null;
        this.productFSManager = null;
        this.cartFSManager = null;
    }

    async initialize() {
        // Conectar a MongoDB
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('✅ Conectado a MongoDB Atlas');

        // Inicializar managers
        this.productDBManager = new ProductDBManager();
        this.cartDBManager = new CartDBManager(this.productDBManager);
        this.productFSManager = new ProductFSManager();
        this.cartFSManager = new CartFSManager('./data/carts.json', this.productFSManager);
    }

    /**
     * Migra productos de MongoDB a File System
     */
    async migrateProductsFromDBToFS() {
        try {
            console.log('🔄 Migrando productos de MongoDB a File System...');
            
            // Obtener todos los productos de MongoDB
            const dbProducts = await this.productDBManager.getAllProducts({ limit: 1000 });
            const products = dbProducts.docs || dbProducts.payload || [];
            
            console.log(`📦 Encontrados ${products.length} productos en MongoDB`);

            // Leer productos existentes en File System
            const existingProducts = await this.productFSManager.getAllProductsFromFile();
            let nextId = 1;
            
            if (existingProducts.length > 0) {
                nextId = Math.max(...existingProducts.map(p => parseInt(p.id))) + 1;
            }

            // Migrar cada producto
            const migratedProducts = [];
            for (const product of products) {
                const productData = {
                    id: nextId++,
                    title: product.title,
                    description: product.description,
                    code: product.code + '_migrated', // Evitar duplicados de código
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                    thumbnails: product.thumbnails || [],
                    status: product.status !== undefined ? product.status : true
                };
                
                migratedProducts.push(productData);
            }

            // Combinar con productos existentes
            const allProducts = [...existingProducts, ...migratedProducts];
            
            // Guardar en File System
            const fs = await import('fs');
            await fs.promises.writeFile('./data/products.json', JSON.stringify(allProducts, null, '\t'));
            
            console.log(`✅ Migrados ${migratedProducts.length} productos a File System`);
            console.log(`📁 Total de productos en File System: ${allProducts.length}`);
            
            return migratedProducts;
        } catch (error) {
            console.error('❌ Error en migración de productos:', error.message);
            throw error;
        }
    }

    /**
     * Migra carritos de MongoDB a File System
     */
    async migrateCartsFromDBToFS() {
        try {
            console.log('🔄 Migrando carritos de MongoDB a File System...');
            
            // Obtener todos los carritos de MongoDB
            const dbCarts = await this.cartDBManager.getAllCarts();
            
            console.log(`🛒 Encontrados ${dbCarts.length} carritos en MongoDB`);

            // Leer carritos existentes en File System
            const existingCarts = await this.cartFSManager.getAllCartsFromFile();
            let nextId = 1;
            
            if (existingCarts.length > 0) {
                nextId = Math.max(...existingCarts.map(c => parseInt(c.id))) + 1;
            }

            // Migrar cada carrito (simplificado, sin productos para evitar problemas de referencia)
            const migratedCarts = [];
            for (const cart of dbCarts) {
                const cartData = {
                    id: nextId++,
                    products: [] // Empezar con carritos vacíos
                };
                
                migratedCarts.push(cartData);
            }

            // Combinar con carritos existentes
            const allCarts = [...existingCarts, ...migratedCarts];
            
            // Guardar en File System
            const fs = await import('fs');
            await fs.promises.writeFile('./data/carts.json', JSON.stringify(allCarts, null, '\t'));
            
            console.log(`✅ Migrados ${migratedCarts.length} carritos a File System`);
            console.log(`📁 Total de carritos en File System: ${allCarts.length}`);
            
            return migratedCarts;
        } catch (error) {
            console.error('❌ Error en migración de carritos:', error.message);
            throw error;
        }
    }

    /**
     * Migra productos de File System a MongoDB
     */
    async migrateProductsFromFSToDB() {
        try {
            console.log('🔄 Migrando productos de File System a MongoDB...');
            
            // Obtener productos de File System
            const fsProducts = await this.productFSManager.getAllProductsFromFile();
            
            console.log(`📦 Encontrados ${fsProducts.length} productos en File System`);

            const migratedProducts = [];
            for (const product of fsProducts) {
                try {
                    const productData = {
                        title: product.title,
                        description: product.description,
                        code: product.code,
                        price: product.price,
                        stock: product.stock,
                        category: product.category,
                        thumbnails: product.thumbnails || []
                    };
                    
                    const createdProduct = await this.productDBManager.createProduct(productData);
                    migratedProducts.push(createdProduct);
                } catch (error) {
                    console.warn(`⚠️ No se pudo migrar producto ${product.title}: ${error.message}`);
                }
            }
            
            console.log(`✅ Migrados ${migratedProducts.length} productos a MongoDB`);
            return migratedProducts;
        } catch (error) {
            console.error('❌ Error en migración de productos:', error.message);
            throw error;
        }
    }

    async close() {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

// Script ejecutable
if (import.meta.url === `file://${process.argv[1]}`) {
    const migration = new DataMigration();
    
    try {
        await migration.initialize();
        
        const action = process.argv[2];
        
        switch (action) {
            case 'db-to-fs':
                await migration.migrateProductsFromDBToFS();
                await migration.migrateCartsFromDBToFS();
                break;
            case 'fs-to-db':
                await migration.migrateProductsFromFSToDB();
                break;
            case 'products-db-to-fs':
                await migration.migrateProductsFromDBToFS();
                break;
            case 'products-fs-to-db':
                await migration.migrateProductsFromFSToDB();
                break;
            default:
                console.log(`
Uso: node src/utils/DataMigration.js [acción]

Acciones disponibles:
  db-to-fs           - Migrar todo de MongoDB a File System
  fs-to-db           - Migrar todo de File System a MongoDB
  products-db-to-fs  - Migrar solo productos de MongoDB a File System
  products-fs-to-db  - Migrar solo productos de File System a MongoDB
                `);
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await migration.close();
        process.exit(0);
    }
}

export default DataMigration;
