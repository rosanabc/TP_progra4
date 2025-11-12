document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/reservas';
    const reservasList = document.getElementById('reservas-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let reservaToDelete = null;

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

    // Función para cargar reservas
    function loadReservas() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.reservas) {
                    reservasList.innerHTML = data.reservas.map(reserva => {
                        let estadoTexto;
                        switch (reserva.ESTADO_RESERVA) {
                            case 'E': 
                                estadoTexto = 'En Espera'; 
                                break;
                            case 'P': 
                                estadoTexto = 'Pagado'; 
                                break;
                            case 'C': 
                                estadoTexto = 'Cancelado'; 
                                break;
                            default: 
                                estadoTexto = 'Desconocido'; 
                                break;
                        }
    
                        // Definir funciones con validaciones
                        const payAction = reserva.ESTADO_RESERVA === 'P' 
                            ? `toastr.warning('Esta reserva ya ha sido pagada.', 'Acción no permitida');`
                            : `payReserva(${reserva.RESERVA})`;
    
                        const cancelAction = reserva.ESTADO_RESERVA === 'C' 
                            ? `toastr.warning('Esta reserva ya ha sido cancelada.', 'Acción no permitida');`
                            : `cancelReserva(${reserva.RESERVA})`;
    
                        return `
                        <tr>
                            <td>${reserva.RESERVA}</td>
                            <td>${reserva.NOMBRE_CLIENTE}</td>
                            <td style="text-align:center">${reserva.FECHA_RESERVA}</td>
                            <td style="text-align:center">${reserva.CANCHADEPORTE}</td>
                            <td style="text-align:center">${reserva.HORARIO_RESERVADO}</td>
                            <td style="text-align:center">${estadoTexto}</td>                        
                            <td>${reserva.TIPO_DESCUENTO_NOMBRE}</td>
                            <td style="text-align:center">${reserva.PRECIO_TOTAL}</td>                        
                            <td class="actions-cell">
                                <button class="action-btn pay" onclick="${payAction}" title="Pagar">
                                    <i class="bi bi-cash"></i>
                                </button>                                                        
    
                                <button class="action-btn cancel" onclick="${cancelAction}" title="Cancelar">
                                    <i class="bi bi-x-circle"></i>
                                </button>
    
                                <button class="action-btn edit" onclick="editReserva(${reserva.RESERVA})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
    
                                <button class="action-btn delete" onclick="showDeleteModal(${reserva.RESERVA})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                        `;
                    }).join('');
    
                    toastr.success('Reservas cargadas correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar las reservas.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar reservas:', error);
                toastr.error('Error al cargar los reservas. Intenta nuevamente.', 'Error');
            });
    }
    

    // Función para redirigir a la página de edición
    window.editReserva = function (id) {
        window.location.href = `../upd_reserva.html?id=${id}`;
    };

    // Función para redirigir a la página de pago de reserva con el ID de la reserva
    window.payReserva = function (id) {
        fetch(`/reservas_pagos/reserva_pago_por_reserva/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.reserva_pago) {
                    const reservaPagoId = data.reserva_pago.RESERVA_PAGO;
                    window.location.href = `../upd_reserva-pago.html?id=${reservaPagoId}`;
                } else {
                    toastr.error('No se encontró un pago de reserva asociado.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al obtener el pago de reserva:', error);
                toastr.error('Error al obtener el pago de reserva. Intenta nuevamente.', 'Error');
            });
    };    

    // Función para redirigir a la página de cancelación de reserva con el ID de la reserva
    window.cancelReserva = function (id) {
        window.location.href = `../add_cancelacion.html?id=${id}`;
    };

    // Función para mostrar el modal de confirmación de borrado
    window.showDeleteModal = function (id) {
        reservaToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal de confirmación
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        reservaToDelete = null;
    }

    // Función para eliminar la reserva
    function deleteReserva() {
        if (reservaToDelete) {
            fetch(`${apiUrl}/delete/${reservaToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Reserva eliminada correctamente.', '¡Éxito!');
                        loadReservas();
                    } else {
                        toastr.error(data.error || 'Error al eliminar la reserva.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar reserva:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteReserva);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // Carga las reservas al iniciar
    loadReservas();
});
