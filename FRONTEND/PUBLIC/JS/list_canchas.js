document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/canchas';
    const canchasList = document.getElementById('canchas-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let canchasToDelete = null;

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

    function loadCanchas() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.canchas) {
                    canchasList.innerHTML = data.canchas.map(cancha =>{
                    const tipCancha = cancha.TIPO_CANCHA === 'M' ? 'Multiuso' : 'Unico uso';
                    const lumin = cancha.LUMINICA === 'S' ? 'Si' : 'No';
                    const bebed = cancha.BEBEDERO === 'S' ? 'Si' : 'No';
                    const banh = cancha.BANHOS === 'S' ? 'Si' : 'No';
                    const cambia = cancha.CAMBIADOR === 'S' ? 'Si' : 'No';
                    return `
                    <tr>
                        <td>${cancha.CANCHA}</td>
                        <td>${cancha.UBICACION_NOMBRE}</td>
                        <td>${cancha.ESTADO_CANCHA_NOMBRE}</td>                        
                        <td>${cancha.TIPO_SUELO_NOMBRE}</td>
                        <td style="text-align:center">${tipCancha}</td>
                        <td style="text-align:center">${lumin}</td>
                        <td style="text-align:center">${bebed}</td>
                        <td style="text-align:center">${banh}</td>
                        <td style="text-align:center">${cambia}</td>
                        <td class="actions-cell">
                            <button class="action-btn edit" onclick="editCancha(${cancha.CANCHA})" title="Actualizar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="action-btn delete" onclick="showDeleteModal(${cancha.CANCHA})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `}).join('');
                    toastr.success('Canchas cargadas correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar las canchas.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar canchas:', error);
                toastr.error('Error al cargar las canchas. Intenta nuevamente.', 'Error');
            });
    }

    window.editCancha = function (id) {
        window.location.href = `../upd_cancha.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        canchaToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        canchaToDelete = null;
    }

    // Función para eliminar la cancha
    function deleteCancha() {
        if (canchaToDelete) {
            fetch(`${apiUrl}/delete/${canchaToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Cancha eliminada correctamente.', '¡Éxito!');
                        loadCanchas();
                    } else {
                        toastr.error(data.error || 'Error al eliminar la cancha.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar cancha:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteCancha);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    loadCanchas();
});
