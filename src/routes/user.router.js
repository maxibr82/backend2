import { Router } from "express";
import { userModel } from "../models/user.model.js";
import { cartModel } from "../dao/models/cartModel.js"; // <--- IMPORTANTE
import bcrypt from "bcrypt";

const router = Router();

// Registro
router.post("/register", async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) return res.status(400).json({ status: "error", message: "Usuario ya existe" });

        // Crear carrito y asociar al usuario
        const cart = await cartModel.create({ products: [] });

        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            first_name,
            last_name,
            email,
            password: hash,
            cart: cart._id // <--- ASOCIA EL CARRITO
        });
        res.json({ status: "success", payload: user._id });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ status: "error", message: "Usuario no encontrado" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ status: "error", message: "Contraseña incorrecta" });

        req.session.user = {
            _id: user._id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            cart: user.cart // <--- AGREGA EL CARRITO
        };
        // Devuelve el carrito al frontend
        res.json({
            status: "success",
            message: "Login exitoso",
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                cart: user.cart // <--- AGREGA EL CARRITO
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;