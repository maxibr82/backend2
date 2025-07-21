import { Router } from "express";
import { UserService } from "../services/UserService.js";
import { UserDTO } from "../dto/UserDTO.js";
import CartService from "../services/CartService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const userService = new UserService();
const cartService = new CartService();

// Registro
router.post("/register", async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    
    try {
        // Verificar si el usuario ya existe usando el servicio
        const existingUserResponse = await userService.findUserByEmail(email);
        if (existingUserResponse.status === 'success') {
            return res.status(400).json({ status: "error", message: "Usuario ya existe" });
        }

        // Crear carrito y asociar al usuario
        const cartResponse = await cartService.createCart();
        
        if (cartResponse.status !== 'success') {
            return res.status(500).json({ status: "error", message: "Error al crear carrito" });
        }

        // El cartResponse.payload contiene el CartDTO, que tiene la propiedad id
        const cartId = cartResponse.payload.id;
        
        const hash = await bcrypt.hash(password, 10);
        
        const userResponse = await userService.createUser({
            first_name,
            last_name,
            email,
            password: hash,
            cart: cartId // Usar el cartId extraído correctamente
        });

        if (userResponse.status === 'success') {
            res.json({ status: "success", payload: userResponse.data.id });
        } else {
            res.status(500).json({ status: "error", message: userResponse.message });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const userResponse = await userService.findUserByEmail(email);
        
        if (userResponse.status !== 'success') {
            return res.status(400).json({ status: "error", message: "Usuario no encontrado" });
        }

        const user = userResponse.data;
        
        const valid = await bcrypt.compare(password, user.password);
        
        if (!valid) {
            return res.status(400).json({ status: "error", message: "Contraseña incorrecta" });
        }

        req.session.user = {
            _id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            cart: user.cartId, // Agrega el carrito
            role: user.role || 'user' // Agrega el rol del usuario
        };
        
        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role || 'user' 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        
        // Crear DTO para respuesta segura
        const userDTO = new UserDTO(user);
        
        // Devuelve el carrito, rol y token al frontend
        res.json({
            status: "success",
            message: "Login exitoso",
            token: token,
            user: userDTO.toLegacyResponse()
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;