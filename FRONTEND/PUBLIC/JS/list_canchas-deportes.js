document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/canchas_deportes';
    const canchasDeportesList = document.getElementById('canchas_deportes-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let canchaDeporteToDelete = null;

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

    // Función para cargar deportes por canchas
    function loadCanchasDeportes() {
        fetch(apiUrl, { method: 'GET' }) // Método GET explícito
            .then(response => response.json())
            .then(data => {
                if (data.success && data.canchas_deportes) {
                    canchasDeportesList.innerHTML = data.canchas_deportes.map(canchaDeporte => `
                    <tr>
                        <td>${canchaDeporte.CANCHA_DEPORTE}</td>
                        <td>${canchaDeporte.DEPORTE_NOMBRE}</td>
                        <td style="text-align:center">${canchaDeporte.CANCHA}</td>
                        <td style="text-align:center">${canchaDeporte.COSTO_MANTENIMIENTO}</td>
                        <td class="actions-cell">
                            <button class="action-btn edit" onclick="editCanchaDeporte(${canchaDeporte.CANCHA_DEPORTE})" title="Actualizar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="action-btn delete" onclick="showDeleteModal(${canchaDeporte.CANCHA_DEPORTE})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                    toastr.success('Deportes por cancha cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar los deportes por cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar deportes por cancha:', error);
                toastr.error('Error al cargar los deportes por cancha. Intenta nuevamente.', 'Error');
            });
    }

    // Función para redirigir a la página de edición
    window.editCanchaDeporte = function (id) {
        window.location.href = `../upd_cancha-deporte.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        canchaDeporteToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        canchaDeporteToDelete = null;
    }

    // Función para eliminar el deporte por cancha
    function deleteCanchaDeporte() {
        if (canchaDeporteToDelete) {
            fetch(`${apiUrl}/delete/${canchaDeporteToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Deporte por cancha eliminado correctamente.', '¡Éxito!');
                        loadCanchasDeportes();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el deporte por cancha.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar deporte por cancha:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteCanchaDeporte);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // Carga los deportes por cancha al iniciar
    loadCanchasDeportes();
});
