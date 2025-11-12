document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/canchas_horarios';
    const canchasHorariosList = document.getElementById('horarios_canchas-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let canchaHorarioToDelete = null;

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

    // Función para cargar horarios por cancha
    function loadCanchasHorarios() {
        fetch(apiUrl, { method: 'GET' }) // Método GET explícito
            .then(response => response.json())
            .then(data => {
                if (data.success && data.canchas_horarios) {
                    canchasHorariosList.innerHTML = data.canchas_horarios.map(canchaHorario => `
                    <tr>
                        <td>${canchaHorario.CANCHA_HORARIO}</td>
                        <td style="text-align:center">${canchaHorario.CANCHADEPORTE}</td>
                        <td style="text-align:center">${canchaHorario.HORA_INICIO_DISPO}</td>
                        <td style="text-align:center">${canchaHorario.HORA_FIN_DISPO}</td>
                        <td style="text-align:center">${canchaHorario.PRECIO_COSTO}</td>
                        <td class="actions-cell">
                            <button class="action-btn edit" onclick="editCanchaHorario(${canchaHorario.CANCHA_HORARIO})" title="Actualizar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="action-btn delete" onclick="showDeleteModal(${canchaHorario.CANCHA_HORARIO})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                    toastr.success('Horarios por cancha cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar los horarios por cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar horarios por cancha:', error);
                toastr.error('Error al cargar los horarios por cancha. Intenta nuevamente.', 'Error');
            });
    }

    // Función para redirigir a la página de edición
    window.editCanchaHorario = function (id) {
        window.location.href = `../upd_horario-cancha.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        canchaHorarioToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        canchaHorarioToDelete = null;
    }

    // Función para eliminar el horario por cancha
    function deleteCanchaHorario() {
        if (canchaHorarioToDelete) {
            fetch(`${apiUrl}/delete/${canchaHorarioToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Horario por cancha eliminado correctamente.', '¡Éxito!');
                        loadCanchasHorarios();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el horario por cancha.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar horario por cancha:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteCanchaHorario);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // Carga los deportes por cancha al iniciar
    loadCanchasHorarios();
});
