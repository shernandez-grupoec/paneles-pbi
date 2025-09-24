// script.js - Login real con servidor

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    form.addEventListener('submit', (e) => {
        // Limpiar errores
        usernameError.textContent = '';
        passwordError.textContent = '';

        // Validación básica antes de enviar
        let valid = true;

        if (!usernameInput.value.trim()) {
            usernameError.textContent = 'Usuario requerido';
            valid = false;
        }

        if (!passwordInput.value) {
            passwordError.textContent = 'Contraseña requerida';
            valid = false;
        }

        if (!valid) {
            e.preventDefault(); // evita enviar si hay errores
        }
        // Si es válido, el formulario se envía normalmente al backend (/login)
        // No hacemos e.preventDefault() y el server.js maneja la autenticación
    });
});
