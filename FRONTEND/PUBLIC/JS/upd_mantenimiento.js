document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-mantenimiento-form');
    const urlParams = new URLSearchParams(window.location.search);
    const mantenimientoId = urlParams.get('id');
    const submitButton = document.getElementById('submit-button');

    // Configuración global de Toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        maxOpened: 1,
        preventDuplicates: true,
        newestOnTop: true,
        timeOut: 5000,
        extendedTimeOut: 5000,
        tapToDismiss: false,
        positionClass: "toast-bottom-right"
    };

    // Objeto para almacenar los valores originales
    let valoresOriginales = {};


    // Función para cargar canchas
    const loadCanchas = (canchaActual, callback) => {
        fetch('/canchas/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const canchaSelect = document.getElementById('mante-cancha');
                    canchaSelect.innerHTML = ''; 
                    data.canchas.forEach(cancha => {
                        const option = document.createElement('option');
                        option.value = cancha.CANCHA;
                        option.textContent = cancha.CANCHA;
                        canchaSelect.appendChild(option);
                    });

                    if (canchaActual) {
                        canchaSelect.value = canchaActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de canchas cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de canchas.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar canchas. Intenta nuevamente.', 'Error');
                console.error("Error al cargar canchas:", error);
            });
    };

    // Cargar datos del mantenimiento actual
    if (mantenimientoId) {
        fetch(`/mantenimientos/mantenimiento/${mantenimientoId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.mantenimiento) {
                    document.getElementById('mante-id').value = mantenimientoId;
                    loadCanchas(data.mantenimiento.CANCHA, () => {});
                    document.getElementById('mante-motivo').value = data.mantenimiento.MOTIVO_MANTENIMIENTO;
                    document.getElementById('mante-fecha_inicio').value = data.mantenimiento.FECHA_INICIO;
                    document.getElementById('mante-fecha_fin').value = data.mantenimiento.FECHA_FIN;
                    document.getElementById('mante-hora_inicio').value = data.mantenimiento.HORA_INICIO;
                    document.getElementById('mante-hora_fin').value = data.mantenimiento.HORA_FIN;

                    valoresOriginales = {
                        cancha: data.mantenimiento.CANCHA,
                        motivo_mantenimiento: data.mantenimiento.MOTIVO_MANTENIMIENTO,
                        fecha_inicio: data.mantenimiento.FECHA_INICIO,
                        fecha_fin: data.mantenimiento.FECHA_FIN,
                        hora_inicio: data.mantenimiento.HORA_INICIO,
                        hora_fin: data.mantenimiento.HORA_FIN,
                    };

                    toastr.success('Datos del mantenimiento cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Mantenimiento no encontrado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos del mantenimiento. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de mantenimiento.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedMantenimientoData = {
            cancha: parseInt(document.getElementById('mante-cancha').value, 10) || null,
            motivo_mantenimiento: document.getElementById('mante-motivo').value.trim() || null,
            fecha_inicio: document.getElementById('mante-fecha_inicio').value || null,
            fecha_fin: document.getElementById('mante-fecha_fin').value || null,
            hora_inicio: document.getElementById('mante-hora_inicio').value || null,
            hora_fin: document.getElementById('mante-hora_fin').value || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedMantenimientoData).some(
            key => String(updatedMantenimientoData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/mantenimientos/update/${mantenimientoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMantenimientoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Mantenimiento actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_mantenimientos.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el mantenimiento.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar mantenimiento:', error);
            });
    });
});
