// Seleccionar el botón de "Módulos" y el contenedor
const toggleButton = document.querySelector('.toggle-dropdown');
const dropdown = document.querySelector('.dropdown');

// Verificar el estado guardado en localStorage al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const isMenuOpen = localStorage.getItem('menuOpen') === 'true'; // Leer el estado del menú
    if (isMenuOpen) {
        dropdown.classList.add('active'); // Mantener el menú abierto si está guardado como "true"
    }
});

// Alternar la clase active y guardar el estado en localStorage
toggleButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado
    const isActive = dropdown.classList.toggle('active'); // Alternar la clase active
    localStorage.setItem('menuOpen', isActive); // Guardar el nuevo estado en localStorage
});