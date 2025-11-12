document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/estados_canchas';
    const estadosCanchasList = document.getElementById('estados_canchas-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let estadoCanchaToDelete = null;

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

    function loadEstadosCanchas() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.estados_canchas) {
                    estadosCanchasList.innerHTML = data.estados_canchas.map(estadoCancha => `
                        <tr>
                            <td>${estadoCancha.ESTADO_CANCHA}</td>
                            <td>${estadoCancha.NOMBRE}</td>
                            <td class="actions-cell">
                                <button class="action-btn edit" onclick="editEstadoCancha(${estadoCancha.ESTADO_CANCHA})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="action-btn delete" onclick="showDeleteModal(${estadoCancha.ESTADO_CANCHA})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    toastr.success('Estados de canchas cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar la lista de estados de canchas.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar estados de canchas:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    }

    window.editEstadoCancha = function (id) {
        window.location.href = `../upd_estado-cancha.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        estadoCanchaToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        estadoCanchaToDelete = null;
    }

    // Función para eliminar el estado de cancha
    function deleteEstadoCancha() {
        if (estadoCanchaToDelete) {
            fetch(`${apiUrl}/delete/${estadoCanchaToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success(data.message || 'Estado de cancha eliminado correctamente.', '¡Éxito!');
                        loadEstadosCanchas();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el estado de cancha. Intenta nuevamente.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar estado de cancha:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente más tarde.', 'Error');
                    hideDeleteModal();
                });
        }
    }      
    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteEstadoCancha);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    loadEstadosCanchas();
});
