document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/ubicaciones';
    const ubicacionesList = document.getElementById('ubicaciones-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let ubicacionToDelete = null;

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
    

    function loadUbicaciones() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.ubicaciones) {
                    ubicacionesList.innerHTML = data.ubicaciones.map(ubicacion => `
                        <tr>
                            <td>${ubicacion.UBICACION}</td>
                            <td>${ubicacion.NOMBRE}</td>
                            <td class="actions-cell">
                                <button class="action-btn edit" onclick="editUbicacion(${ubicacion.UBICACION})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="action-btn delete" onclick="showDeleteModal(${ubicacion.UBICACION})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    toastr.success('Ubicaciones cargadas correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar la lista de ubicaciones.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar ubicaciones:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    }

    window.editUbicacion = function (id) {
        window.location.href = `../upd_ubicacion.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        ubicacionToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        ubicacionToDelete = null;
    }

    // Función para eliminar la ubicacion
    function deleteUbicacion() {
        if (ubicacionToDelete) {
            fetch(`${apiUrl}/delete/${ubicacionToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success(data.message || 'Ubicacion eliminada correctamente.', '¡Éxito!');
                        loadUbicaciones();
                    } else {
                        toastr.error(data.error || 'Error al eliminar la ubicacion. Intenta nuevamente.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar ubicacion:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente más tarde.', 'Error');
                    hideDeleteModal();
                });
        }
    }      
    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteUbicacion);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    loadUbicaciones();
});
