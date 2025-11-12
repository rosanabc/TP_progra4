const express = require('express');
const router = express.Router();
const odbc = require('odbc');

// Cadena de conexión a la base de datos
const connectionString = 'DSN=trabajo_final;UID=dba;PWD=sql;CharSet=UTF8;';

// Función para obtener la conexión
const getConnection = async () => {
    try {
        return await odbc.connect(connectionString);
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
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

// Ruta para obtener todas la reservas
router.get('/',  authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query(`SELECT * FROM CANCELACIONES ORDER BY CANCELACION`);
        await connection.close();
        res.json({ success: true, cancelaciones: result });
    } catch (err) {
        console.error('Error al obtener cancelaciones:', err);
        res.status(500).json({ success: false, error: 'Error al obtener cancelaciones.' });
    }
});

// Ruta GET para obtener una cancelcacion específico por su ID
router.get('/cancelacion/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la cancelacion debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM CANCELACIONES WHERE CANCELACION = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, cancelacion: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Cancelacion no encontrada.' });
        }
    } catch (err) {
        console.error('Error al obtener cancelacion:', err);
        res.status(500).json({ success: false, error: 'Error al obtener cancelacion.', details: err.message });
    }
});

// Ruta para agregar una cancelacion
router.post('/add', authMiddleware, async (req, res) => {
    const { reserva, motivo_cancelacion } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!reserva || !motivo_cancelacion) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    try {
        const connection = await getConnection();
        const query = `
            INSERT INTO CANCELACIONES
            (RESERVA, MOTIVO_CANCELACION) 
            VALUES (?, ?)
        `;
        await connection.query(query, [
            parseInt(reserva),
            motivo_cancelacion.trim(),
        ]);
        await connection.close();
        res.json({ success: true, message: 'Cancelacion agregada exitosamente.' });
    } catch (err) {
        console.error('Error al agregar cancelacion:', err);

        let errorMessage = 'Error al agregar cancelacion.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para actualizar una cancelacion existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la cancelacion debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const camposParaActualizar = [];
        const valores = [];

        for (const [key, value] of Object.entries(campos)) {
            if (value !== undefined && value !== null && value !== '') {
                camposParaActualizar.push(`${key.toUpperCase()} = ?`);
                valores.push(value);
            }
        }

        if (camposParaActualizar.length === 0) {
            return res.status(400).json({ success: false, error: 'No se enviaron campos válidos para actualizar.' });
        }

        valores.push(id);
        const query = `UPDATE CANCELACIONES SET ${camposParaActualizar.join(', ')} WHERE CANCELACION = ?`;

        await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Cancelacion actualizada exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar cancelacion:', err);

        let errorMessage = 'Error al actualizar cancelacion.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para eliminar una cancelacion
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la cancelacion debe ser un número válido.' });
    }

    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM CANCELACIONES WHERE CANCELACION = ?', [id]);
        res.json({ success: true, message: 'Cancelacion eliminada correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar la cancelacion:', err);

        let errorMessage = 'Error inesperado al intentar eliminar la cancelacion.';

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];

            if (odbcError.code === -198 || odbcError.state === '23000') {
                errorMessage = 'No se puede eliminar la cancelacion porque está siendo referenciada en otras tablas.';
            } else if (odbcError.state === 'HY000') {
                const raiserrorMatch = odbcError.message.match(/RAISERROR executed: (.+)/);
                if (raiserrorMatch && raiserrorMatch[1]) {
                    errorMessage = raiserrorMatch[1].trim();
                }
            }
        }

        res.status(500).json({ success: false, error: errorMessage });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;