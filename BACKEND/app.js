const express = require('express');
const path = require('path');

// Imports para Autentificacion
const session = require('express-session');

//Importa los microservicios
const connectRouter = require('./ROUTES/connect'); // Ruta para conexion
const deportesRouter = require('./ROUTES/deportes'); // Ruta para modulo deportes
const tipos_suelosRouter = require('./ROUTES/tipos_suelos'); // Ruta para modulo tipos de suelos
const estados_canchasRouter = require('./ROUTES/estados_canchas'); // Ruta para modulo estados de canchas
const ubicacionesRouter = require('./ROUTES/ubicaciones'); // Ruta para modulo ubicaciones
const tipos_pagosRouter = require('./ROUTES/tipos_pagos'); // Ruta para modulo tipos de pago
const canchas_deportesRouter = require('./ROUTES/canchas_deportes'); // Ruta para modulo deportes por cancha
const tipos_descuentosRouter = require('./ROUTES/tipos_descuentos'); // Ruta para modulo tipos de descuento
const canchasRouter = require('./ROUTES/canchas'); // Ruta para modulo canchas
const mantenimientosRouter = require('./ROUTES/mantenimientos'); // Ruta para modulo mantenimientos
const clientesRouter = require('./ROUTES/clientes'); // Ruta para modulo clientes
const bloqueosRouter = require('./ROUTES/bloqueos'); // Ruta para modulo bloqueos
const canchas_horariosRouter = require('./ROUTES/canchas_horarios'); // Ruta para modulo horarios por cancha
const reservasRouter = require('./ROUTES/reservas'); // Ruta para modulo reservas
const reservas_pagosRouter = require('./ROUTES/reservas_pagos'); // Ruta para modulo pagos de reserva
const cancelacionesRouter = require('./ROUTES/cancelaciones'); // Ruta para modulo cancelaciones

const app = express();
const PORT = 3000;

// Middleware para analizar datos en formato JSON
app.use(express.json());

// Configuración de sesiones
app.use(session({
    secret: 'clave_secreta_segura', // Cambia esto por una clave más segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false,
            httpOnly: true
     } 
}));

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    console.log("Sesión actual:",req.session.isAuthenticated );
    console.log("Sesión actual:",req.session);

    if (req.session.isAuthenticated) {
        return next();
    }else{
        //return res.status(401).json({ error: "No autorizado" });
        res.redirect('/login');
    }
}

app.post('/authenticate', (req, res) => {
    const { username, password } = req.body;

    const user = { username:DBA, password:sql };

    // Verificar si el nombre de usuario es incorrecto
    if (username !== user.username) {
        return res.status(401).send({ message: 'El usuario es incorrecto' });
    }

    // Verificar si la contraseña es incorrecta
    if (password !== user.password) {
        return res.status(401).send({ message: 'La contraseña es incorrecta' });
    }
    req.session.isAuthenticated = true;
    res.status(200).send({ message: 'Inicio de sesión exitoso' });

      try {
        //console.log("datos", username, password);
        // Enviar solicitud de conexión al backend
        const response = fetch('/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (response.ok) {
            toastr.success("Conexión exitosa. Redirigiendo...", "¡Éxito!");
            setTimeout(() => {
                window.location.href = 'home.html'; // Redirige a home.html en caso de éxito
            }, 1000); // Espera 2 segundos antes de redirigir
        } else {
            toastr.error("Error en la conexión. Por favor, verifica tus credenciales.", "Error");
        }
    } catch (error) {
        toastr.error("Error al intentar conectar. Por favor, inténtalo nuevamente.", "Error");
    }
});

app.get('/salir', (req, res) => {
    // console.log ("salida de todo ", req.session);
    req.session.isAuthenticated = false;
    console.log ("salida de todo ", req.session);

    req.session.destroy(err => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send("Error al cerrar sesión.");
        }

        console.log("Sesión destruida exitosamente.");
        res.clearCookie('connect.sid'); // Eliminar cookie de sesión
        res.redirect('/login'); // Redirigir al login
    });
});

// Rutas de frontend
app.get('/', (req, res) => {
    res.redirect('/login'); // Redirige la base hacia /login
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/PUBLIC/login.html'));
});

//Rutas para modulo de deportes
app.get('/list_deportes', isAuthenticated , (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_deportes.html'));
});

app.get('/add_deporte', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_deporte.html'));
});

app.get('/upd_deporte', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_deporte.html'));
});

//Rutas para modulo de tipos de suelo
app.get('/list_tipos-suelos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_tipos-suelos.html'));
});

app.get('/add_tipo-suelo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_tipo-suelo.html'));
});

app.get('/upd_tipo-suelo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_tipo-suelo.html'));
});

//Rutas para modulo de estados de cancha
app.get('/list_estados-canchas', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_estados-canchas.html'));
});

