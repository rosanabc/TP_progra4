const express = require('express');
const router = express.Router();
const odbc = require('odbc');

// Cadena de conexión a la base de datos
const connectionString = 'DSN=trabajo_final;UID=dba;PWD=sql;CharSet=UTF8;'; // Credenciales actualizadas

// Función para obtener la conexión
const getConnection = async () => {
    try {
        const connection = await odbc.connect(connectionString);
        return connection;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        throw new Error('Error al conectar a la base de datos. Por favor, verifica la configuración.');
    }
};

function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        next(); // El usuario está autenticado, continuar con la solicitud
    } else {
        res.status(401).json({ success: false, error: 'Acceso no autorizado. Inicia sesión.' });
    }
}

// Ruta para obtener todos los deportes
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM DEPORTES ORDER BY NOMBRE');
        await connection.close();
        res.json({ success: true, deportes: result });
    } catch (err) {
        console.error('Error al obtener deportes:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener deportes.' });
    }
});

// Ruta GET para obtener un deporte específico por su ID
router.get('/deporte/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM DEPORTES WHERE DEPORTE = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, deporte: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Deporte no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener deporte:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener deporte.' });
    }
});

// Ruta para agregar un nuevo deporte
router.post('/add', authMiddleware, async (req, res) => {
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ success: false, error: 'El campo "nombre" es obligatorio.' });
    }

    let connection;
    try {
        connection = await getConnection();
        await connection.query('INSERT INTO DEPORTES (NOMBRE) VALUES (?)', [nombre.trim()]);
        res.json({ success: true, message: 'Deporte agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar deporte:', err);

        // Capturar el mensaje específico del RAISERROR
        let errorMessage = 'Error al agregar el deporte.';
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.state === 'HY000') {
                const raiserrorMatch = odbcError.message.match(/RAISERROR executed: (.+)/);
                if (raiserrorMatch && raiserrorMatch[1]) {
                    errorMessage = raiserrorMatch[1].trim(); // Extraer mensaje de RAISERROR
                }
            }
        }

        res.status(400).json({ success: false, error: errorMessage });
    } finally {
        if (connection) await connection.close();
    }
});


// Ruta para actualizar un deporte existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del deporte debe ser un número válido.' });
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ success: false, error: 'El campo "nombre" es obligatorio.' });
    }

    let connection;
    try {
        connection = await getConnection();

        // Ejecuta la consulta de actualización
        const result = await connection.query('UPDATE DEPORTES SET NOMBRE = ? WHERE DEPORTE = ?', [nombre.trim(), id]);
        res.json({ success: true, message: 'Deporte actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar deporte:', err.message);
        let errorMessage = 'Error al actualizar el depoorte.';

        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.state === 'HY000') {
                errorMessage = odbcError.message.split(':')[1].trim();
            }
        }

        res.status(500).json({ success: false, error: errorMessage });
    } finally {
        if (connection) await connection.close();
    }
});


// Ruta para eliminar un deporte
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del deporte debe ser un número válido.' });
    }

    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM DEPORTES WHERE DEPORTE = ?', [id]);
        res.json({ success: true, message: 'Deporte eliminado correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar deporte:', err.message);

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.code === -198 || odbcError.state === '23000') {
                return res.status(409).json({ success: false, error: 'No se puede eliminar el deporte porque está siendo referenciado en otras tablas.' });
            }
        }

        res.status(500).json({ success: false, error: 'Error inesperado al intentar eliminar el deporte.' });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
