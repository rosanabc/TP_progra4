document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/cancelaciones';
    const cancelacionesList = document.getElementById('cancelaciones-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let cancelacionToDelete = null;

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

    // Función para cargar cancelaciones
    function loadCancelaciones() {
        fetch(apiUrl, { method: 'GET' }) // Método GET explícito
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cancelaciones) {
                    cancelacionesList.innerHTML = data.cancelaciones.map(cancelacion => {
                    const reembolsable = cancelacion.REEMBOLSABLE === 'S' ? 'Si' : 'No';
                    return `
                    <tr>
                        <td>${cancelacion.CANCELACION}</td>
                        <td style="text-align:center">${cancelacion.RESERVA}</td>
                        <td>${cancelacion.MOTIVO_CANCELACION}</td>
                        <td style="text-align:center">${reembolsable}</td>                        
                        <td class="actions-cell">
                            <button class="action-btn edit" onclick="editCancelacion(${cancelacion.CANCELACION})" title="Actualizar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="action-btn delete" onclick="showDeleteModal(${cancelacion.CANCELACION})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `}).join('');
                    toastr.success('Cancelaciones cargadas correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar las cancelaciones.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar cancelaciones:', error);
                toastr.error('Error al cargar las cancelaciones. Intenta nuevamente.', 'Error');
            });
    }

    // Función para redirigir a la página de edición
    window.editCancelacion = function (id) {
        window.location.href = `../upd_cancelacion.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        cancelacionToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        cancelacionToDelete = null;
    }

    // Función para eliminar la cancelacion
    function deleteCancelacion() {
        if (cancelacionToDelete) {
            fetch(`${apiUrl}/delete/${cancelacionToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Cancelacion eliminada correctamente.', '¡Éxito!');
                        loadCancelaciones();
                    } else {
                        toastr.error(data.error || 'Error al eliminar la cancelacion.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar cancelacion:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteCancelacion);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // Carga las cancelaciones al iniciar
    loadCancelaciones();
});
