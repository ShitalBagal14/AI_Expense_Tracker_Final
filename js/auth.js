document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#registerForm');
    const loginForm = document.querySelector('#loginForm');
    const backendUrl = 'http://127.0.0.1:5000';

    function showMessage(element, text, success = true) {
        element.textContent = text;
        element.classList.remove('success', 'error');
        element.classList.add(success ? 'success' : 'error');
        element.classList.add('visible');
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
        const emailInput = document.querySelector('#loginEmail');
        const passwordInput = document.querySelector('#loginPassword');

        loginForm.addEventListener('submit', async event => {
            event.preventDefault();

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            // Demo credentials for testing
            if (email === 'demo@smartbudget.com' && password === 'Demo1234') {
                sessionStorage.setItem('smartbudgetLoggedIn', 'true');
                showMessage(messageElement, 'Login successful! Redirecting to dashboard...', true);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                return;
            }

            // Try backend login
            try {
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
                    // Store user name if available in response
                    if (data.user && data.user.fullName) {
                        sessionStorage.setItem('userName', data.user.fullName);
                    }
                    showMessage(messageElement, 'Login successful! Redirecting to dashboard...', true);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showMessage(messageElement, data.message || 'Invalid email or password. Try demo@smartbudget.com / Demo1234', false);
                }
            } catch (error) {
                showMessage(messageElement, 'Connection failed. Use demo@smartbudget.com / Demo1234', false);
            }
        });
    }
});
