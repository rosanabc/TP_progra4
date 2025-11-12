document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-cliente-form');
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

    // Manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const clienteData = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            correo: document.getElementById('email').value.trim(),
            numero_documento: document.getElementById('documento').value.trim(),
            edad: parseInt(document.getElementById('edad').value, 10),
            estado: document.getElementById('estado_cliente').value.trim(),
            barrio: document.getElementById('barrio').value.trim(),
            pais: document.getElementById('pais').value.trim(),
            ciudad: document.getElementById('ciudad').value.trim(),
        };

        // Enviar datos al servidor
        fetch('/clientes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Cliente agregado exitosamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_clientes.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el cliente.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar cliente:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
