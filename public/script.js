// Clean Banking Login Form JavaScript (Versión final)
class CleanBankingLoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('email'); // nombre visual del input
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.login-btn');
        this.successMessage = document.getElementById('successMessage');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.usernameInput.addEventListener('blur', () => this.validateUsername());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.usernameInput.addEventListener('input', () => this.clearError('username'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
    }
    
    setupPasswordToggle() {
        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', () => {
                const type = this.passwordInput.type === 'password' ? 'text' : 'password';
                this.passwordInput.type = type;
                this.passwordToggle.classList.toggle('show-password', type === 'text');
            });
        }
    }
    
    validateUsername() {
        const value = this.usernameInput.value.trim();
        if (!value) {
            this.showError('username', 'Usuario es requerido');
            return false;
        }
        this.clearError('username');
        return true;
    }
    
    validatePassword() {
        const value = this.passwordInput.value;
        if (!value) {
            this.showError('password', 'Contraseña es requerida');
            return false;
        }
        this.clearError('password');
        return true;
    }
    
    showError(field, message) {
        const formGroup = this.getFormGroup(field);
        const errorElement = document.getElementById(`${field}Error`);
        if (formGroup && errorElement) {
            formGroup.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    clearError(field) {
        const formGroup = this.getFormGroup(field);
        const errorElement = document.getElementById(`${field}Error`);
        if (formGroup && errorElement) {
            formGroup.classList.remove('error');
            errorElement.classList.remove('show');
            setTimeout(() => { errorElement.textContent = ''; }, 200);
        }
    }
    
    getFormGroup(field) {
        const input = field === 'username' ? this.usernameInput : this.passwordInput;
        return input ? input.closest('.form-group') : null;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const isUsernameValid = this.validateUsername();
        const isPasswordValid = this.validatePassword();
        if (!isUsernameValid || !isPasswordValid) return;

        this.setLoading(true);

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: this.usernameInput.value,
                    password: this.passwordInput.value
                })
            });

            if (res.redirected) {
                window.location.href = res.url; // redirige al dashboard/panel
            } else {
                this.showError('password', 'Usuario o contraseña incorrectos');
            }

        } catch (err) {
            this.showError('password', 'Error de conexión');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
    }
    
    showSuccess() {
        // Solo si quieres animación de éxito antes de redirigir
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';
        setTimeout(() => {
            this.form.style.display = 'none';
            document.querySelector('.security-notice').style.display = 'none';
            this.successMessage.classList.add('show');
        }, 300);
    }
}

// Inicializa cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
    new CleanBankingLoginForm();
});
