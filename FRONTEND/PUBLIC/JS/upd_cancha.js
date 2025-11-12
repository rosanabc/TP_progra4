document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-cancha-form');
    const urlParams = new URLSearchParams(window.location.search);
    const canchaId = urlParams.get('id');
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

    const loadUbicaciones = (ubicacionActual, callback) => {
        fetch('/ubicaciones/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const ubicacionSelect = document.getElementById('cancha-ubicacion');
                    ubicacionSelect.innerHTML = '';
                    data.ubicaciones.forEach(ubicacion => {
                        const option = document.createElement('option');
                        option.value = ubicacion.UBICACION;
                        option.textContent = ubicacion.NOMBRE;
                        ubicacionSelect.appendChild(option);
                    });

                    if (ubicacionActual) {
                        ubicacionSelect.value = ubicacionActual;
                    }
                    if (callback) callback();
                    //toastr.success('Lista de ubicaciones cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de ubicaciones.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar ubicaciones. Intenta nuevamente.', 'Error');
                console.error("Error al cargar ubicaciones:", error);
            });
    };

    const loadEstadosCanchas = (estadoCanchaActual, callback) => {
        fetch('/estados_canchas/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const estadoCanchaSelect = document.getElementById('cancha-estado_cancha');
                    estadoCanchaSelect.innerHTML = '';
                    data.estados_canchas.forEach(estadoCancha => {
                        const option = document.createElement('option');
                        option.value = estadoCancha.ESTADO_CANCHA;
                        option.textContent = estadoCancha.NOMBRE;
                        estadoCanchaSelect.appendChild(option);
                    });
                    
                    if (estadoCanchaActual) {
                        estadoCanchaSelect.value = estadoCanchaActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de estados de cancha cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de estados de cancha.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar estados de cancha. Intenta nuevamente.', 'Error');
                console.error("Error al cargar estados de cancha:", error);
            });
    };
    const loadTiposSuelos = (tipoSueloActual, callback) => {
        fetch('/tipos_suelos/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tipoSueloSelect = document.getElementById('cancha-tipo_suelo');
                    tipoSueloSelect.innerHTML = '';
                    data.tipos_suelos.forEach(tipoSuelo => {
                        const option = document.createElement('option');
                        option.value = tipoSuelo.TIPO_SUELO;
                        option.textContent = tipoSuelo.NOMBRE;
                        tipoSueloSelect.appendChild(option);
                    });

                    if (tipoSueloActual) {
                        tipoSueloSelect.value = tipoSueloActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de tipos de suelo cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de tipos de suelo.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar tipos de suelo. Intenta nuevamente.', 'Error');
                console.error("Error al cargar tipos de suelo:", error);
            });
    };

    // Cargar datos de la cancha actual
    if (canchaId) {
        fetch(`/canchas/cancha/${canchaId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cancha) {
                    document.getElementById('cancha-id').value = canchaId;
                    loadUbicaciones(data.cancha.UBICACION, () => {});
                    loadEstadosCanchas(data.cancha.ESTADO_CANCHA, () => {});
                    loadTiposSuelos(data.cancha.TIPO_SUELO, () => {});
                    document.getElementById('cancha-tipo_cancha').value = data.cancha.TIPO_CANCHA;
                    document.getElementById('cancha-luminica').value = data.cancha.LUMINICA;
                    document.getElementById('cancha-bebedero').value = data.cancha.BEBEDERO;
                    document.getElementById('cancha-banho').value = data.cancha.BANHOS;
                    document.getElementById('cancha-cambiador').value = data.cancha.CAMBIADOR;

                    // Almacenar los valores originales
                    valoresOriginales = {
                        ubicacion: data.cancha.UBICACION,
                        estado_cancha: data.cancha.ESTADO_CANCHA,
                        tipo_suelo: data.cancha.TIPO_SUELO,
                        tipo_cancha: data.cancha.TIPO_CANCHA,
                        luminica: data.cancha.LUMINICA,
                        bebedero: data.cancha.BEBEDERO,
                        banho: data.cancha.BANHOS,
                        cambiador: data.cancha.CAMBIADOR,
                    };

                    toastr.success('Datos de la cancha cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Cancha no encontrada.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos de la cancha. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de cancha.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedCanchaData = {
            cancha: document.getElementById('cancha-ubicacion').value || null,
            estado_cancha: document.getElementById('cancha-estado_cancha').value || null,
            tipo_suelo: document.getElementById('cancha-tipo_suelo').value || null,
            tipo_cancha: document.getElementById('cancha-tipo_cancha').value.trim() || null,
            luminica: document.getElementById('cancha-luminica').value.trim() || null,
            bebedero: document.getElementById('cancha-bebedero').value.trim() || null,
            banhos: document.getElementById('cancha-banho').value.trim() || null,
            cambiador: document.getElementById('cancha-cambiador').value.trim() || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedCanchaData).some(
            key => updatedCanchaData[key] !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/canchas/update/${canchaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCanchaData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Cancha actualizada correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_canchas.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar la cancha.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar cancha:', error);
            });
    });
});
