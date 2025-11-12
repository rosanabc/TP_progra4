const express = require('express');
const router = express.Router();
const { enviarCorreoReserva } = require('../mailer');
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

router.get('/estado_reservas', authMiddleware, async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        //Consulta con nombres completos en lugar de códigos
        const result = await connection.query(`
            SELECT 
                CASE 
                    WHEN ESTADO_RESERVA = 'P' THEN 'Pagada'
                    WHEN ESTADO_RESERVA = 'E' THEN 'En Espera'
                    WHEN ESTADO_RESERVA = 'C' THEN 'Cancelada'
                    ELSE 'Desconocido'
                END AS estado, 
                COUNT(*) AS cantidad
            FROM RESERVAS
            WHERE MONTH(FECHA_RESERVA) = MONTH(CURRENT DATE)
            AND YEAR(FECHA_RESERVA) = YEAR(CURRENT DATE)
            GROUP BY ESTADO_RESERVA
        `);

        await connection.close();

        // Calcular total de reservas del mes
        const totalReservasMes = result.reduce((sum, row) => sum + row.cantidad, 0);

        res.json({
            success: true,
            totalReservasMes,
            data: result.map(row => ({
                estado: row.estado,
                cantidad: row.cantidad,
            })),
        });
    } catch (err) {
        console.error('Error al obtener estados de reservas:', err.message);
        res.status(500).json({ success: false, error: 'Error al obtener estados de reservas.' });
    }
});

// Ruta para obtener el total de reservas del mes actual
router.get('/total-mes', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query(`
            SELECT COUNT(*) AS total 
            FROM RESERVAS 
            WHERE MONTH(FECHA_RESERVA) = MONTH(GETDATE()) 
            AND YEAR(FECHA_RESERVA) = YEAR(GETDATE())
        `);
        await connection.close();
        res.json({ success: true, total: result[0].total });
    } catch (err) {
        console.error('Error al obtener el total de reservas del mes:', err);
        res.status(500).json({ success: false, error: 'Error al obtener el total de reservas del mes.' });
    }
});

// Ruta para obtener todas las reservas
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const query = `
            SELECT 
                RESERVAS.RESERVA, 
                CLIENTES.NOMBRE + ' ' + CLIENTES.APELLIDO AS NOMBRE_CLIENTE,
                RESERVAS.FECHA_RESERVA,
                CAST(CANCHAS_DEPORTES.CANCHA AS VARCHAR) || ' - ' || DEPORTES.NOMBRE AS CANCHADEPORTE, -- Conversión a VARCHAR para la concatenación
                CAST(RESERVAS.HORA_INICIO_RESERVA AS VARCHAR) || ' - ' || CAST(RESERVAS.HORA_FIN_RESERVA AS VARCHAR) AS HORARIO_RESERVADO,
                RESERVAS.ESTADO_RESERVA,
                TIPOS_DESCUENTOS.NOMBRE AS TIPO_DESCUENTO_NOMBRE,
                RESERVAS.PRECIO_TOTAL 
            FROM 
                RESERVAS
            JOIN 
                CLIENTES ON RESERVAS.CLIENTE = CLIENTES.CLIENTE
            JOIN 
                TIPOS_DESCUENTOS ON RESERVAS.TIPO_DESCUENTO = TIPOS_DESCUENTOS.TIPO_DESCUENTO
            JOIN 
                CANCHAS_HORARIOS ON RESERVAS.CANCHA_HORARIO = CANCHAS_HORARIOS.CANCHA_HORARIO
            JOIN 
                CANCHAS_DEPORTES ON CANCHAS_HORARIOS.CANCHA_DEPORTE = CANCHAS_DEPORTES.CANCHA_DEPORTE
            JOIN 
                DEPORTES ON CANCHAS_DEPORTES.DEPORTE = DEPORTES.DEPORTE
            ORDER BY 
                RESERVAS.FECHA_RESERVA DESC;
        `;
        const result = await connection.query(query);
        await connection.close();
        res.json({ success: true, reservas: result });
    } catch (err) {
        console.error('Error al obtener reservas:', err);
        res.status(500).json({ success: false, error: 'Error al obtener reservas.' });
    }
});

// Ruta GET para obtener una reserva específico por su ID
router.get('/reserva/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la reserva debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM RESERVAS WHERE RESERVA = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, reserva: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Reserva no encontrada.' });
        }
    } catch (err) {
        console.error('Error al obtener reserva:', err);
        res.status(500).json({ success: false, error: 'Error al obtener reserva.', details: err.message });
    }
});

