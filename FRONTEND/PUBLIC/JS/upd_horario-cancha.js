document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-horario_cancha-form');
    const urlParams = new URLSearchParams(window.location.search);
    const canchaHorarioId = urlParams.get('id');
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

    // Función para cargar deportes por cancha
    const loadCanchasDeportes = (canchaDeporteActual, callback) => {
        fetch('/canchas_deportes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const canchaDeporteSelect = document.getElementById('horario_cancha-cancha_deporte');
                    canchaDeporteSelect.innerHTML = '';
                    data.canchas_deportes.forEach(canchaDeporte => {
                        const option = document.createElement('option');
                        option.value = canchaDeporte.CANCHA_DEPORTE;
                        option.textContent = canchaDeporte.CANCHA + ' - ' + canchaDeporte.DEPORTE_NOMBRE;
                        canchaDeporteSelect.appendChild(option);
                    });

                    if (canchaDeporteActual) {
                        canchaDeporteSelect.value = canchaDeporteActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de deportes por cancha cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de deportes por cancha.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar deportes por cancha. Intenta nuevamente.', 'Error');
                console.error("Error al cargar deportes por cancha:", error);
            });
    };

    // Cargar datos del horario por cancha actual
    if (canchaHorarioId) {
        fetch(`/canchas_horarios/cancha_horario/${canchaHorarioId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cancha_horario) {
                    document.getElementById('horario_cancha-id').value = canchaHorarioId;
                    loadCanchasDeportes(data.cancha_horario.CANCHA_DEPORTE, () => {});
                    document.getElementById('horario_cancha-hora_inicio').value = data.cancha_horario.HORA_INICIO_DISPO || '';
                    document.getElementById('horario_cancha-hora_fin').value = data.cancha_horario.HORA_FIN_DISPO || '';
                    document.getElementById('horario_cancha-precio_costo').value = data.cancha_horario.PRECIO_COSTO || '';

                    valoresOriginales = {
                        cancha_deporte: data.cancha_horario.CANCHA_DEPORTE,
                        hora_inicio_dispo: data.cancha_horario.HORA_INICIO_DISPO,
                        hora_fin_dispo: data.cancha_horario.HORA_FIN_DISPO,
                        precio_costo: data.cancha_horario.PRECIO_COSTO,
                    };

                    toastr.success('Datos del horario por cancha cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Horario por cancha no encontrado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos del horario por cancha. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de horario por cancha.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedCanchaHorarioData = {
            cancha_deporte: parseInt(document.getElementById('horario_cancha-cancha_deporte').value, 10) || null,
            hora_inicio_dispo: document.getElementById('horario_cancha-hora_inicio').value || null,
            hora_fin_dispo: document.getElementById('horario_cancha-hora_fin').value || null,
            precio_costo: parseFloat(document.getElementById('horario_cancha-precio_costo').value) || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedCanchaHorarioData).some(
            key => String(updatedCanchaHorarioData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/canchas_horarios/update/${canchaHorarioId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCanchaHorarioData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Horario por cancha actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_horarios-canchas.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el horario por cancha.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar horario por cancha:', error);
            });
    });
});
