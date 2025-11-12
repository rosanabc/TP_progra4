document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-cliente-form');
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');
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

    // Cargar datos del cliente actual
    if (clienteId) {
        fetch(`/clientes/cliente/${clienteId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cliente) {
                    document.getElementById('cliente-id').value = clienteId;
                    document.getElementById('cliente-nombre').value = data.cliente.NOMBRE || '';
                    document.getElementById('cliente-apellido').value = data.cliente.APELLIDO || '';
                    document.getElementById('cliente-direccion').value = data.cliente.DIRECCION || '';
                    document.getElementById('cliente-telefono').value = data.cliente.TELEFONO || '';
                    document.getElementById('cliente-email').value = data.cliente.CORREO || '';
                    document.getElementById('cliente-documento').value = data.cliente.NUMERO_DOCUMENTO || '';
                    document.getElementById('cliente-edad').value = data.cliente.EDAD || '';
                    document.getElementById('cliente-estado_cliente').value = data.cliente.ESTADO || '';
                    document.getElementById('cliente-barrio').value = data.cliente.BARRIO || '';
                    document.getElementById('cliente-pais').value = data.cliente.PAIS || '';
                    document.getElementById('cliente-ciudad').value = data.cliente.CIUDAD || '';
                    // Almacenar los valores originales
                    valoresOriginales = {
                        nombre: data.cliente.NOMBRE,
                        apellido: data.cliente.APELLIDO,
                        direccion: data.cliente.DIRECCION,
                        telefono: data.cliente.TELEFONO,
                        correo: data.cliente.CORREO,
                        numero_documento: data.cliente.NUMERO_DOCUMENTO,
                        edad: data.cliente.EDAD,
                        estado: data.cliente.ESTADO,
                        barrio: data.cliente.BARRIO,
                        pais: data.cliente.PAIS,
                        ciudad: data.cliente.CIUDAD,
                    };

                    toastr.success('Datos del cliente cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Cliente no encontrado.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del cliente:', error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    } else {
        toastr.warning('No se especificó un ID de cliente.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedClienteData = {
            nombre: document.getElementById('cliente-nombre').value.trim() || null,
            apellido: document.getElementById('cliente-apellido').value.trim() || null,
            direccion: document.getElementById('cliente-direccion').value.trim() || null,
            telefono: document.getElementById('cliente-telefono').value.trim() || null,
            correo: document.getElementById('cliente-email').value.trim() || null,
            numero_documento: document.getElementById('cliente-documento').value.trim() || null,
            edad: parseInt(document.getElementById('cliente-edad').value, 10) || null,
            estado: document.getElementById('cliente-estado_cliente').value.trim() || null,
            barrio: document.getElementById('cliente-barrio').value.trim() || null,
            pais: document.getElementById('cliente-pais').value.trim() || null,
            ciudad: document.getElementById('cliente-ciudad').value.trim() || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedClienteData).some(
            key => String(updatedClienteData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/clientes/update/${clienteId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedClienteData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Cliente actualizado exitosamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_clientes.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el cliente.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al actualizar cliente:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
