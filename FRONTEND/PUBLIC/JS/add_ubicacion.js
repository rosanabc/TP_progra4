document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-ubicacion-form');
    const submitButton = document.getElementById('submit-button');

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

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";        
        const nombre = document.getElementById('nombre').value.trim();

        if (!nombre) {
            toastr.warning('El nombre de la ubicacion no puede estar vacío.', 'Advertencia');
            return;
        }

        fetch('/ubicaciones/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                toastr.success('Ubicacion agregada correctamente.', '¡Éxito!');
                setTimeout(() => {
                    window.location.href = '/list_ubicaciones.html';
                }, 1250);
            } else {
                // Mostrar mensaje de error del backend en Toastr
                toastr.error(data.error || 'Error al agregar la ubicacion.', 'Error');
            }
        })
        .catch(error => {
            toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            console.error('Error al agregar ubicacion:', error.message);
        });
    });
});
