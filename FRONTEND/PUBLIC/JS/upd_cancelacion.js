document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-cancelacion-form');
    const urlParams = new URLSearchParams(window.location.search);
    const cancelacionId = urlParams.get('id');
    const submitButton = document.getElementById('submit-button');

    // Configuración global de Toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        maxOpened: 1,
        preventDuplicates: true,
        newestOnTop: true,
        timeOut: 5000,
        extendedTimeOut: 5000,
        tapToDismiss: false,
        positionClass: "toast-bottom-right"
    };

    // Objeto para almacenar los valores originales
    let valoresOriginales = {};

    // Función para cargar reservas 
const loadReservas = (reservaActual) => {
    fetch('/reservas/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const reservaSelect = document.getElementById('cancelacion-reserva');
                reservaSelect.innerHTML = ''; 

                let reservaExiste = false;

                data.reservas.forEach(reserva => {
                    const option = document.createElement('option');
                    option.value = reserva.RESERVA;
                    option.textContent = reserva.RESERVA;
                    reservaSelect.appendChild(option);

                    if (reserva.RESERVA == reservaActual) {
                        reservaExiste = true;
                    }
                });

                if (reservaActual && reservaExiste) {
                    reservaSelect.value = reservaActual;
                } else {
                    console.warn("El ID de reserva no está en la lista de reservas.");
                }

            } else {
                toastr.error(data.error || 'Error al cargar la lista de reservas.', 'Error');
            }
        })
        .catch(error => {
            toastr.error('Error al cargar reservas. Intenta nuevamente.', 'Error');
            console.error("Error al cargar reservas:", error);
        });
};


    // Cargar datos de la cancelacion actual
    if (cancelacionId) {
        fetch(`/cancelaciones/cancelacion/${cancelacionId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cancelacion) {
                    document.getElementById('cancelacion-id').value = cancelacionId;
                    loadReservas(data.cancelacion.RESERVA, () => {});
                    document.getElementById('cancelacion-motivo').value = data.cancelacion.MOTIVO_CANCELACION;
                    document.getElementById('cancelacion-reembolsable').value = data.cancelacion.REEMBOLSABLE;

                    valoresOriginales = {
                        reserva: data.cancelacion.RESERVA,
                        motivo_cancelacion: data.cancelacion.MOTIVO_CANCELACION,
                        reembolsable: data.cancelacion.REEMBOLSABLE,
                    };
                    toastr.success('Datos de la cancelacion cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Cancelacion no encontrada.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos de la cancelacion. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de cancelacion.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedCancelacionData = {
            reserva: parseInt(document.getElementById('cancelacion-reserva').value, 10) || null,
            motivo_cancelacion: document.getElementById('cancelacion-motivo').value.trim() || null,
            reembolsable: document.getElementById('cancelacion-reembolsable').value.trim() || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedCancelacionData).some(
            key => String(updatedCancelacionData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/cancelaciones/update/${cancelacionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCancelacionData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Cancelacion actualizada correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_cancelaciones.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar la cancelacion.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar cancelacion:', error);
            });
    });
});
