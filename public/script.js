document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('email'); // coincide con el HTML
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    form.addEventListener('submit', (e) => {
        // Limpiar errores
        usernameError.textContent = '';
        passwordError.textContent = '';

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
            e.preventDefault(); // Bloquea envío si hay errores
        }
        // Si es válido, el formulario se envía normalmente al servidor (/login)
    });
});

