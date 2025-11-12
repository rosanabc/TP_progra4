document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/tipos_descuentos';
    const tiposDescuentosList = document.getElementById('tipos_descuentos-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let tipoDescuentoToDelete = null;

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

    // Función para cargar tipos de descuento
    function loadTiposDescuentos() {
        fetch(apiUrl, { method: 'GET' }) // Método GET explícito
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tipos_descuentos) {
                    tiposDescuentosList.innerHTML = data.tipos_descuentos.map(tipoDescuento => {
                        // Reemplazar `null` con `"-"`
                        const fechaInicio = tipoDescuento.FECHA_INICIO ? tipoDescuento.FECHA_INICIO : "-";
                        const fechaFin = tipoDescuento.FECHA_FIN ? tipoDescuento.FECHA_FIN : "-";
    
                        return `
                        <tr>
                            <td>${tipoDescuento.TIPO_DESCUENTO}</td>
                            <td>${tipoDescuento.NOMBRE}</td>
                            <td style="text-align:center">${fechaInicio}</td>
                            <td style="text-align:center">${fechaFin}</td>
                            <td style="text-align:center">${tipoDescuento.PORCENTAJE_DESCUENTO}</td>
                            <td class="actions-cell">
                                <button class="action-btn edit" onclick="editTipoDescuento(${tipoDescuento.TIPO_DESCUENTO})" title="Actualizar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="action-btn delete" onclick="showDeleteModal(${tipoDescuento.TIPO_DESCUENTO})" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    }).join('');
    
                    toastr.success('Tipos de descuento cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar los tipos de descuento.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar tipos de descuento:', error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    }    

    // Función para redirigir a la página de edición
    window.editTipoDescuento = function (id) {
        window.location.href = `../upd_tipo-descuento.html?id=${id}`;
    };

    // Función para mostrar el modal
    window.showDeleteModal = function (id) {
        tipoDescuentoToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        tipoDescuentoToDelete = null;
    }

    // Función para eliminar el tipo de descuento
    function deleteTipoDescuento() {
        if (tipoDescuentoToDelete) {
            fetch(`${apiUrl}/delete/${tipoDescuentoToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Tipo de descuento eliminado correctamente.', '¡Éxito!');
                        loadTiposDescuentos();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el tipo de descuento.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar tipo de descuento:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteTipoDescuento);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // Cargar tipos de descuento al iniciar
    loadTiposDescuentos();
});
