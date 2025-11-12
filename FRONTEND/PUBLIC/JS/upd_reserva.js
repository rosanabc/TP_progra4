document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-reserva-form');
    const urlParams = new URLSearchParams(window.location.search);
    const reservaId = urlParams.get('id');
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


    // Función para cargar clientes
    const loadClientes = (clienteActual, callback) => {
        fetch('/clientes/')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const clienteSelect = document.getElementById('reserva-cliente');
                    clienteSelect.innerHTML = ''; 
                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.CLIENTE;
                        option.textContent = cliente.NOMBRE + ' ' + cliente.APELLIDO;
                        clienteSelect.appendChild(option);
                    });

                    if (clienteActual) {
                        clienteSelect.value = clienteActual;
                    }

                    if (callback) callback();
                    //toastr.success('Lista de clientes cargada correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Error al cargar la lista de clientes.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al cargar clientes. Intenta nuevamente.', 'Error');
                console.error("Error al cargar clientes:", error);
            });
    };

        // Función para cargar horarios por cancha
        const loadCanchasHorarios = (canchaHorarioActual, callback) => {
            fetch('/canchas_horarios/')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const canchaHorarioSelect = document.getElementById('reserva-cancha_horario');
                        canchaHorarioSelect.innerHTML = ''; 
                        data.canchas_horarios.forEach(canchaHorario => {
                            const option = document.createElement('option');
                            option.value = canchaHorario.CANCHA_HORARIO;
                            option.textContent = canchaHorario.CANCHADEPORTE + ' - ' + canchaHorario.HORA_INICIO_DISPO + '/' + canchaHorario.HORA_FIN_DISPO;
                            canchaHorarioSelect.appendChild(option);
                        });
    
                        if (canchaHorarioActual) {
                            canchaHorarioSelect.value = canchaHorarioActual;
                        }
    
                        if (callback) callback();
                        //toastr.success('Lista de horarios por cancha cargada correctamente.', '¡Éxito!');
                    } else {
                        toastr.error(data.error || 'Error al cargar la lista de horarios por cancha.', 'Error');
                    }
                })
                .catch(error => {
                    toastr.error('Error al cargar horarios por cancha. Intenta nuevamente.', 'Error');
                    console.error("Error al cargar horarios por cancha:", error);
                });
        };

        // Función para cargar tipos de descuento
        const loadTiposDescuentos = (tipoDescuentoActual, callback) => {
            fetch('/tipos_descuentos/')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const tipoDescuentoSelect = document.getElementById('reserva-tipo_descuento');
                        tipoDescuentoSelect.innerHTML = ''; 
                        data.tipos_descuentos.forEach(tipoDescuento => {
                            const option = document.createElement('option');
                            option.value = tipoDescuento.TIPO_DESCUENTO;
                            option.textContent = tipoDescuento.NOMBRE;
                            tipoDescuentoSelect.appendChild(option);
                        });
    
                        if (tipoDescuentoActual) {
                            tipoDescuentoSelect.value = tipoDescuentoActual;
                        }
    
                        if (callback) callback();
                        //toastr.success('Lista de tipos de descuento cargada correctamente.', '¡Éxito!');
                    } else {
                        toastr.error(data.error || 'Error al cargar la lista de tipos de descuento.', 'Error');
                    }
                })
                .catch(error => {
                    toastr.error('Error al cargar tipos de descuento. Intenta nuevamente.', 'Error');
                    console.error("Error al cargar tipos de descuento:", error);
                });
        };        

    // Cargar datos de la reserva actual
    if (reservaId) {
        fetch(`/reservas/reserva/${reservaId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.reserva) {
                    document.getElementById('reserva-id').value = reservaId;
                    loadClientes(data.reserva.CLIENTE, () => {});
                    loadCanchasHorarios(data.reserva.CANCHA_HORARIO, () => {});
                    loadTiposDescuentos(data.reserva.TIPO_DESCUENTO, () => {});
                    document.getElementById('reserva-fecha_reserva').value = data.reserva.FECHA_RESERVA;
                    document.getElementById('reserva-hora_inicio').value = data.reserva.HORA_INICIO_RESERVA;
                    document.getElementById('reserva-hora_fin').value = data.reserva.HORA_FIN_RESERVA;

                    valoresOriginales = {
                        cliente: data.reserva.CLIENTE,
                        cancha_horario: data.reserva.CANCHA_HORARIO,
                        tipo_descuento: data.reserva.TIPO_DESCUENTO,
                        hora_inicio_reserva: data.reserva.HORA_INICIO_RESERVA,
                        hora_fin_reserva: data.reserva.HORA_FIN_RESERVA,
                        fecha_reserva: data.reserva.FECHA_RESERVA,
                    };

                    toastr.success('Datos de la reserva cargados correctamente.', '¡Éxito!');
                } else {
                    toastr.error(data.error || 'Reserva no encontrada.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error al obtener datos de la reserva. Intenta nuevamente.', 'Error');
                console.error('Error:', error);
            });
    } else {
        toastr.warning('No se especificó un ID de reserva.', 'Advertencia');
    }

    // Evento para manejar el envío del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Deshabilitar el botón para evitar múltiples clics
        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        // Capturar datos del formulario
        const updatedReservaData = {
            cliente: parseInt(document.getElementById('reserva-cliente').value, 10) || null,
            fecha_reserva: document.getElementById('reserva-fecha_reserva').value || null,
            cancha_horario: parseInt(document.getElementById('reserva-cancha_horario').value, 10) || null,
            hora_inicio_reserva: document.getElementById('reserva-hora_inicio').value.trim() || null,
            hora_fin_reserva: document.getElementById('reserva-hora_fin').value.trim() || null,
            tipo_descuento: parseInt(document.getElementById('reserva-tipo_descuento').value, 10) || null,
        };

        // Verificar si algún campo fue modificado
        const camposModificados = Object.keys(updatedReservaData).some(
            key => String(updatedReservaData[key]) !== String(valoresOriginales[key])
        );

        if (!camposModificados) {
            toastr.warning('No se detectaron cambios en los datos.', 'Advertencia');
            return;
        }

        // Enviar datos al backend
        fetch(`/reservas/update/${reservaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReservaData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toastr.success('Reserva actualizada correctamente.', '¡Éxito!');
                    setTimeout(() => {
                        window.location.href = '/list_reservas.html';
                    }, 1250);
                } else {
                    toastr.error(data.error || 'Error al actualizar la reserva.', 'Error');
                }
            })
            .catch(error => {
                toastr.error('Error en la conexión con el servidor. Intenta nuevamente.', 'Error');
                console.error('Error al actualizar reserva:', error);
            });
    });
});
