document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/clientes';
    const clientesList = document.getElementById('clientes-list');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let clienteToDelete = null;

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

    // Función para cargar clientes
    function loadClientes() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.clientes) {
                    clientesList.innerHTML = data.clientes.map(cliente =>{
                        let estadocliente;
                        switch (reserva.ESTADO_RESERVA) {
                            case 'H': 
                            estadocliente = 'Habilitado'; 
                                break;
                            case 'B': 
                            estadocliente = 'Bloqueado'; 
                                break;
                        }
                    return `
                    <tr>
                        <td>${cliente.CLIENTE}</td>
                        <td>${cliente.NOMBRE} ${cliente.APELLIDO}</td>
                        <td>${cliente.DIRECCION}</td>
                        <td>${cliente.TELEFONO}</td>
                        <td>${cliente.CORREO}</td>
                        <td style="text-align:center">${estadoCliente}</td>
                        <td class="actions-cell">
                            <button class="action-btn edit" onclick="editCliente(${cliente.CLIENTE})" title="Actualizar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="action-btn delete" onclick="showDeleteModal(${cliente.CLIENTE})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `}).join('');
                    toastr.success('Clientes cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('Error al cargar los clientes.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al cargar clientes:', error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    }

    // Función para redirigir a la página de edición
    window.editCliente = function (id) {
        window.location.href = `../upd_cliente.html?id=${id}`;
    };

    // Función para mostrar el modal de confirmación
    window.showDeleteModal = function (id) {
        clienteToDelete = id;
        confirmModal.style.display = 'flex';
    };

    // Función para ocultar el modal de confirmación
    function hideDeleteModal() {
        confirmModal.style.display = 'none';
        clienteToDelete = null;
    }

    // Función para eliminar el cliente
    function deleteCliente() {
        if (clienteToDelete) {
            fetch(`${apiUrl}/delete/${clienteToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        toastr.success('Cliente eliminado correctamente.', '¡Éxito!');
                        loadClientes();
                    } else {
                        toastr.error(data.error || 'Error al eliminar el cliente.', 'Error');
                    }
                    hideDeleteModal();
                })
                .catch(error => {
                    console.error('Error al eliminar cliente:', error);
                    toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                    hideDeleteModal();
                });
        }
    }

    // Event listeners para los botones del modal
    confirmDeleteBtn.addEventListener('click', deleteCliente);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // Cargar productos al iniciar
    loadClientes();
});
