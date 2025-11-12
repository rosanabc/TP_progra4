document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/bloqueos';
    const bloqueosList = document.getElementById('bloqueos-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let bloqueoToDelete = null;

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

    function loadBloqueos() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.bloqueos) {
                    bloqueosList.innerHTML = data.bloqueos.map(bloqueo => `
                        <tr>
                            <td>${bloqueo.BLOQUEO}</td>
                            <td>${bloqueo.CLIENTE_NOMBRE}</td>
                            <td>${bloqueo.MOTIVO_BLOQUEO}</td>
                            <td style="text-align:center">${bloqueo.FECHA_INICIO}</td>
                            <td style="text-align:center">${bloqueo.FECHA_FIN}</td>
                            <td class="actions-cell">
                                <button class="action-btn edit" onclick="editBloqueo(${bloqueo.BLOQUEO})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="action-btn delete" onclick="showDeleteModal(${bloqueo.BLOQUEO})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    toastr.success('Bloqueos cargadas correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar las bloqueos.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar bloqueos:', error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    }

    window.editBloqueo = function (id) {
        window.location.href = `../upd_bloqueo.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        bloqueoToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none'; 
        bloqueoToDelete = null;
    }

    // Función para eliminar el bloqueo
    function deleteBloqueo() {
        if (bloqueoToDelete) {
            fetch(`${apiUrl}/delete/${bloqueoToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Bloqueo eliminado correctamente.', '¡Éxito!');
                        loadBloqueos();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el bloqueo.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar bloqueo:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteBloqueo);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    loadBloqueos(); 
});
