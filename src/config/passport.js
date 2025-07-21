import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { UserService } from "../services/UserService.js";
import { createHash, isValidPassword } from "../utils/hashUtil.js";
import dotenv from "dotenv";
dotenv.config();

const userService = new UserService();

passport.use("register", new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
        try {
            const { first_name, last_name, age } = req.body;
            const existsResponse = await userService.findUserByEmail(email);
            if (existsResponse.status === 'success') {
                return done(null, false, { message: "Usuario ya existe" });
            }
            
            const hash = createHash(password);
            const userResponse = await userService.createUser({ 
                first_name, 
                last_name, 
                email, 
                age, 
                password: hash 
            });
            
            if (userResponse.status === 'success') {
                return done(null, userResponse.data);
            } else {
                return done(null, false, { message: userResponse.message });
            }
        } catch (err) {
            return done(err);
        }
    }
));

passport.use("login", new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
        try {
            const userResponse = await userService.findUserByEmail(email);
            if (userResponse.status !== 'success') {
                return done(null, false, { message: "Credenciales inválidas" });
            }
            
            const user = userResponse.data;
            if (!isValidPassword(user, password)) {
                return done(null, false, { message: "Credenciales inválidas" });
            }
            
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
        const userResponse = await userService.getUserById(jwt_payload.id);
        if (userResponse.status !== 'success') {
            return done(null, false);
        }
        return done(null, userResponse.data);
    } catch (err) {
        return done(err, false);
    }
}));

export default passport;