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

    form.addEventListener('submit', event => {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (email === 'demo@smartbudget.com' && password === 'Demo1234') {
            sessionStorage.setItem('smartbudgetLoggedIn', 'true');
            window.location.href = 'dashboard.html';
            return;
        }

        if (messageElement) {
            messageElement.textContent = 'Invalid login credentials. Use demo@smartbudget.com / Demo1234';
            messageElement.classList.add('visible');
        }
    });
});
