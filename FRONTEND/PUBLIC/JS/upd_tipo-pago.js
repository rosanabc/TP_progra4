document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-tipo_pago-form');
    const tipoPagoIdInput = document.getElementById('tipo_pago-id');
    const tipoPagoNameInput = document.getElementById('tipo_pago-nombre');
    const urlParams = new URLSearchParams(window.location.search);
    const tipoPagoId = urlParams.get('id');
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

    // Verifica si hay un ID de tipo de pago en los parámetros
    if (tipoPagoId) {
        tipoPagoIdInput.value = tipoPagoId;

        // Obtiene los datos del tipo de pago
        fetch(`/tipos_pagos/tipo_pago/${tipoPagoId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tipo_pago) {
                    tipoPagoNameInput.value = data.tipo_pago.NOMBRE;
                    toastr.success('Datos del tipo de pago cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error('No se encontró el tipo de pago solicitado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener los datos del tipo de pago. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de tipo de pago.', 'Advertencia');
    }

    // Maneja el envío del formulario para actualizar el tipo de pago
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";        
        const newName = tipoPagoNameInput.value.trim();

        if (!newName) {
            toastr.warning('El nombre del tipo de pago no puede estar vacío.', 'Advertencia');
            return;
        }

        fetch(`/tipos_pagos/update/${tipoPagoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Tipo de pago actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_tipos-pagos.html'; 
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el tipo de pago.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    });
});
