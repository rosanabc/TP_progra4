document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-horario_cancha-form');
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

    const loadCanchasDeportes = () => {
        fetch('/canchas_deportes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const canchaDeporteSelect = document.getElementById('cancha_deporte');
                    data.canchas_deportes.forEach(canchaDeporte => {
                        const option = document.createElement('option');
                        option.value = canchaDeporte.CANCHA_DEPORTE;
                        option.textContent = canchaDeporte.CANCHA + ' - ' + canchaDeporte.DEPORTE_NOMBRE;
                        canchaDeporteSelect.appendChild(option);
                    });
                    //toastr.success('Lista de deportes por cancha cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de deportes por cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar deportes por cancha:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    loadCanchasDeportes();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        const canchaHorarioData = {
            cancha_deporte: parseInt(document.getElementById('cancha_deporte').value, 10),
            hora_inicio_dispo: document.getElementById('hora_inicio').value.trim(),
            hora_fin_dispo: document.getElementById('hora_fin').value.trim(),
            precio_costo: parseFloat(document.getElementById('precio_costo').value),
        };

        fetch('/canchas_horarios/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(canchaHorarioData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Horario por cancha agregado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_horarios-canchas.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el horario por cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar horario por cancha:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});