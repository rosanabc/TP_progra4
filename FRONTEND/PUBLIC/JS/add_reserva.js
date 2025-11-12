document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-reserva-form');
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

    const loadClientes = () => {
        fetch('/clientes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const clienteSelect = document.getElementById('cliente');
                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.CLIENTE;
                        option.textContent = cliente.NOMBRE + ' ' + cliente.APELLIDO;
                        clienteSelect.appendChild(option);
                    });
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de clientes.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar clientes:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    const loadCanchasHorarios = () => {
        fetch('/canchas_horarios/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const canchaHorarioSelect = document.getElementById('cancha_horario');
                    data.canchas_horarios.forEach(canchaHorario => {
                        const option = document.createElement('option');
                        option.value = canchaHorario.CANCHA_HORARIO;
                        option.textContent = canchaHorario.CANCHADEPORTE + ' - ' + canchaHorario.HORA_INICIO_DISPO + '/' + canchaHorario.HORA_FIN_DISPO;
                        canchaHorarioSelect.appendChild(option);
                    });
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de horarios por cancha.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar horarios por cancha:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    const loadTiposDescuentos = () => {
        fetch('/tipos_descuentos/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tipoDescuentoSelect = document.getElementById('tipo_descuento');
                    data.tipos_descuentos.forEach(tipoDescuento => {
                        const option = document.createElement('option');
                        option.value = tipoDescuento.TIPO_DESCUENTO;
                        option.textContent = tipoDescuento.NOMBRE;
                        tipoDescuentoSelect.appendChild(option);
                    });
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de tipos de descuento.', 'Error');
                }
            })
            .catch(error => {
                console.error("Error al cargar tipos de descuento:", error);
                toastr.error('Error al conectar con el servidor. Intenta nuevamente.', 'Error');
            });
    };

    // Cargar datos iniciales
    loadClientes();
    loadCanchasHorarios();
    loadTiposDescuentos();

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Deshabilitar el botón para evitar múltiples clics
        //submitButton.disabled = true;
        //submitButton.textContent = "Procesando...";

        const reservaData = {
            cliente: parseInt(document.getElementById('cliente').value, 10),
            fecha_reserva: document.getElementById('fecha_reserva').value,
            cancha_horario: parseInt(document.getElementById('cancha_horario').value, 10),
            hora_inicio_reserva: document.getElementById('hora_inicio').value.trim(),
            hora_fin_reserva: document.getElementById('hora_fin').value.trim(),
            tipo_descuento: parseInt(document.getElementById('tipo_descuento').value, 10),
        };

        fetch('/reservas/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservaData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                toastr.success('Reserva agregada correctamente.', '¡Éxito!');
                setTimeout(() => {
                    window.location.href = '/list_reservas.html';
                }, 1250);
            } else {
                toastr.error(data.error || 'Error al agregar la reserva.', 'Error');
            }
        })
        .catch(error => {
            console.error('Error al agregar reserva:', error);
            toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
        })
    });
});