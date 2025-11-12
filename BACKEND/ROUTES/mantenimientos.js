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

function isAuthenticated(req, res, next) {


    if (req.session.isAuthenticated) {
        console.log("Sesión actual:",req.session.isAuthenticated );
        console.log("Sesión actual:",req.session);
        return next();
    }else{
        //return res.status(401).json({ error: "No autorizado" });
        res.redirect('/login');
    }
}

// Ruta para obtener todos los mantenimientos
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const connection = await getConnection();
        const query = `
            SELECT 
                MANTENIMIENTOS.MANTENIMIENTO, 
                CANCHAS.CANCHA AS NUMERO_CANCHA,  
                MANTENIMIENTOS.MOTIVO_MANTENIMIENTO,
                MANTENIMIENTOS.FECHA_INICIO, 
                MANTENIMIENTOS.FECHA_FIN,
                MANTENIMIENTOS.HORA_INICIO,
                MANTENIMIENTOS.HORA_FIN
            FROM 
                MANTENIMIENTOS
            JOIN 
                CANCHAS ON MANTENIMIENTOS.CANCHA = CANCHAS.CANCHA
            ORDER BY 
                MANTENIMIENTOS.FECHA_INICIO DESC;
        `;
        const result = await connection.query(query);
        await connection.close();
        res.json({ success: true, mantenimientos: result });
    } catch (err) {
        console.error('Error al obtener mantenimientos:', err);
        res.status(500).json({ success: false, error: 'Error al obtener mantenimientos.' });
    }
});

// Ruta GET para obtener un mantenimiento específico por su ID
router.get('/mantenimiento/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del mantenimiento debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM MANTENIMIENTOS WHERE MANTENIMIENTO = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, mantenimiento: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Mantenimiento no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener mantenimiento:', err);
        res.status(500).json({ success: false, error: 'Error al obtener mantenimiento.', details: err.message });
    }
});

// Ruta para agregar un nuevo mantenimiento
router.post('/add', isAuthenticated, async (req, res) => {
    const { cancha, motivo_mantenimiento, fecha_inicio, fecha_fin, hora_inicio, hora_fin } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!cancha || !motivo_mantenimiento || !fecha_inicio || !fecha_fin || !hora_fin) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios a excepcion de la hora de inicio.' });
    }

    try {
        const connection = await getConnection();
        const query = `
            INSERT INTO MANTENIMIENTOS
            (CANCHA, MOTIVO_MANTENIMIENTO, FECHA_INICIO, FECHA_FIN, HORA_INICIO, HORA_FIN) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [
            parseInt(cancha, 10),
            motivo_mantenimiento.trim(),
            fecha_inicio,
            fecha_fin,
            hora_inicio,
            hora_fin,
        ]);
        await connection.close();
        res.json({ success: true, message: 'Mantenimiento agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar mantenimiento:', err);

        let errorMessage = 'Error al agregar mantenimiento.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para actualizar un mantenimiento existente por ID
router.post('/update/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del mantenimiento debe ser un número válido.' });
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
        const query = `UPDATE MANTENIMIENTOS SET ${camposParaActualizar.join(', ')} WHERE MANTENIMIENTO = ?`;

        await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Mantenimiento actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar mantenimiento:', err);

        let errorMessage = 'Error al actualizar mantenimiento.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para eliminar un mantenimiento
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del mantenimiento debe ser un número válido.' });
    }

    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM MANTENIMIENTOS WHERE MANTENIMIENTO = ?', [id]);
        res.json({ success: true, message: 'Mantenimiento eliminado correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar el mantenimiento:', err);

        let errorMessage = 'Error inesperado al intentar eliminar el mantenimiento.';

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];

            if (odbcError.code === -198 || odbcError.state === '23000') {
                errorMessage = 'No se puede eliminar el mantenimiento porque está siendo referenciado en otras tablas.';
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
