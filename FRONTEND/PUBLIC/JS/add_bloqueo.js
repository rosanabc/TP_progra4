document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-bloqueo-form');
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

    const loadClientes = () => {
        fetch('/clientes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const clienteSelect = document.getElementById('cliente');
                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.CLIENTE;
                        option.textContent = cliente.NOMBRE + ' ' + cliente.APELLIDO;
                        clienteSelect.appendChild(option);
                    });
                    //toastr.success('Lista de clientes cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de clientes.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar clientes:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    loadClientes();

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";

        const bloqueoData = {
            cliente: parseInt(document.getElementById('cliente').value, 10), 
            motivo_bloqueo: document.getElementById('motivo').value.trim(),
            fecha_inicio: document.getElementById('fecha_inicio').value,
            fecha_fin: document.getElementById('fecha_fin').value,
        };

        fetch('/bloqueos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bloqueoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Bloqueo agregado exitosamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_bloqueos.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el bloqueo.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar bloqueo:', error.message);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});