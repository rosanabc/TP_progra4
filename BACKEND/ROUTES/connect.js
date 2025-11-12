// connect.js - Microservicio para conexión a la base de datos

const express = require('express');
const odbc = require('odbc');
const router = express.Router();

// Ruta POST para conectar a la base de datos (Login)
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    console.log("datos", username, password);

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Faltan credenciales" });
    }

    try {
        // Intenta conectar a la base de datos con las credenciales
        const connection = await odbc.connect(`DSN=trabajo_final;UID=${username};PWD=${password}`);

        // Almacenar usuario en la sesión
        req.session.user = { username };
        req.session.isAuthenticated = true;
        
        // Cerrar conexión (opcional, depende si la quieres mantener abierta)
        await connection.close();

        return res.status(200).json({ success: true, message: "Inicio de sesión exitoso" });
    } catch (error) {
        console.error("Error al conectar:", error);
        return res.status(401).json({ success: false, message: "Credenciales incorrectas o error de conexión" });
    }
});

// Middleware para verificar autenticación en rutas protegidas
// function isAuthenticated(req, res, next) {
//     if (req.session && req.session.user) {
//         return next();
//     }
//     return res.status(401).json({ success: false, message: "No autorizado" });
// }

// Ruta GET de prueba protegida
// router.get('/test-auth', isAuthenticated, (req, res) => {
//     res.json({ success: true, message: `Hola, ${req.session.user.username}! Estás autenticado.` });
// });

module.exports = router;
