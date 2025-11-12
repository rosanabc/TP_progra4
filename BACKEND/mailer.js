const nodemailer = require('nodemailer');

// Configuración del transporte SMTP con Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jose.orte543@gmail.com',
        pass: 'etfz lmzc moqd rvhm'
    }
});

// Función para enviar correo de confirmación de reserva
const enviarCorreoReserva = async (destinatario, reserva) => {
    try {
        const info = await transporter.sendMail({
            from: '"Reservas de Cancha" <jose.orte543@gmail.com>',
            to: destinatario,
            subject: 'Confirmación de Reserva',
            html: `
            <h2>¡Reserva Confirmada!</h2>
            <p>Estimado/a <b>${reserva.NOMBRE_CLIENTE}</b>,</p>
            <p>Su reserva ha sido confirmada con los siguientes detalles:</p>
            <ul>
                <li><b>Fecha:</b> ${reserva.FECHA_RESERVA}</li>
                <li><b>Hora:</b> ${reserva.HORA_INICIO_RESERVA} - ${reserva.HORA_FIN_RESERVA}</li>
                <li><b>Descuento:</b> ${reserva.TIPO_DESCUENTO_NOMBRE || "Ninguno"}</li>
                <li><b>Cancha:</b> ${reserva.NRO_CANCHA}</li>
                <li><b>Deporte:</b> ${reserva.NOMBRE_DEPORTE}</li>
            </ul>
            <p>¡Gracias por confiar en nosotros!</p>
            <p>Atentamente, <br> <b>Complejo Energia Activa</b></p>
        `
        });

        console.log("Correo enviado con éxito: ", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error enviando el correo: ", error);
        return { success: false, error: error.message };
    }
};

module.exports = { enviarCorreoReserva };