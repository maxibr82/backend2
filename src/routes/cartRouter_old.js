import { Router } from 'express';
import CartService from '../services/CartService.js';
import { ErrorResponseDTO } from '../dto/ResponseDTO.js';

const router = Router();
const cartService = new CartService();


router.get('/', async (req, res) => {
    try {
        const result = await cartService.getAllCarts();
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const result = await cartService.getCartById(req.params.cid);
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

router.post('/', async (req, res) => {
    try {
        const result = await cartService.createCart();
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const result = await cartService.addProductToCart(req.params.cid, req.params.pid);
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const result = await cartService.removeProductFromCart(req.params.cid, req.params.pid);
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const result = await cartService.updateAllProductsInCart(req.params.cid, req.body.products);
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const result = await cartService.updateProductQuantityInCart(req.params.cid, req.params.pid, req.body.quantity);
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const result = await cartService.clearCart(req.params.cid);
        res.send(result.toResponse());
    } catch (error) {
        if (error instanceof ErrorResponseDTO) {
            res.status(400).send(error.toResponse());
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
});

export default router;