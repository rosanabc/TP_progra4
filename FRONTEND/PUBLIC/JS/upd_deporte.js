document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-deporte-form');
    const deporteIdInput = document.getElementById('deporte-id');
    const deporteNameInput = document.getElementById('deporte-nombre');
    const urlParams = new URLSearchParams(window.location.search);
    const deporteId = urlParams.get('id');
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

    // Verifica si hay un ID de deporte en los parámetros
    if (deporteId) {
        deporteIdInput.value = deporteId;

        // Obtiene los datos del deporte
        fetch(`/deportes/deporte/${deporteId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.deporte) {
                    deporteNameInput.value = data.deporte.NOMBRE;
                    toastr.success('Datos del deporte cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('No se encontró el deporte solicitado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener los datos del deporte. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de deporte.', 'Advertencia');
    }

    // Maneja el envío del formulario para actualizar el deporte
    form.addEventListener('submit', function (event) {
        event.preventDefault();
         // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";       
        const newName = deporteNameInput.value.trim();

        if (!newName) {
            toastr.warning('El nombre del deporte no puede estar vacío.', 'Advertencia');
            return;
        }

        fetch(`/deportes/update/${deporteId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Deporte actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_deportes.html'; 
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el deporte.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    });
});
