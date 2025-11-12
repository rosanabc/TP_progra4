document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/tipos_pagos';
    const tiposPagosList = document.getElementById('tipos_pagos-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let tipoPagoToDelete = null;

    // Configuración global de Toastr
    toastr.options = {
        closeButton: true, 
        progressBar: true, 
        preventDuplicates: true, 
        newestOnTop: true, 
        timeOut: 5000, 
        extendedTimeOut: 5000, 
        tapToDismiss: false, 
        positionClass: "toast-bottom-right" 
    };
    

    function loadTiposPagos() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tipos_pagos) {
                    tiposPagosList.innerHTML = data.tipos_pagos.map(tipoPago => `
                        <tr>
                            <td>${tipoPago.TIPO_PAGO}</td>
                            <td>${tipoPago.NOMBRE}</td>
                            <td class="actions-cell">
                                <button class="action-btn edit" onclick="editTipoPago(${tipoPago.TIPO_PAGO})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="action-btn delete" onclick="showDeleteModal(${tipoPago.TIPO_PAGO})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    toastr.success('Tipos de pago cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar la lista de tipos de pago.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar tipos de pago:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    }

    window.editTipoPago = function (id) {
        window.location.href = `../upd_tipo-pago.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        tipoPagoToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none'; 
        tipoPagoToDelete = null;
    }

    // Función para eliminar el tipo de pago
    function deleteTipoPago() {
        if (tipoPagoToDelete) {
            fetch(`${apiUrl}/delete/${tipoPagoToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success(data.message || 'Tipo de pago eliminado correctamente.', '¡Éxito!');
                        loadTiposPagos();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el tipo de pago. Intenta nuevamente.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar tipo de pago:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente más tarde.', 'Error');
                    hideDeleteModal();
                });
        }
    }      
    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteTipoPago);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    loadTiposPagos();
});
