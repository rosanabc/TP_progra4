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

// Ruta para obtener el total de ingresos del mes actual
router.get('/ingresos-mes', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query(`
            SELECT SUM( MONTO_TOTAL) AS total 
            FROM RESERVAS_PAGOS
            WHERE MONTH(FECHA_PAGO) = MONTH(GETDATE()) 
            AND YEAR(FECHA_PAGO) = YEAR(GETDATE())
        `);
        await connection.close();
        res.json({ success: true, total: result[0].total || 0 });
    } catch (err) {
        console.error('Error al obtener los ingresos del mes:', err);
        res.status(500).json({ success: false, error: 'Error al obtener los ingresos del mes.' });
    }
});

// Ruta para obtener todas los pagos de reservas
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const query = `
            SELECT 
                RESERVAS_PAGOS.RESERVA_PAGO, 
                RESERVAS_PAGOS.MONTO_TOTAL,
                RESERVAS_PAGOS.RESERVA,
                RESERVAS_PAGOS.FECHA_PAGO,
                TIPOS_PAGOS.NOMBRE as TIPO_PAGO_NOMBRE
            FROM 
                RESERVAS_PAGOS
            JOIN 
                TIPOS_PAGOS ON RESERVAS_PAGOS.TIPO_PAGO = TIPOS_PAGOS.TIPO_PAGO
            ORDER BY 
                RESERVAS_PAGOS.RESERVA_PAGO DESC;
        `;
        const result = await connection.query(query);
        await connection.close();
        res.json({ success: true, reservas_pagos: result });
    } catch (err) {
        console.error('Error al obtener pagos de reservas:', err);
        res.status(500).json({ success: false, error: 'Error al obtener pagos de reservas.' });
    }
});

// Ruta GET para obtener un pago de reserva específico por su ID
router.get('/reserva_pago/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del pago de reserva debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM RESERVAS_PAGOS WHERE RESERVA_PAGO = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, reserva_pago: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Pago de reserva no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener pago de reserva:', err);
        res.status(500).json({ success: false, error: 'Error al obtener pago de reserva.', details: err.message });
    }
});

// Ruta para agregar un pago de reserva
router.post('/add', authMiddleware, async (req, res) => {
    const { monto_total, reserva, tipo_pago } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!monto_total || !reserva || !tipo_pago) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    try {
        const connection = await getConnection();
        const query = `
            INSERT INTO RESERVAS_PAGOS
            (MONTO_TOTAL, RESERVA, TIPO_PAGO) 
            VALUES (?, ?, ?)
        `;
        await connection.query(query, [
            parseFloat(monto_total),
            parseInt(reserva, 10),
            parseInt(tipo_pago, 10),
        ]);
        await connection.close();
        res.json({ success: true, message: 'Pago de reserva agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar pago de reserva:', err);

        let errorMessage = 'Error al agregar pago de reserva.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para actualizar un pago de reserva existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del pago de reserva debe ser un número válido.' });
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
        const query = `UPDATE RESERVAS_PAGOS SET ${camposParaActualizar.join(', ')} WHERE RESERVA_PAGO = ?`;

        await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Pago de reserva actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar pago de reserva:', err);

        let errorMessage = 'Error al actualizar pago de reserva.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para obtener un pago de reserva por el ID de la reserva
router.get('/reserva_pago_por_reserva/:reservaId', authMiddleware, async (req, res) => {
    const { reservaId } = req.params;

    if (!reservaId || isNaN(reservaId)) {
        return res.status(400).json({ success: false, error: 'El ID de la reserva debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query(
            'SELECT * FROM RESERVAS_PAGOS WHERE RESERVA = ?',
            [reservaId]
        );
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, reserva_pago: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'No se encontró un pago de reserva para esta reserva.' });
        }
    } catch (err) {
        console.error('Error al obtener pago de reserva:', err);
        res.status(500).json({ success: false, error: 'Error al obtener el pago de reserva.', details: err.message });
    }
});

// Ruta para eliminar un pago de reserva
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM RESERVAS_PAGOS WHERE RESERVA_PAGO = ?', [id]);
        res.json({ success: true, message: 'Pago de reserva eliminado correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar el pago de reserva:', err);

        let errorMessage = 'Error inesperado al intentar eliminar el pago de reserva.';

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];

            if (odbcError.code === -198 || odbcError.state === '23000') {
                errorMessage = 'No se puede eliminar el pago de reserva porque está siendo referenciado en otras tablas.';
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
