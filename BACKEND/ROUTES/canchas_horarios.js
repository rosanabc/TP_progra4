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

// Ruta para obtener todos los horarios por cancha
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const query = `
            SELECT 
                CANCHAS_HORARIOS.CANCHA_HORARIO,
                CANCHAS_HORARIOS.CANCHA_DEPORTE,
                CANCHAS_HORARIOS.HORA_INICIO_DISPO,
                CANCHAS_HORARIOS.HORA_FIN_DISPO,
                CANCHAS_HORARIOS.PRECIO_COSTO, 
                CAST(CANCHAS_DEPORTES.CANCHA AS VARCHAR) || ' - ' || DEPORTES.NOMBRE AS CANCHADEPORTE
            FROM 
                CANCHAS_HORARIOS
            JOIN 
                CANCHAS_DEPORTES ON CANCHAS_HORARIOS.CANCHA_DEPORTE = CANCHAS_DEPORTES.CANCHA_DEPORTE
            JOIN 
                DEPORTES ON CANCHAS_DEPORTES.DEPORTE = DEPORTES.DEPORTE
            ORDER BY 
                CANCHAS_HORARIOS.CANCHA_HORARIO DESC;
        `;
        const result = await connection.query(query);        
        await connection.close();
        res.json({ success: true, canchas_horarios: result });
    } catch (err) {
        console.error('Error al obtener horarios por cancha:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener horarios por cancha.' });
    }
});

// Ruta GET para obtener un horario por cancha específico por su ID
router.get('/cancha_horario/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM CANCHAS_HORARIOS WHERE CANCHA_HORARIO = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, cancha_horario: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Horario por cancha no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener horario por cancha:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener horario por cancha.' });
    }
});

// Ruta para agregar un nuevo horario por cancha
router.post('/add', authMiddleware, async (req, res) => {
    const { cancha_deporte, hora_inicio_dispo, hora_fin_dispo, precio_costo } = req.body;

    if (!cancha_deporte || !hora_inicio_dispo || !hora_fin_dispo || !precio_costo) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios'});
    }

    try {
        const query = `
            INSERT INTO CANCHAS_HORARIOS
            (CANCHA_DEPORTE, HORA_INICIO_DISPO, HORA_FIN_DISPO, PRECIO_COSTO)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            parseInt(cancha_deporte),
            hora_inicio_dispo,
            hora_fin_dispo,
            parseFloat(precio_costo),
        ];

        const connection = await getConnection();
        await connection.query(query, params);
        await connection.close();

        res.json({ success: true, message: 'Horario por cancha agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar horario por cancha:', err);

        let errorMessage = 'Error al agregar horario por cancha.';
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

// Ruta para actualizar un horario por cancha existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del horario por cancha debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const camposParaActualizar = [];
        const valores = [];

        // Construir dinámicamente los campos para actualizar
        for (const [key, value] of Object.entries(campos)) {
            if (value !== undefined && value !== null && value !== '') {
                camposParaActualizar.push(`${key.toUpperCase()} = ?`);
                valores.push(value);
            }
        }

        // Validar que haya al menos un campo a actualizar
        if (camposParaActualizar.length === 0) {
            return res.status(400).json({ success: false, error: 'No se enviaron campos válidos para actualizar.' });
        }

        valores.push(id);
        const query = `UPDATE CANCHAS_HORARIOS SET ${camposParaActualizar.join(', ')} WHERE CANCHA_HORARIO = ?`;

        const result = await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Horario por cancha actualizado exitosamente.' });

    } catch (err) {
        console.error('Error al actualizar horario por cancha:', err);

        let errorMessage = 'Error al actualizar horario por cancha.';
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.state === 'HY000') {
                const raiserrorMatch = odbcError.message.match(/RAISERROR executed: (.+)/);
                if (raiserrorMatch && raiserrorMatch[1]) {
                    errorMessage = raiserrorMatch[1].trim();
                }
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para eliminar un deporte por cancha
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        await connection.query('DELETE FROM CANCHAS_HORARIOS WHERE CANCHA_HORARIO = ?', [id]);
        await connection.close();

        res.json({ success: true, message: 'Horario por cancha eliminado correctamente.' });
    } catch (err) {
        console.error('Error al eliminar el horario por cancha:', err);

        let errorMessage = 'Error inesperado al intentar eliminar el horario por cancha.';

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];

            if (odbcError.code === -198 || odbcError.state === '23000') {
                errorMessage = 'No se puede eliminar el horario por cancha porque está siendo referenciado en otras tablas.';
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