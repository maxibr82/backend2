import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import passport from './config/passport.js';
import sessionsRouter from './routes/sessions.router.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import userRouter from './routes/user.router.js';
import adminRouter from './routes/adminRouter.js';
import passwordResetRouter from './routes/passwordResetRouter.js';
import ticketRouter from './routes/ticketRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';

dotenv.config();

const app = express();

const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
    helpers: {
        multiply: function(a, b) {
            return a * b;
        }
    }
}));
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

// Configuración de sesión con MongoDB Atlas
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 3600
    }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Passport
app.use(passport.initialize());

// Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/users', userRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/password-reset', passwordResetRouter);
app.use('/api/tickets', ticketRouter);
app.use('/', viewsRouter);

const PORT = process.env.PORT || 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

const io = new Server(httpServer);

websocket(io);