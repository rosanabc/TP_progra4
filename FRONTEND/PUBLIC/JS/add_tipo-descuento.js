document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-tipo_descuento-form');
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
        // Obtener datos del formulario
        const tipoDescuentoData = {
            nombre: document.getElementById('nombre').value.trim(),
            fecha_inicio: document.getElementById('fecha_inicio').value,
            fecha_fin: document.getElementById('fecha_fin').value,
            porcentaje_descuento: parseInt(document.getElementById('porcentaje').value, 10),
        };

        // Enviar los datos al backend
        fetch('/tipos_descuentos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tipoDescuentoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Tipo de descuento agregado exitosamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_tipos-descuentos.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el tipo de descuento.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar tipo de descuento:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
