document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-cancha_deporte-form');
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

    const loadDeportes = () => {
        fetch('/deportes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const deporteSelect = document.getElementById('deporte');
                    data.deportes.forEach(deporte => {
                        const option = document.createElement('option');
                        option.value = deporte.DEPORTE;
                        option.textContent = deporte.NOMBRE;
                        deporteSelect.appendChild(option);
                    });
                    //toastr.success('Lista de deportes cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de deportes.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar deportes:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    const loadCanchas = () => {
        fetch('/canchas/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const canchaSelect = document.getElementById('cancha');
                    data.canchas.forEach(cancha => {
                        const option = document.createElement('option');
                        option.value = cancha.CANCHA;
                        option.textContent = cancha.CANCHA;
                        canchaSelect.appendChild(option);
                    });
                    toastr.success('Lista de canchas cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de canchas.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar canchas:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };


    loadDeportes();
    loadCanchas();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";

        const canchaDeporteData = {
            deporte: parseInt(document.getElementById('deporte').value, 10),
            cancha: parseInt(document.getElementById('cancha').value, 10),
            costo_mantenimiento: parseFloat(document.getElementById('costo_mantenimiento').value),
        };

        fetch('/canchas_deportes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(canchaDeporteData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Deporte por cancha agregado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_canchas-deportes.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el deporte por cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar deporte por cancha:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
