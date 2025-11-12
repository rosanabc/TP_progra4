document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-tipo_suelo-form');
    const tipoSueloIdInput = document.getElementById('tipo_suelo-id');
    const tipoSueloNameInput = document.getElementById('tipo_suelo-nombre');
    const urlParams = new URLSearchParams(window.location.search);
    const tipoSueloId = urlParams.get('id');
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

    // Verifica si hay un ID de tipo de suelo en los parámetros
    if (tipoSueloId) {
        tipoSueloIdInput.value = tipoSueloId;

        // Obtiene los datos del tipo de suelo
        fetch(`/tipos_suelos/tipo_suelo/${tipoSueloId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tipo_suelo) {
                    tipoSueloNameInput.value = data.tipo_suelo.NOMBRE;
                    toastr.success('Datos del tipo de suelo cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('No se encontró el tipo de suelo solicitado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener los datos del tipo de suelo. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de tipo de suelo.', 'Advertencia');
    }

    // Maneja el envío del formulario para actualizar el tipo de suelo
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";        
        const newName = tipoSueloNameInput.value.trim();

        if (!newName) {
            toastr.warning('El nombre del tipo de suelo no puede estar vacío.', 'Advertencia');
            return;
        }

        fetch(`/tipos_suelos/update/${tipoSueloId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Tipo de suelo actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_tipos-suelos.html'; 
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el tipo de suelo.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    });
});
