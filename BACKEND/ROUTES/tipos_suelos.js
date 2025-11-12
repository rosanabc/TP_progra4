const express = require('express');
const router = express.Router();
const odbc = require('odbc');

// Cadena de conexión a la base de datos
const connectionString = 'DSN=trabajo_final;UID=dba;PWD=sql;CharSet=UTF8;';

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

// Ruta para obtener todos los tipos de suelos
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM TIPOS_SUELOS ORDER BY NOMBRE');
        await connection.close();
        res.json({ success: true, tipos_suelos: result });
    } catch (err) {
        console.error('Error al obtener tipos de suelos:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener tipos de suelos.' });
    }
});

// Ruta GET para obtener un tipo de suelo específico por su ID
router.get('/tipo_suelo/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM TIPOS_SUELOS WHERE TIPO_SUELO = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, tipo_suelo: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Tipo de suelo no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener tipo de suelo:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener tipo de suelo.' });
    }
});

// Ruta para agregar un nuevo tipo de suelo
router.post('/add', authMiddleware, async (req, res) => {
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ success: false, error: 'El campo "nombre" es obligatorio.' });
    }

    let connection;
    try {
        connection = await getConnection();
        await connection.query('INSERT INTO TIPOS_SUELOS (NOMBRE) VALUES (?)', [nombre.trim()]);
        res.json({ success: true, message: 'Tipo de suelo agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar tipo de suelo:', err);

        // Capturar el mensaje específico del RAISERROR
        let errorMessage = 'Error al agregar el tipo de suelo.';
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.state === 'HY000') {
                const raiserrorMatch = odbcError.message.match(/RAISERROR executed: (.+)/);
                if (raiserrorMatch && raiserrorMatch[1]) {
                    errorMessage = raiserrorMatch[1].trim();
                }
            }
        }

        res.status(400).json({ success: false, error: errorMessage });
    } finally {
        if (connection) await connection.close();
    }
});


// Ruta para actualizar un tipo de suelo existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del tipo de suelo debe ser un número válido.' });
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ success: false, error: 'El campo "nombre" es obligatorio.' });
    }

    let connection;
    try {
        connection = await getConnection();

        // Ejecuta la consulta de actualización
        const result = await connection.query('UPDATE TIPOS_SUELOS SET NOMBRE = ? WHERE TIPO_SUELO = ?', [nombre.trim(), id]);
        res.json({ success: true, message: 'Tipo de suelo actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar tipo de suelo:', err.message);
        let errorMessage = 'Error al actualizar el tipo de suelo.';

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


// Ruta para eliminar un tipo de suelo
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del tipo de suelo debe ser un número válido.' });
    }

    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM TIPOS_SUELOS WHERE TIPO_SUELO = ?', [id]);
        res.json({ success: true, message: 'Tipo de suelo eliminado correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar tipo de suelo:', err.message);

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.code === -198 || odbcError.state === '23000') {
                return res.status(409).json({ success: false, error: 'No se puede eliminar el tipo de suelo porque está siendo referenciado en otras tablas.' });
            }
        }

        res.status(500).json({ success: false, error: 'Error inesperado al intentar eliminar el tipo de suelo.' });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
