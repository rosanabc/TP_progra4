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

// Ruta para obtener todos los tipos de descuento
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM TIPOS_DESCUENTOS ORDER BY NOMBRE');
        await connection.close();
        res.json({ success: true, tipos_descuentos: result });
    } catch (err) {
        console.error('Error al obtener tipos de descuento:', err);
        res.status(500).json({ success: false, error: 'Error al obtener tipos de descuento.'});
    }
});

// Ruta GET para obtener un tipo de descuento específico por su ID
router.get('/tipo_descuento/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del tipo de descuento debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM TIPOS_DESCUENTOS WHERE TIPO_DESCUENTO = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, tipo_descuento: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Tipo de descuento no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener tipo de descuento:', err);
        res.status(500).json({ success: false, error: 'Error al obtener tipo de descuento.', details: err.message });
    }
});

// Ruta para agregar un nuevo tipo de descuento
router.post('/add', authMiddleware, async (req, res) => {
    const { nombre, fecha_inicio, fecha_fin, porcentaje_descuento } = req.body;

    if (!nombre || !fecha_inicio || !fecha_fin || !porcentaje_descuento) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    try {
        const connection = await getConnection();
        const query = `
            INSERT INTO TIPOS_DESCUENTOS
            (NOMBRE, FECHA_INICIO, FECHA_FIN, PORCENTAJE_DESCUENTO) 
            VALUES (?, ?, ?, ?)
        `;
        await connection.query(query, [
            nombre.trim(),
            fecha_inicio,
            fecha_fin,
            parseInt(porcentaje_descuento, 10),
        ]);
        await connection.close();
        res.json({ success: true, message: 'Tipo de descuento agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar tipo de descuento:', err);

        let errorMessage = 'Error al agregar tipo de descuento.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para actualizar un tipo de descuento
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del tipo de descuento debe ser un número válido.' });
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
        const query = `UPDATE TIPOS_DESCUENTOS SET ${camposParaActualizar.join(', ')} WHERE TIPO_DESCUENTO = ?`;

        await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Tipo de descuento actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar tipo de descuento:', err);

        let errorMessage = 'Error al actualizar tipo de descuento.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para eliminar un tipo de descuento
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del tipo de descuento debe ser un número válido.' });
    }

    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM TIPOS_DESCUENTOS WHERE TIPO_DESCUENTO = ?', [id]);
        res.json({ success: true, message: 'Tipo de descuento eliminado correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar el tipo de descuento:', err.message);

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.code === -198 || odbcError.state === '23000') {
                return res.status(409).json({ success: false, error: 'No se puede eliminar el tipo de descuento porque está siendo referenciado en otras tablas.' });
            }
        }

        res.status(500).json({ success: false, error: 'Error inesperado al intentar eliminar el tipo de descuento.' });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
