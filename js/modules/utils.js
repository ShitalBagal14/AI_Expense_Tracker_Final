export const formatCurrency = amount => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};

export const checkAuth = () => {
    const isLoggedIn = sessionStorage.getItem('smartbudgetLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.replace('login.html');
        return false;
    }
    return true;
};

export const loadHtml = async (url, container, append = false) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
    }
    const html = await response.text();
    if (append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }
};
