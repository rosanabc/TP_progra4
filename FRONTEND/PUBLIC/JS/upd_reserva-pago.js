document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-reserva_pago-form');
    const urlParams = new URLSearchParams(window.location.search);
    const reservaPagoId = urlParams.get('id');
    const selectReserva = document.getElementById('pago-reserva');
    const submitButton = document.getElementById('submit-button');

    // Evitar cambios manuales en el select de la reserva
    selectReserva.addEventListener('mousedown', function (event) {
        event.preventDefault(); // Bloquea la apertura del select
    });

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
    // Función para cargar tipos de pago 
    const loadTiposPagos = (tipoPagoActual, callback) => {
        fetch('/tipos_pagos/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tipoPagoSelect = document.getElementById('pago-tipo_pago');
                    tipoPagoSelect.innerHTML = ''; 
                    data.tipos_pagos.forEach(tipoPago => {
                        const option = document.createElement('option');
                        option.value = tipoPago.TIPO_PAGO;
                        option.textContent = tipoPago.NOMBRE;
                        tipoPagoSelect.appendChild(option);
                    });

                    if (tipoPagoActual) {
                        tipoPagoSelect.value = tipoPagoActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de tipos de pago cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de tipos de pago.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar tipos de pago. Intenta nuevamente.', 'Error');
                console.error("Error al cargar tipos de pago:", error);
            });
    };

    // Cargar datos del pago de reserva actual
    if (reservaPagoId) {
        fetch(`/reservas_pagos/reserva_pago/${reservaPagoId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.reserva_pago) {
                    document.getElementById('pago-id').value = reservaPagoId;
                    document.getElementById('pago-monto_total').value = data.reserva_pago.MONTO_TOTAL;

                    // Establecer solo la reserva asociada sin permitir cambios
                    selectReserva.innerHTML = `<option value="${data.reserva_pago.RESERVA}" selected>${data.reserva_pago.RESERVA}</option>`;

                    loadTiposPagos(data.reserva_pago.TIPO_PAGO, () => {});

                    valoresOriginales = {
                        monto_total: data.reserva_pago.MONTO_TOTAL,
                        reserva: data.reserva_pago.RESERVA,
                        tipo_pago: data.reserva_pago.TIPO_PAGO,
                    };

                    toastr.success('Datos del pago de reserva cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Pago de reserva no encontrado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos del pago de reserva. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de pago de reserva.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedReservaPagoData = {
            monto_total: parseFloat(document.getElementById('pago-monto_total').value) || null,
            reserva: parseInt(document.getElementById('pago-reserva').value, 10) || null,
            tipo_pago: parseInt(document.getElementById('pago-tipo_pago').value, 10) || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedReservaPagoData).some(
            key => String(updatedReservaPagoData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/reservas_pagos/update/${reservaPagoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReservaPagoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Pago de reserva actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_reservas.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el pago de reserva.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar pago de reserva:', error);
            });
    });
});
