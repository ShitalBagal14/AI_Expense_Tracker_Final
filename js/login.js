document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');
    const emailInput = document.querySelector('#loginEmail');
    const passwordInput = document.querySelector('#loginPassword');
    const messageElement = document.querySelector('#loginMessage');

    if (sessionStorage.getItem('smartbudgetLoggedIn') === 'true') {
        window.location.replace('dashboard.html');
        return;
    }

    if (!form) {
        return;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Demo credentials for testing (always works)
        if (email === 'demo@smartbudget.com' && password === 'Demo1234') {
            sessionStorage.setItem('smartbudgetLoggedIn', 'true');
            window.location.href = 'dashboard.html';
            return;
        }

        // Try backend login for other credentials
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('smartbudgetLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                if (messageElement) {
                    messageElement.textContent = data.message || 'Login failed. Try demo@smartbudget.com / Demo1234';
                    messageElement.classList.remove('success');
                    messageElement.classList.add('error');
                    messageElement.classList.add('visible');
                }
            }
        } catch (error) {
            // Backend connection failed
            if (messageElement) {
                messageElement.textContent = 'Backend connection failed. Use demo@smartbudget.com / Demo1234';
                messageElement.classList.remove('success');
                messageElement.classList.add('error');
                messageElement.classList.add('visible');
            }
        }
    });
});
