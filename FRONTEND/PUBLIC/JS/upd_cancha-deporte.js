document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-deporte_cancha-form');
    const urlParams = new URLSearchParams(window.location.search);
    const canchaDeporteId = urlParams.get('id');
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

    // Función para cargar deportes
    const loadDeportes = (deporteActual, callback) => {
        fetch('/deportes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const deporteSelect = document.getElementById('deporte_cancha-deporte');
                    deporteSelect.innerHTML = '';
                    data.deportes.forEach(deporte => {
                        const option = document.createElement('option');
                        option.value =deporte.DEPORTE;
                        option.textContent = deporte.NOMBRE;
                        deporteSelect.appendChild(option);
                    });

                    if (deporteActual) {
                        deporteSelect.value = deporteActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de deportes cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de deportes.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar deportes. Intenta nuevamente.', 'Error');
                console.error("Error al cargar deportes:", error);
            });
    };

    // Función para cargar canchas
    const loadCanchas = (canchaActual, callback) => {
        fetch('/canchas/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const canchaSelect = document.getElementById('deporte_cancha-cancha');
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

    // Cargar datos del deporte por cancha actual
    if (canchaDeporteId) {
        fetch(`/canchas_deportes/cancha_deporte/${canchaDeporteId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cancha_deporte) {
                    document.getElementById('deporte_cancha-id').value = canchaDeporteId;
                    loadDeportes(data.cancha_deporte.DEPORTE, () => {});
                    loadCanchas(data.cancha_deporte.CANCHA, () => {});
                    document.getElementById('deporte_cancha-costo_mantenimiento').value = data.cancha_deporte.COSTO_MANTENIMIENTO || '';

                    valoresOriginales = {
                        deporte: data.cancha_deporte.DEPORTE,
                        cancha: data.cancha_deporte.CANCHA,
                        costo_mantenimiento: data.cancha_deporte.COSTO_MANTENIMIENTO,
                    };

                    toastr.success('Datos del deporte por cancha cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Deporte por cancha no encontrado.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos del deporte por cancha. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de deporte por cancha.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedCanchaDeporteData = {
            deporte: parseInt(document.getElementById('deporte_cancha-deporte').value, 10) || null,
            cancha: parseInt(document.getElementById('deporte_cancha-cancha').value, 10) || null,
            costo_mantenimiento: parseFloat(document.getElementById('deporte_cancha-costo_mantenimiento').value) || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedCanchaDeporteData).some(
            key => String(updatedCanchaDeporteData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/canchas_deportes/update/${canchaDeporteId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCanchaDeporteData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Deporte por cancha actualizado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_canchas-deportes.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar el deporte por cancha.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar deporte por cancha:', error);
            });
    });
});
