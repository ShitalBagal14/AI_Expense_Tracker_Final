document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#registerForm');
    const loginForm = document.querySelector('#loginForm');
    const backendUrl = 'http://127.0.0.1:5000';

    function showMessage(element, text, success = true) {
        element.textContent = text;
        element.classList.remove('success', 'error');
        element.classList.add(success ? 'success' : 'error');
        element.style.display = 'block';
    }

    if (registerForm) {
        const messageElement = document.querySelector('#registerMessage');
        registerForm.addEventListener('submit', async event => {
            event.preventDefault();

            const formData = new FormData(registerForm);
            const response = await fetch(`${backendUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formData)
            });

            const data = await response.json();
            if (response.ok) {
                showMessage(messageElement, 'Registration successful! Redirecting to login...', true);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showMessage(messageElement, data.message || 'Registration failed. Please try again.', false);
            }
        });
    }

    if (loginForm) {
        const messageElement = document.querySelector('#loginMessage');
        loginForm.addEventListener('submit', async event => {
            event.preventDefault();

            const formData = new FormData(loginForm);
            const response = await fetch(`${backendUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formData)
            });

            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem('smartbudgetLoggedIn', 'true');
                showMessage(messageElement, 'Login successful! Redirecting to dashboard...', true);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(messageElement, data.message || 'Invalid email or password.', false);
            }
        });
    }
});