app.get('/add_estado-cancha', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_estado-cancha.html'));
});

app.get('/upd_estado-cancha', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_estado-cancha.html'));
});

//Rutas para modulo de ubicaciones
app.get('/list_ubicaciones', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_ubicaciones.html'));
});

app.get('/add_ubicacion', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_ubicacion.html'));
});

app.get('/upd_ubicacion', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_ubicacion.html'));
});

//Rutas para modulo de tipos de pago
app.get('/list_tipos-pagos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_tipos-pagos.html'));
});

app.get('/add_tipo-pago', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_tipo-pago.html'));
});

app.get('/upd_tipo-pago', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_tipo-pago.html'));
});

//Rutas para modulo de deportes por cancha
app.get('/list_canchas-deportes', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_canchas-deportes.html'));
});

app.get('/add_cancha-deporte', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_cancha-deporte.html'));
});

app.get('/upd_cancha-deporte', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_cancha-deporte.html'));
});

//Rutas para modulo de tipos de descuento
app.get('/list_tipos-descuentos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_tipos-descuentos.html'));
});

app.get('/add_tipo-descuento', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_tipo-descuento.html'));
});

app.get('/upd_tipo-descuento', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_tipo-descuento.html'));
});

//Rutas para modulo de canchas
app.get('/list_canchas', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_canchas.html'));
});

app.get('/add_canchas', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_canchas.html'));
});

app.get('/upd_canchas', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_canchas.html'));
});

//Rutas para modulo de mantenimientos
app.get('/list_mantenimientos', isAuthenticated, (req, res) => {
    console.log ("ASDSADASDSADSA");
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_mantenimientos.html'));
});

app.get('/add_mantenimiento', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_mantenimiento.html'));
});

app.get('/upd_mantenimiento', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_mantenimiento.html'));
});

//Rutas para modulo de clientes
app.get('/list_clientes', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_clientes.html'));
});

app.get('/add_cliente', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_cliente.html'));
});

app.get('/upd_cliente', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_cliente.html'));
});

//Rutas para modulo de bloqueos
app.get('/list_bloqueos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_bloqueos.html'));
});

app.get('/add_bloqueo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_bloqueo.html'));
});

app.get('/upd_bloqueo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_bloqueo.html'));
});

//Rutas para modulo de horarios por cancha
app.get('/list_canchas_horarios', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_horarios-canchas.html'));
});

app.get('/add_cancha-horario', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_horario-cancha.html'));
});

app.get('/upd_cancha-horario', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_horario-cancha.html'));
});

//Rutas para modulo de reservas
app.get('/list_reservas', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_reservas.html'));
});

app.get('/add_reserva', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_reserva.html'));
});

app.get('/upd_reserva', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_reserva.html'));
});

//Rutas para modulo de pagos de reserva
app.get('/list_reservas-pagos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_reservas-pagos.html'));
});

app.get('/add_reserva-pago', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_reserva-pago.html'));
});

app.get('/upd_reserva-pago', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_reserva-pago.html'));
});

//Rutas para modulo de cancelaciones
app.get('/list_cancelaciones', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/list_cancelaciones.html'));
});

app.get('/add_cancelacion', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/add_cancelacion.html'));
});

app.get('/upd_cancelacion', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/PUBLIC/upd_cancelacion.html'));
});

// Rutas de microservicios
app.use('/connect', connectRouter);

app.use('/deportes', isAuthenticated, deportesRouter);
app.use('/tipos_suelos', isAuthenticated, tipos_suelosRouter);
app.use('/estados_canchas', isAuthenticated, estados_canchasRouter);
app.use('/ubicaciones', isAuthenticated, ubicacionesRouter);
app.use('/tipos_pagos', isAuthenticated, tipos_pagosRouter);
app.use('/canchas_deportes', isAuthenticated, canchas_deportesRouter);
app.use('/tipos_descuentos', isAuthenticated, tipos_descuentosRouter);
app.use('/canchas', isAuthenticated, canchasRouter);
app.use('/mantenimientos', isAuthenticated, mantenimientosRouter);
app.use('/clientes', isAuthenticated, clientesRouter);
app.use('/bloqueos', isAuthenticated, bloqueosRouter);
app.use('/canchas_horarios', isAuthenticated, canchas_horariosRouter);
app.use('/reservas', isAuthenticated, reservasRouter);
app.use('/reservas_pagos', isAuthenticated, reservas_pagosRouter);
app.use('/cancelaciones', isAuthenticated, cancelacionesRouter);

// Sirve archivos estáticos desde la carpeta frontend/public <-Borra el cache
app.use(express.static(path.join(__dirname, '../frontend/public'), {
    index: false, // Evita que cargue index.html automáticamente
    cacheControl: false,
    etag: false,
    lastModified: false
}));

app.use((req, res, next) => {
    res.status(404).json({ success: false, error: "Ruta no encontrada" });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});