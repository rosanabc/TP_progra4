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

router.get('/estado_canchas', authMiddleware, async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        // Consulta para obtener todos los estados y sus cantidades
        const result = await connection.query(`
            SELECT e.NOMBRE AS estado, COALESCE(COUNT(c.CANCHA), 0) AS cantidad
            FROM ESTADOS_CANCHAS e
            LEFT JOIN CANCHAS c ON e.ESTADO_CANCHA = c.ESTADO_CANCHA
            GROUP BY e.NOMBRE
        `);

        await connection.close();

        // Enviar los datos al frontend
        res.json({
            success: true,
            data: result.map(row => ({
                estado: row.estado,
                cantidad: row.cantidad,
            })),
        });
    } catch (err) {
        console.error('Error al obtener estados de canchas:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener estados de canchas.' });
    }
});

// Ruta para obtener todas las canchas
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const query = `
            SELECT 
                CANCHAS.CANCHA, 
                UBICACIONES.NOMBRE AS UBICACION_NOMBRE,  
                ESTADOS_CANCHAS.NOMBRE AS ESTADO_CANCHA_NOMBRE,
                TIPOS_SUELOS.NOMBRE AS TIPO_SUELO_NOMBRE, 
                CANCHAS.TIPO_CANCHA,
                CANCHAS.LUMINICA,
                CANCHAS.BEBEDERO,
                CANCHAS.BANHOS,
                CANCHAS.CAMBIADOR
            FROM 
                CANCHAS
            JOIN 
                UBICACIONES ON CANCHAs.UBICACION = UBICACIONES.UBICACION
            JOIN
                ESTADOS_CANCHAS ON CANCHAS.ESTADO_CANCHA = ESTADOS_CANCHAS.ESTADO_CANCHA
            JOIN
                TIPOS_SUELOS ON CANCHAS.TIPO_SUELO = TIPOS_SUELOS.TIPO_SUELO
            ORDER BY 
                CANCHAS.CANCHA;
        `;
        const result = await connection.query(query);
        await connection.close();
        res.json({ success: true, canchas: result });
    } catch (err) {
        console.error('Error al obtener canchas:', err);
        res.status(500).json({ success: false, error: 'Error al obtener canchas.' });
    }
});

// Ruta GET para obtener una cancha específico por su ID
router.get('/cancha/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query(`SELECT * FROM CANCHAS WHERE CANCHA = ?`, [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, cancha: result[0] });
        } else {
            res.json({ success: false, error: 'Cancha no encontrada.' });
        }
    } catch (err) {
        console.error('Error al obtener cancha:', err);
        res.status(500).json({ success: false, error: 'Error al obtener cancha.', details: err.message });
    }
});

// Ruta para agregar una nueva cancha
router.post('/add', authMiddleware, async (req, res) => {
    const { ubicacion, estado_cancha, tipo_suelo, tipo_cancha, luminica, bebedero, banho, cambiador } = req.body;

    // Validación de campos obligatorios
    if (!ubicacion || !estado_cancha || !tipo_suelo || !tipo_cancha || !luminica || !bebedero || !banho || !cambiador) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    try {
        const connection = await getConnection();
        const query = `
            INSERT INTO CANCHAS
            (UBICACION, ESTADO_CANCHA, TIPO_SUELO, TIPO_CANCHA, LUMINICA, BEBEDERO, BANHOS, CAMBIADOR)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [
            parseInt(ubicacion),
            parseInt(estado_cancha),
            parseInt(tipo_suelo),
            tipo_cancha.trim(),
            luminica.trim(),
            bebedero.trim(),
            banho.trim(),
            cambiador.trim(),
        ]);
        await connection.close();
        res.json({ success: true, message: 'Cancha agregada exitosamente.' });
    } catch (err) {
        console.error('Error al agregar cancha:', err);

        // Manejo de errores específicos provenientes de la base de datos
        let errorMessage = 'Error al agregar cancha.';
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
    }
});

// Ruta para actualizar una cancha existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la cancha debe ser un número válido.' });
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
        const query = `UPDATE CANCHAS SET ${camposParaActualizar.join(', ')} WHERE CANCHA = ?`;

        const result = await connection.query(query, valores);
        await connection.close();

        res.json({ success: true, message: 'Cancha actualizada exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar cancha:', err);

        let errorMessage = 'Error al actualizar cancha.';
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.state === 'HY000') {
                const raiserrorMatch = odbcError.message.match(/RAISERROR executed: (.+)/);
                if (raiserrorMatch && raiserrorMatch[1]) {
                    errorMessage = raiserrorMatch[1].trim();
                }
            }
            else if (err.odbcErrors && err.odbcErrors.length > 0) {
                const odbcError = err.odbcErrors[0];
                if (odbcError.state === '23000') {
                    errorMessage = 'No se puede actualizar la cancha porque está relacionada con otras entidades.';
                }
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para eliminar una cancha
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la cancha debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('DELETE FROM CANCHAS WHERE CANCHA = ?', [id]);
        await connection.close();

        res.json({ success: true, message: 'Cancha eliminada correctamente.' });
    } catch (err) {
        console.error('Error al eliminar la cancha:', err);

        let errorMessage = 'Error inesperado al intentar eliminar la cancha.';

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];

            if (odbcError.code === -198 || odbcError.state === '23000') {
                errorMessage = 'No se puede eliminar la cancha porque está siendo referenciada en otras tablas.';
            } else if (odbcError.state === 'HY000') {
                const raiserrorMatch = odbcError.message.match(/RAISERROR executed: (.+)/);
                if (raiserrorMatch && raiserrorMatch[1]) {
                    errorMessage = raiserrorMatch[1].trim();
                }
            }
        }

        res.status(500).json({ success: false, error: errorMessage });
    }
});

module.exports = router;
