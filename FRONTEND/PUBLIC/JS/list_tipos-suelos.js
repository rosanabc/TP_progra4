document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/tipos_suelos';
    const tiposSuelosList = document.getElementById('tipos_suelos-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let tipoSueloToDelete = null;

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
    

    function loadTiposSuelos() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tipos_suelos) {
                    tiposSuelosList.innerHTML = data.tipos_suelos.map(tipoSuelo => `
                        <tr>
                            <td>${tipoSuelo.TIPO_SUELO}</td>
                            <td>${tipoSuelo.NOMBRE}</td>
                            <td class="actions-cell">
                                <button class="action-btn edit" onclick="editTipoSuelo(${tipoSuelo.TIPO_SUELO})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="action-btn delete" onclick="showDeleteModal(${tipoSuelo.TIPO_SUELO})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    toastr.success('Tipos de suelos cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar la lista de tipos de suelos.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar tipos de suelos:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    }

    window.editTipoSuelo = function (id) {
        window.location.href = `../upd_tipo-suelo.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        tipoSueloToDelete = id;
        confirmModal.style.display = 'flex'; 
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        tipoSueloToDelete = null; 
    }

    // Función para eliminar el tipo de suelo
    function deleteTipoSuelo() {
        if (tipoSueloToDelete) {
            fetch(`${apiUrl}/delete/${tipoSueloToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success(data.message || 'Tipo de suelo eliminado correctamente.', '¡Éxito!');
                        loadTiposSuelos();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el tipo de suelo. Intenta nuevamente.', 'Error');
                    }
                    hideDeleteModal(); 
                })
                .catch(error => {
                    console.error('Error al eliminar tipo de suelo:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente más tarde.', 'Error');
                    hideDeleteModal();
                });
        }
    }      
    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteTipoSuelo);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    loadTiposSuelos();
});
