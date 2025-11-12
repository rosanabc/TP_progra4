document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-estado_cancha-form');
    const estadoCanchaIdInput = document.getElementById('estado_cancha-id');
    const estadoCanchaNameInput = document.getElementById('estado_cancha-nombre');
    const urlParams = new URLSearchParams(window.location.search);
    const estadoCanchaId = urlParams.get('id');
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

    // Verifica si hay un ID de estado de cancha en los parámetros
    if (estadoCanchaId) {
        estadoCanchaIdInput.value = estadoCanchaId;

        // Obtiene los datos del estado de cancha
        fetch(`/estados_canchas/estado_cancha/${estadoCanchaId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.estado_cancha) {
                    estadoCanchaNameInput.value = data.estado_cancha.NOMBRE;
                    toastr.success('Datos del estado de cancha cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('No se encontró el estado de cancha solicitado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener los datos del estado de cancha. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de estado de cancha.', 'Advertencia');
    }

    // Maneja el envío del formulario para actualizar el estado de cancha
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";        
        const newName = estadoCanchaNameInput.value.trim();

        if (!newName) {
            toastr.warning('El nombre del estado de cancha no puede estar vacío.', 'Advertencia');
            return;
        }

        fetch(`/estados_canchas/update/${estadoCanchaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Estado de cancha actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_estados-canchas.html'; 
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el estado de cancha.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    });
});