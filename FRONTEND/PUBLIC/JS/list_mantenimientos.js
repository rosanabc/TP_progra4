document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/mantenimientos';
    const mantenimientosList = document.getElementById('mantenimientos-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let mantenimientoToDelete = null;

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

    // Función para cargar mantenimientos
    function loadMantenimientos() {
        fetch(apiUrl, { method: 'GET' }) // Método GET explícito
            .then(response => response.json())
            .then(data => {
                if (data.success && data.mantenimientos) {
                    mantenimientosList.innerHTML = data.mantenimientos.map(mantenimiento =>`
                    <tr>
                        <td>${mantenimiento.MANTENIMIENTO}</td>
                        <td style="text-align:center">${mantenimiento.NUMERO_CANCHA}</td>
                        <td>${mantenimiento.MOTIVO_MANTENIMIENTO}</td>
                        <td style="text-align:center">${mantenimiento.FECHA_INICIO} - ${mantenimiento.HORA_INICIO}</td>
                        <td style="text-align:center">${mantenimiento.FECHA_FIN} - ${mantenimiento.HORA_FIN}</td>                        
                        <td class="actions-cell">
                            <button class="action-btn edit" onclick="editMantenimiento(${mantenimiento.MANTENIMIENTO})" title="Actualizar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="action-btn delete" onclick="showDeleteModal(${mantenimiento.MANTENIMIENTO})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                    toastr.success('Mantenimientos cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar los mantenimientos.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar mantenimientos:', error);
                toastr.error('Error al cargar los mantenimientos. Intenta nuevamente.', 'Error');
            });
    }

    // Función para redirigir a la página de edición
    window.editMantenimiento = function (id) {
        window.location.href = `../upd_mantenimiento.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        mantenimientoToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        mantenimientoToDelete = null;
    }

    // Función para eliminar el mantenimiento
    function deleteMantenimiento() {
        if (mantenimientoToDelete) {
            fetch(`${apiUrl}/delete/${mantenimientoToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Mantenimiento eliminado correctamente.', '¡Éxito!');
                        loadMantenimientos();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el mantenimiento.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar mantenimiento:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteMantenimiento);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // Carga los mantenimientos al iniciar
    loadMantenimientos();
});
