document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-bloqueo-form');
    const urlParams = new URLSearchParams(window.location.search);
    const bloqueoId = urlParams.get('id');
    const submitButton = document.getElementById('submit-button');

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

    // Objeto para almacenar los valores originales
    let valoresOriginales = {};

    // Función para cargar clientes
    const loadClientes = (clienteActual, callback) => {
        fetch('/clientes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const clienteSelect = document.getElementById('bloqueo-cliente');
                    clienteSelect.innerHTML = '';
                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.CLIENTE;
                        option.textContent = cliente.NOMBRE + ' ' + cliente.APELLIDO;
                        clienteSelect.appendChild(option);
                    });

                    if (clienteActual) {
                        clienteSelect.value = clienteActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de clientes cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de clientes.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar clientes. Intenta nuevamente.', 'Error');
                console.error("Error al cargar clientes:", error);
            });
    };

    // Cargar datos del bloqueo actual
    if (bloqueoId) {
        fetch(`/bloqueos/bloqueo/${bloqueoId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.bloqueo) {
                    document.getElementById('bloqueo-id').value = bloqueoId;
                    loadClientes(data.bloqueo.CLIENTE, () => {});
                    document.getElementById('bloqueo-motivo').value = data.bloqueo.MOTIVO_BLOQUEO || '';
                    document.getElementById('bloqueo-fecha_inicio').value = data.bloqueo.FECHA_INICIO || '';
                    document.getElementById('bloqueo-fecha_fin').value = data.bloqueo.FECHA_FIN || '';

                    valoresOriginales = {
                        cliente: data.bloqueo.CLIENTE,
                        motivo_bloqueo: data.bloqueo.MOTIVO_BLOQUEO,
                        fecha_inicio: data.bloqueo.FECHA_INICIO,
                        fecha_fin: data.bloqueo.FECHA_FIN,
                    };

                    toastr.success('Datos del bloqueo cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Bloqueo no encontrado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos del bloqueo. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de bloqueo.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        const updatedBloqueoData = {
            cliente: document.getElementById('bloqueo-cliente').value || null,
            motivo_bloqueo: document.getElementById('bloqueo-motivo').value || null,
            fecha_inicio: document.getElementById('bloqueo-fecha_inicio').value || null,
            fecha_fin: document.getElementById('bloqueo-fecha_fin').value || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedBloqueoData).some(
            key => String(updatedBloqueoData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos. Actualización cancelada.', 'Advertencia');
            return;
        }

        fetch(`/bloqueos/update/${bloqueoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBloqueoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Bloqueo actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_bloqueos.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el bloqueo.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar bloqueo:', error);
            });
    });
});
