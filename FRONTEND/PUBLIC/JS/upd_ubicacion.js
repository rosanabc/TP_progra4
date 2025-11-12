document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-ubicacion-form');
    const ubicacionIdInput = document.getElementById('ubi-id');
    const ubicacionNameInput = document.getElementById('ubi-nombre');
    const urlParams = new URLSearchParams(window.location.search);
    const ubicacionId = urlParams.get('id');
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

    // Verifica si hay un ID de ubicacion en los parámetros
    if (ubicacionId) {
        ubicacionIdInput.value = ubicacionId;

        // Obtiene los datos de la ubicacion
        fetch(`/ubicaciones/ubicacion/${ubicacionId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.ubicacion) {
                    ubicacionNameInput.value = data.ubicacion.NOMBRE;
                    toastr.success('Datos de la ubicacion cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('No se encontró la ubicacion solicitada.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener los datos de la ubicacion. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de ubicacion.', 'Advertencia');
    }

    // Maneja el envío del formulario para actualizar la ubicacion
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";        
        const newName = ubicacionNameInput.value.trim();

        if (!newName) {
            toastr.warning('El nombre de la ubicacion no puede estar vacío.', 'Advertencia');
            return;
        }

        fetch(`/ubicaciones/update/${ubicacionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Ubicacion actualizada correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_ubicaciones.html'; 
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar la ubicacion.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    });
});
