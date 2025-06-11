import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { userModel } from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils/hashUtil.js";
import dotenv from "dotenv";
dotenv.config();

passport.use("register", new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
        try {
            const { first_name, last_name, age } = req.body;
            const exists = await userModel.findOne({ email });
            if (exists) return done(null, false, { message: "Usuario ya existe" });
            const hash = createHash(password);
            const user = await userModel.create({ first_name, last_name, email, age, password: hash });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use("login", new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
        try {
            const user = await userModel.findOne({ email });
            if (!user || !isValidPassword(user, password)) return done(null, false, { message: "Credenciales inválidas" });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use("jwt", new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (jwt_payload, done) => {
    try {
        const user = await userModel.findById(jwt_payload.id);
        if (!user) return done(null, false);
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
}));

export default passport;