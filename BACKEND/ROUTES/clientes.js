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

// Ruta para obtener el total de clientes
router.get('/total', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query("SELECT COUNT(*) AS total FROM CLIENTES where ESTADO like 'H'");
        await connection.close();
        res.json({ success: true, total: result[0].total });
    } catch (err) {
        console.error('Error al obtener el total de clientes:', err);
        res.status(500).json({ success: false, error: 'Error al obtener el total de clientes.' });
    }
});

// Ruta para obtener todos los clientes
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM CLIENTES ORDER BY APELLIDO ASC');
        await connection.close();
        res.json({ success: true, clientes: result });
    } catch (err) {
        console.error('Error al obtener clientes:', err);
        res.status(500).json({ success: false, error: 'Error al obtener clientes.' });
    }
});

// Ruta GET para obtener un cliente específico por su ID
router.get('/cliente/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del cliente debe ser un número válido.' });
    }

    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM CLIENTES WHERE CLIENTE = ?', [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, cliente: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
        }
    } catch (err) {
        console.error('Error al obtener cliente:', err);
        res.status(500).json({ success: false, error: 'Error al obtener cliente.' });
    }
});

// Ruta para agregar un nuevo cliente
router.post('/add', authMiddleware, async (req, res) => {
    const { nombre, apellido, direccion, telefono, correo, numero_documento, edad, estado, barrio, pais, ciudad } = req.body;

    if (!nombre || !apellido || !direccion || !telefono || !correo || !numero_documento || !edad || !estado || !barrio || !pais || !ciudad) {
        return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios.' });
    }

    try {
        const connection = await getConnection();
        const query = `
            INSERT INTO CLIENTES 
            (NOMBRE, APELLIDO, DIRECCION, TELEFONO, CORREO, NUMERO_DOCUMENTO, EDAD, ESTADO, BARRIO, PAIS, CIUDAD) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [
            nombre.trim(),
            apellido.trim(),
            direccion.trim(),
            telefono.trim(),
            correo.trim(),
            numero_documento.trim(),
            parseInt(edad, 10),
            estado.trim(),
            barrio.trim(),
            pais.trim(),
            ciudad.trim(),
        ]);
        await connection.close();
        res.json({ success: true, message: 'Cliente agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar cliente:', err);

        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                return res.status(500).json({ success: false, error: raiserrorMatch[1].trim() });
            }
        }

        res.status(500).json({ success: false, error: 'Error al agregar cliente.' });
    }
});

// Ruta para actualizar un cliente existente por ID
router.post('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del cliente debe ser un número válido.' });
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
        const query = `UPDATE CLIENTES SET ${camposParaActualizar.join(', ')} WHERE CLIENTE = ?`;

        await connection.query(query, valores);
        await connection.close();
        res.json({ success: true, message: 'Cliente actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar cliente:', err);

        if (err.odbcErrors && err.odbcErrors[0]?.state === 'HY000') {
            const raiserrorMatch = err.odbcErrors[0].message.match(/RAISERROR executed: (.+)/);
            if (raiserrorMatch && raiserrorMatch[1]) {
                return res.status(500).json({ success: false, error: raiserrorMatch[1].trim() });
            }
        }

        res.status(500).json({ success: false, error: 'Error al actualizar cliente.' });
    }
});

// Ruta para eliminar un cliente
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'El ID del cliente debe ser un número válido.' });
    }
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.query('DELETE FROM CLIENTES WHERE CLIENTE = ?', [id]);
        res.json({ success: true, message: 'Cliente eliminado correctamente.' });      
    } catch (err) {
        console.error('Error al eliminar cliente:', err.message);

        // Manejar errores de claves foráneas
        if (err.odbcErrors && err.odbcErrors.length > 0) {
            const odbcError = err.odbcErrors[0];
            if (odbcError.code === -198 || odbcError.state === '23000') {
                return res.status(409).json({ success: false, error: 'No se puede eliminar el cliente porque está relacionado con otras entidades.' });
            }
        }

        res.status(500).json({ success: false, error: 'Error inesperado al intentar eliminar el cliente.' });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
