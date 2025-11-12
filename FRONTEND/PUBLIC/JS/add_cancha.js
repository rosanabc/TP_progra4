document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-cancha-form');
    const submitButton = document.getElementById('submit-button');

    // Configuración global de Toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        preventDuplicates: true,
        maxOpened: 1,
        newestOnTop: true,
        timeOut: 5000,
        extendedTimeOut: 5000,
        tapToDismiss: false,
        positionClass: "toast-bottom-right"
    };

    const loadUbicaciones = () => {
        fetch('/ubicaciones/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const ubicacionSelect = document.getElementById('ubicacion');
                    data.ubicaciones.forEach(ubicacion => {
                        const option = document.createElement('option');
                        option.value = ubicacion.UBICACION;
                        option.textContent = ubicacion.NOMBRE;
                        ubicacionSelect.appendChild(option);
                    });
                    //toastr.success('Lista de ubicaciones cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de ubicaciones.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar ubicaciones:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    const loadEstadosCanchas = () => {
        fetch('/estados_canchas/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const estadoCanchaSelect = document.getElementById('estado_cancha');
                    data.estados_canchas.forEach(estadoCancha => {
                        const option = document.createElement('option');
                        option.value = estadoCancha.ESTADO_CANCHA;
                        option.textContent = estadoCancha.NOMBRE;
                        estadoCanchaSelect.appendChild(option);
                    });
                    //toastr.success('Lista de estados de cancha cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de estados de cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar estados de cancha:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    const loadTiposSuelos = () => {
        fetch('/tipos_suelos/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tipoSueloSelect = document.getElementById('tipo_suelo');
                    data.tipos_suelos.forEach(tipoSuelo => {
                        const option = document.createElement('option');
                        option.value = tipoSuelo.TIPO_SUELO;
                        option.textContent = tipoSuelo.NOMBRE;
                        tipoSueloSelect.appendChild(option);
                    });
                    //toastr.success('Lista de tipos de suelo cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de tipos de suelo.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar tipos de suelo:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    loadUbicaciones();
    loadEstadosCanchas();
    loadTiposSuelos();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";

        const canchaData = {
            ubicacion: parseInt(document.getElementById('ubicacion').value, 10),
            estado_cancha: parseInt(document.getElementById('estado_cancha').value, 10),
            tipo_suelo: parseInt(document.getElementById('tipo_suelo').value, 10),
            tipo_cancha: document.getElementById('tipo_cancha').value.trim(),
            luminica: document.getElementById('luminica').value.trim(),
            bebedero: document.getElementById('bebedero').value.trim(),
            banho: document.getElementById('banho').value.trim(),
            cambiador: document.getElementById('cambiador').value.trim(),
        };

        fetch('/canchas/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(canchaData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Cancha agregada correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_canchas.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar cancha:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
