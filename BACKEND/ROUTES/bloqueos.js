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

// Ruta para obtener todos los bloqueos
router.get('/', async (req, res) => {
    try {
        //console.log("Consultando bloqueos...");  
        const connection = await getConnection();
        const query = `
        SELECT 
            BLOQUEOS.BLOQUEO, 
            CLIENTES.NOMBRE + ' ' + CLIENTES.APELLIDO AS CLIENTE_NOMBRE,  
            BLOQUEOS.MOTIVO_BLOQUEO, 
            BLOQUEOS.FECHA_INICIO,
            BLOQUEOS.FECHA_FIN 
        FROM 
            BLOQUEOS
        JOIN 
            CLIENTES ON BLOQUEOS.CLIENTE = CLIENTES.CLIENTE
        ORDER BY 
            BLOQUEOS.BLOQUEO;
    `;
    const result = await connection.query(query);        await connection.close();
        res.json({ success: true, bloqueos: result });
    } catch (err) {
        console.error('Error al obtener bloqueos:', err);
        res.status(500).json({ success: false, error: 'Error al obtener bloqueos.' });
    }
});

// Ruta GET para obtener un bloqueo específico por su ID
router.get('/bloqueo/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del bloqueo debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM BLOQUEOS WHERE BLOQUEO = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, bloqueo: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Bloqueo no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener bloqueo:', err);
        res.status(500).json({ success: false, error: 'Error al obtener bloqueo.' });
    }
});

// Ruta para agregar un nuevo bloqueo
router.post('/add', authMiddleware, async (req, res) => {
    const { cliente, motivo_bloqueo, fecha_inicio, fecha_fin } = req.body;

    if (!cliente || !motivo_bloqueo || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    try {
        const connection = await getConnection();
        const query = `
            INSERT INTO BLOQUEOS 
            (CLIENTE, MOTIVO_BLOQUEO, FECHA_INICIO, FECHA_FIN) 
            VALUES (?, ?, ?, ?)
        `;
        await connection.query(query, [
            parseInt(cliente, 10),
            motivo_bloqueo.trim(),
            fecha_inicio,
            fecha_fin,
        ]);
        await connection.close();
        res.json({ success: true, message: 'Bloqueo agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar bloqueo:', err);

        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                return res.status(500).json({ success: false, error: raiserrorMatch[1].trim() });
            }
        }

        res.status(500).json({ success: false, error: 'Error al agregar bloqueo.' });
    }
});

// Ruta para actualizar un bloqueo existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del bloqueo debe ser un número válido.' });
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
        const query = `UPDATE BLOQUEOS SET ${camposParaActualizar.join(', ')} WHERE BLOQUEO = ?`;

        await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Bloqueo actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar bloqueo:', err);

        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                return res.status(500).json({ success: false, error: raiserrorMatch[1].trim() });
            }
        }

        res.status(500).json({ success: false, error: 'Error al actualizar bloqueo.' });
    }
});

// Ruta para eliminar un bloqueo
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del bloqueo debe ser un número válido.' });
    }
    
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM BLOQUEOS WHERE BLOQUEO = ?', [id]);
        res.json({ success: true, message: 'Bloqueo eliminado correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar el bloqueo:', err);

        let errorMessage = 'Error inesperado al intentar eliminar el bloqueo.';

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];

            if (odbcError.code === -198 || odbcError.state === '23000') {
                errorMessage = 'No se puede eliminar el bloqueo porque está siendo referenciado en otras tablas.';
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
