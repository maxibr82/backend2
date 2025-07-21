import { Router } from 'express';
import ProductService from '../services/ProductService.js';
import { uploader } from '../utils/multerUtil.js';
import { ErrorResponseDTO } from '../dto/ResponseDTO.js';

const router = Router();
const productService = new ProductService();

router.get('/', async (req, res) => {
    try {
        const result = await productService.getAllProducts(req.query);
        res.send(result.toResponse ? result.toResponse() : result);
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

router.get('/:pid', async (req, res) => {
    try {
        const result = await productService.getProductById(req.params.pid);
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

router.post('/', uploader.array('thumbnails', 3), async (req, res) => {
    if (req.files) {
        req.body.thumbnails = [];
        req.files.forEach((file) => {
            req.body.thumbnails.push(file.path);
        });
    }

    try {
        const result = await productService.createProduct(req.body);
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

router.put('/:pid', uploader.array('thumbnails', 3), async (req, res) => {
    if (req.files) {
        req.body.thumbnails = [];
        req.files.forEach((file) => {
            req.body.thumbnails.push(file.filename);
        });
    }

    try {
        const result = await productService.updateProduct(req.params.pid, req.body);
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

router.delete('/:pid', async (req, res) => {
    try {
        const result = await productService.deleteProduct(req.params.pid);
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