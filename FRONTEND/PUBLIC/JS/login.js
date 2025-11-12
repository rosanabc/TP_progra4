// Configuración de toastr
toastr.options = {
    closeButton: true,
    progressBar: true,
    preventDuplicates: true,
    newestOnTop: true,
    maxOpened: 1,
    timeOut: 5000,
    extendedTimeOut: 5000,
    tapToDismiss: false,
    positionClass: "toast-bottom-right"
};

// Función para mostrar/ocultar la contraseña
document.getElementById('togglePassword').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword').querySelector('i');

    // Alternar entre tipo 'password' y 'text'
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    }
});

// Función para enviar datos de conexión al servidor
async function connectDatabase() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        toastr.warning("Por favor, completa todos los campos.", "Advertencia");
        return;
    }

    try {
        //console.log("datos", username, password);
        // Enviar solicitud de conexión al backend
        const response = await fetch('/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (response.ok) {
            toastr.success("Conexión exitosa. Redirigiendo...", "¡Éxito!");
            setTimeout(() => {
                window.location.href = 'home.html'; // Redirige a home.html en caso de éxito
            }, 1000); // Espera 2 segundos antes de redirigir
        } else {
            toastr.error("Error en la conexión. Por favor, verifica tus credenciales.", "Error");
        }
    } catch (error) {
        toastr.error("Error al intentar conectar. Por favor, inténtalo nuevamente.", "Error");
    }
}
