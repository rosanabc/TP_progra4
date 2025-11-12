document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-mantenimiento-form');
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
                    //toastr.success('Lista de canchas cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de canchas.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar canchas:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    loadCanchas();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        const mantenimientoData = {
            cancha: parseInt(document.getElementById('cancha').value, 10),
            motivo_mantenimiento: document.getElementById('motivo').value.trim(),
            fecha_inicio: document.getElementById('fecha_inicio').value,
            fecha_fin: document.getElementById('fecha_fin').value,
            hora_inicio: document.getElementById('hora_inicio').value || null,
            hora_fin: document.getElementById('hora_fin').value,
        };

        fetch('/mantenimientos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mantenimientoData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Mantenimiento agregado correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_mantenimientos.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al agregar el mantenimiento.', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al agregar mantenimiento:', error);
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
            });
    });
});
