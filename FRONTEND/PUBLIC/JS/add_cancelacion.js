document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-cancelacion-form');
    const submitButton = document.getElementById('submit-button');

    // Configuración de Toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        preventDuplicates: true,
        maxOpened: 1,
        newestOnTop: true,
        timeOut: 5000,
        extendedTimeOut: 5000,
        tapToDismiss: false,
        positionClass: "toast-bottom-right"
    };

    // Obtener ID de reserva desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const reservaId = urlParams.get("id"); // Captura el ID de la reserva

    if (reservaId) {
        document.getElementById('reserva').value = reservaId; // Asigna el valor de la reserva
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";        

        const cancelacionData = {
            reserva: parseInt(document.getElementById('reserva').value, 10),
            motivo_cancelacion: document.getElementById('motivo').value.trim(),
        };

        fetch('/cancelaciones/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cancelacionData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Cancelación agregada correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_cancelaciones.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar la cancelación.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar cancelación:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
