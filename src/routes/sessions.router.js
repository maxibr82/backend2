import { Router } from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { UserDTO } from "../dto/UserDTO.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

// Registro
router.post("/register", passport.authenticate("register", { session: false }), (req, res) => {
    res.json({ status: "success", message: "Usuario registrado" });
});

// Login
router.post("/login", (req, res, next) => {
    passport.authenticate("login", { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ status: "error", message: info?.message || "Login inválido" });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ status: "success", token });
    })(req, res, next);
});

// Current
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    try {
        const userDTO = new UserDTO(req.user);
        res.json({ 
            status: "success", 
            user: userDTO.toLegacyResponse() 
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error", 
            message: "Error al obtener información del usuario" 
        });
    }
});

export default router;