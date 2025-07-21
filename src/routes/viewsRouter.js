import { Router } from 'express';
import ProductService from '../services/ProductService.js';
import CartService from '../services/CartService.js';

const router = Router();
const productService = new ProductService();
const cartService = new CartService();

// Redirección de la raíz a /products
router.get('/', (req, res) => {
    res.redirect('/products');
});

// Página principal de productos
router.get('/products', async (req, res) => {
    try {
        const result = await productService.getAllProducts(req.query);
        const products = result.docs || result.payload || [];

        res.render(
            'index',
            {
                title: 'Productos',
                style: 'index.css',
                products: JSON.parse(JSON.stringify(products)),
                prevLink: {
                    exist: result.prevLink ? true : false,
                    link: result.prevLink
                },
                nextLink: {
                    exist: result.nextLink ? true : false,
                    link: result.nextLink
                }
            }
        );
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.render('notFound', {
            title: 'Error',
            message: 'Error al cargar los productos'
        });
    }
});

// Vista de productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    try {
        const result = await productService.getAllProducts(req.query);
        const products = result.docs || result.payload || [];
        
        res.render(
            'realTimeProducts',
            {
                title: 'Productos',
                style: 'index.css',
                products: JSON.parse(JSON.stringify(products))
            }
        );
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.render('notFound', {
            title: 'Error',
            message: 'Error al cargar los productos'
        });
    }
});

// Vista de carrito
router.get('/cart/:cid', async (req, res) => {
    try {
        const response = await cartService.getCartById(req.params.cid);
        const cartData = response.payload || response;

        res.render(
            'cart',
            {
                title: 'Carrito',
                style: 'index.css',
                products: JSON.parse(JSON.stringify(cartData.products || []))
            }
        );
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.render(
            'notFound',
            {
                title: 'Not Found',
                style: 'index.css'
            }
        );
    }
});

// Vista de login
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        style: 'index.css'
    });
});

// Vista de registro
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registro',
        style: 'index.css'
    });
});

// Vista de administración de productos (solo para admins)
router.get('/admin/products', (req, res) => {
    res.render('adminProducts', {
        title: 'Administración de Productos',
        style: 'index.css'
    });
});

// Vista para solicitar recuperación de contraseña
router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword', {
        title: 'Recuperar Contraseña',
        style: 'index.css'
    });
});

// Vista para restablecer contraseña
router.get('/reset-password', (req, res) => {
    res.render('resetPassword', {
        title: 'Restablecer Contraseña',
        style: 'index.css'
    });
});

export default router;