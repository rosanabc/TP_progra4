document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/reservas_pagos';
    const reservasPagosList = document.getElementById('reservas_pagos-list');
    const confirmModal = document.getElementById('confirm-modal');
    let reservaPagoToDelete = null;

    // Configuración global de Toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        preventDuplicates: true,
        newestOnTop: true,
        maxOpened: 1,
        timeOut: 5000,
        extendedTimeOut: 5000,
        tapToDismiss: false,
        positionClass: "toast-bottom-right"
    };

    // Función para cargar pagos de reserva
    function loadReservasPagos() {
        fetch(apiUrl, { method: 'GET' }) // Método GET explícito
            .then(response => response.json())
            .then(data => {
                if (data.success && data.reservas_pagos) {
                    reservasPagosList.innerHTML = data.reservas_pagos.map(reservaPago => `
                    <tr>
                        <td>${reservaPago.RESERVA_PAGO}</td>
                        <td style="text-align:center">${reservaPago.MONTO_TOTAL}</td>
                        <td style="text-align:center">${reservaPago.RESERVA}</td>
                        <td style="text-align:center">${reservaPago.FECHA_PAGO}</td>
                        <td>${reservaPago.TIPO_PAGO_NOMBRE}</td>                        
                        <td class="actions-cell">
                            <button class="action-btn edit" onclick="editReservaPago(${reservaPago.RESERVA_PAGO})" title="Actualizar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                    toastr.success('Pagos de reserva cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar los pagos de reserva.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar pagos de reserva:', error);
                toastr.error('Error al cargar los pagos de reserva. Intenta nuevamente.', 'Error');
            });
    }

    // Función para redirigir a la página de edición
    window.editReservaPago = function (id) {
        window.location.href = `../upd_reserva-pago.html?id=${id}`;
    };

    // Carga los pagos de reserva al iniciar
    loadReservasPagos();
});