// Ruta para agregar una nueva reserva y enviar el correo
router.post('/add', authMiddleware, async (req, res) => {
    const { cliente, fecha_reserva, cancha_horario, hora_inicio_reserva, hora_fin_reserva, tipo_descuento } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!cliente || !fecha_reserva || !cancha_horario || !hora_inicio_reserva || !hora_fin_reserva || !tipo_descuento) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    let connection;
    try {
        connection = await getConnection();

        //Insertar la reserva en la base de datos
        const insertQuery = `
            INSERT INTO RESERVAS
            (CLIENTE, FECHA_RESERVA, CANCHA_HORARIO, HORA_INICIO_RESERVA, HORA_FIN_RESERVA, TIPO_DESCUENTO) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await connection.query(insertQuery, [
            parseInt(cliente, 10),
            fecha_reserva,
            parseInt(cancha_horario, 10),
            hora_inicio_reserva.trim(),
            hora_fin_reserva.trim(),
            parseInt(tipo_descuento, 10),
        ]);

        //Obtener el ID de la reserva recién insertada
        const identityQuery = `SELECT @@IDENTITY AS RESERVA;`;
        const result = await connection.query(identityQuery);

        if (!result || result.length === 0) {
            return res.status(500).json({ success: false, error: 'Error al obtener el ID de la reserva.' });
        }

        const reservaId = result[0].RESERVA; // Obtenemos el ID correcto

        //Obtener los datos completos de la reserva, incluyendo el email desde la BD
        const selectQuery = `
            SELECT c.CORREO, c.NOMBRE AS NOMBRE_CLIENTE, r.RESERVA, r.FECHA_RESERVA, 
                r.HORA_INICIO_RESERVA, r.HORA_FIN_RESERVA, td.NOMBRE AS TIPO_DESCUENTO_NOMBRE,
                cd.cancha as NRO_CANCHA, d.nombre as NOMBRE_DEPORTE 
            FROM RESERVAS r
            JOIN CLIENTES c ON r.CLIENTE = c.CLIENTE
            JOIN TIPOS_DESCUENTOS td ON r.TIPO_DESCUENTO = td.TIPO_DESCUENTO
            JOIN CANCHAS_HORARIOS ch ON r.CANCHA_HORARIO = ch.CANCHA_HORARIO
            JOIN CANCHAS_DEPORTES cd ON ch.CANCHA_DEPORTE = cd.CANCHA_DEPORTE
            JOIN DEPORTES d ON cd.DEPORTE = d.DEPORTE
            WHERE r.RESERVA = ?
        `;

        const reservaData = await connection.query(selectQuery, [reservaId]);

        if (!reservaData || reservaData.length === 0) {
            return res.status(500).json({ success: false, error: 'Error al recuperar los datos de la reserva.' });
        }

        const reserva = reservaData[0]; // Obtenemos la reserva completa
        const correo = reserva.CORREO; // Extraemos el correo desde la BD

        //Enviar correo con el email recuperado de la BD
        const resultCorreo = await enviarCorreoReserva(correo, reserva);

        if (!resultCorreo.success) {
            console.error("No se pudo enviar el correo:", resultCorreo.error);
            return res.status(500).json({ success: false, error: "Reserva creada, pero el correo no se envió." });
        }

        res.json({ success: true, message: 'Reserva agregada exitosamente y correo enviado.', reserva });
    } catch (err) {
        console.error('Error al agregar reserva:', err);

        let errorMessage = 'Error al agregar reserva.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// Ruta para actualizar una reserva existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la reserva debe ser un número válido.' });
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
        const query = `UPDATE RESERVAS SET ${camposParaActualizar.join(', ')} WHERE RESERVA = ?`;

        await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Reserva actualizada exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar reserva:', err);

        let errorMessage = 'Error al actualizar reserva.';
        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                errorMessage = raiserrorMatch[1].trim();
            }
        }
        res.status(500).json({ success: false, error: errorMessage });
    }
});

// Ruta para eliminar una reserva
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID de la reserva debe ser un número válido.' });
    }

    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM RESERVAS WHERE RESERVA = ?', [id]);
        res.json({ success: true, message: 'Reserva eliminada correctamente.' });
    } catch (err) {
        console.error('Error al eliminar la reserva:', err);

        let errorMessage = 'Error inesperado al intentar eliminar la reserva.';

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];

            if (odbcError.code === -198 || odbcError.state === '23000') {
                errorMessage = 'No se puede eliminar la reserva porque está siendo referenciada en otras tablas.';
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
