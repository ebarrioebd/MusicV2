const express = require('express');
const path = require('path'); 
const logger = require('morgan');
const app = express();


//Configurar las cookies de sesiones
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
app.use(cookieParser()); 
app.use(session({
    secret: 'mi_secreto_super_seguro', // cámbialo por algo más fuerte
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        httpOnly: true,
        secure: false // cambiar a true si usas HTTPS
    }
})); 
//definir rutas
const index = require('./routes/index');
const usuariosRouter = require('./routes/users');
const db = require('./models/database');

// ✅ Middlewares deben ir ANTES de las rutas
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ✅ Rutas ( después de los middlewares )
app.use('/usuarios', usuariosRouter);
app.use('/', index);

// Inicializar base de datos y servidor
async function startServer() {
    try {
        await db.connect();  // ✅ IMPORTANTE: usar await si es async
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
