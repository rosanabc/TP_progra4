document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-reserva_pago-form');
    const submitButton = document.getElementById('submit-button');

    // Configuración global de Toastr
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

    const loadReservas = () => {
        fetch('/reservas/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const reservaSelect = document.getElementById('reserva');
                    reservaSelect.innerHTML = "";
                    
                    data.reservas.forEach(reserva => {
                        const option = document.createElement('option');
                        option.value = reserva.RESERVA;
                        option.textContent = reserva.RESERVA;
                        reservaSelect.appendChild(option);
                    });

                    if (reservaId) {
                        reservaSelect.value = reservaId;
                    }
                    //toastr.success('Lista de reservas cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de reservas.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar reservas:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    const loadTiposPagos = () => {
        fetch('/tipos_pagos/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tipoPagoSelect = document.getElementById('tipo_pago');
                    tipoPagoSelect.innerHTML = ""; // Limpiar select antes de cargar opciones

                    data.tipos_pagos.forEach(tipoPago => {
                        const option = document.createElement('option');
                        option.value = tipoPago.TIPO_PAGO;
                        option.textContent = tipoPago.NOMBRE;
                        tipoPagoSelect.appendChild(option);
                    });
                    //toastr.success('Lista de tipos de pago cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de tipos de pago.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar tipos de pago:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    loadReservas();
    loadTiposPagos();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        const reservaPagoData = {
            monto_total: parseFloat(document.getElementById('monto_total').value),
            reserva: parseInt(document.getElementById('reserva').value, 10),
            tipo_pago: parseInt(document.getElementById('tipo_pago').value, 10),
        };

        fetch('/reservas_pagos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservaPagoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Pago de reserva agregado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_reservas-pagos.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el pago de reserva.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar pago de reserva:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
