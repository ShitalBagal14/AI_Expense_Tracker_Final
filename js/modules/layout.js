export const initLayout = () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const modulePanels = document.querySelectorAll('.module-panel');

    const activatePanel = panelId => {
        modulePanels.forEach(panel => {
            panel.classList.toggle('hidden', panel.dataset.panel !== panelId);
        });
        if (panelId === 'ai-panel' && typeof window.loadInsights === 'function') {
            window.loadInsights();
        }
    };

    const navigateToPanel = panelId => {
        sidebarLinks.forEach(item => {
            item.classList.toggle('active', item.dataset.panel === panelId);
        });
        activatePanel(panelId);
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            sidebarLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const targetPanel = link.dataset.panel;
            if (targetPanel) {
                activatePanel(targetPanel);
            }
        });
    });

    const searchInput = document.querySelector('#transactionSearch');
    const transactionRows = document.querySelectorAll('.transactions-table tbody tr');
    if (searchInput) {
        searchInput.addEventListener('input', event => {
            const query = event.target.value.toLowerCase();
            transactionRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(query) ? '' : 'none';
            });
        });
    }

    const notificationToggle = document.querySelector('#notificationToggle');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    notificationToggle?.addEventListener('click', event => {
        event.stopPropagation();
        notificationDropdown.classList.toggle('open');
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.notifications')) {
            notificationDropdown?.classList.remove('open');
        }
    });

    const profileToggle = document.querySelector('#profileToggle');
    const profileDropdown = document.querySelector('.profile-dropdown');
    profileToggle?.addEventListener('click', event => {
        event.stopPropagation();
        profileDropdown.classList.toggle('open');
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.profile')) {
            profileDropdown?.classList.remove('open');
        }
    });

    const logoutBtn = document.querySelector('#logoutBtn');
    logoutBtn?.addEventListener('click', event => {
        event.preventDefault();
        sessionStorage.removeItem('smartbudgetLoggedIn');
        window.location.replace('login.html');
    });

    return navigateToPanel;
};
