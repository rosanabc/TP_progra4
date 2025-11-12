document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-tipo_descuento-form');
    const urlParams = new URLSearchParams(window.location.search);
    const tipoDescuentoId = urlParams.get('id');
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

    // Cargar datos del tipo de descuento actual
    if (tipoDescuentoId) {
        fetch(`/tipos_descuentos/tipo_descuento/${tipoDescuentoId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tipo_descuento) {
                    document.getElementById('tipo_descuento-id').value = tipoDescuentoId;
                    document.getElementById('tipo_descuento-nombre').value = data.tipo_descuento.NOMBRE || '';
                    document.getElementById('tipo_descuento-fecha_inicio').value = data.tipo_descuento.FECHA_INICIO || '';                    
                    document.getElementById('tipo_descuento-fecha_fin').value = data.tipo_descuento.FECHA_FIN || '';
                    document.getElementById('tipo_descuento-porcentaje').value = data.tipo_descuento.PORCENTAJE_DESCUENTO || '';

                    // Almacenar los valores originales
                    valoresOriginales = {
                        nombre: data.tipo_descuento.NOMBRE,
                        fecha_inicio: data.tipo_descuento.FECHA_INICIO,
                        fecha_fin: data.tipo_descuento.FECHA_FIN,
                        porcentaje_descuento: data.tipo_descuento.PORCENTAJE_DESCUENTO,
                    };
                    toastr.success('Datos del tipo de descuento cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Tipo de descuento no encontrado.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del tipo de descuento:', error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    } else {
        toastr.warning('No se especificó un ID de tipo de descuento.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedTipoDescuentoData = {
            nombre: document.getElementById('tipo_descuento-nombre').value.trim() || null,
            fecha_inicio: document.getElementById('tipo_descuento-fecha_inicio').value || null,
            fecha_fin: document.getElementById('tipo_descuento-fecha_fin').value || null,
            porcentaje_descuento: parseFloat(document.getElementById('tipo_descuento-porcentaje').value) || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedTipoDescuentoData).some(
            key => String(updatedTipoDescuentoData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/tipos_descuentos/update/${tipoDescuentoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTipoDescuentoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Tipo de descuento actualizado exitosamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_tipos-descuentos.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el tipo de descuento.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al actualizar tipo de descuento:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
