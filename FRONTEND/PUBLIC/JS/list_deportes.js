document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/deportes'; // URL base para los endpoints de areas
    const deportesList = document.getElementById('deportes-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let deporteToDelete = null;

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
    

    function loadDeportes() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.deportes) {
                    deportesList.innerHTML = data.deportes.map(deporte => `
                        <tr>
                            <td>${deporte.DEPORTE}</td>
                            <td>${deporte.NOMBRE}</td>
                            <td class="actions-cell">
                                <button class="action-btn edit" onclick="editDeporte(${deporte.DEPORTE})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="action-btn delete" onclick="showDeleteModal(${deporte.DEPORTE})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    toastr.success('Deportes cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar la lista de deportes.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar deportes:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    }

    window.editDeporte = function (id) {
        window.location.href = `../upd_deporte.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        deporteToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none'; 
        deporteToDelete = null;
    }

    // Función para eliminar el deporte
    function deleteDeporte() {
        if (deporteToDelete) {
            fetch(`${apiUrl}/delete/${deporteToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success(data.message || 'Deporte eliminada correctamente.', '¡Éxito!');
                        loadDeportes();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el deporte. Intenta nuevamente.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar deporte:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente más tarde.', 'Error');
                    hideDeleteModal();
                });
        }
    }      
    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteDeporte);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    loadDeportes(); // Carga los areas al iniciar
});
