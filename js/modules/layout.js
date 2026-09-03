export const initLayout = () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const modulePanels = document.querySelectorAll('.module-panel');
    const pageTitle = document.getElementById('pageTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');

    // Fetch user profile and update welcome message
    loadUserProfile();

    // Ensure dashboard is visible by default
    modulePanels.forEach(panel => {
        if (panel.dataset.panel === 'dashboard-panel') {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });

    // Update welcome message for dashboard
    if (welcomeMessage) {
        welcomeMessage.style.display = 'block';
    }

    function updateTopbar(panelId) {
        // Page titles mapping
        const pageTitles = {
            'dashboard-panel': 'Dashboard',
            'income-panel': 'Income',
            'expenses-panel': 'Expenses',
            'budget-panel': 'Budget',
            'savings-panel': 'Savings Goals',
            'bills-panel': 'Bills & EMI',
            'reports-panel': 'Reports',
            'ai-panel': 'AI Insights',
            'ai-insights-panel': 'AI Insights',
            'transactions-panel': 'Transactions',
            'settings-panel': 'Settings'
        };

        // Update page title
        if (pageTitle) {
            pageTitle.textContent = pageTitles[panelId] || 'Dashboard';
        }

        // Show welcome message only on dashboard
        if (welcomeMessage) {
            if (panelId === 'dashboard-panel') {
                welcomeMessage.style.display = 'block';
            } else {
                welcomeMessage.style.display = 'none';
            }
        }
    }

    async function loadUserProfile() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/user/profile');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user && data.user.fullName) {
                    updateWelcomeMessage(data.user.fullName);
                }
            }
        } catch (error) {
            console.log("Could not fetch user profile, using session data");
            // Try to get user name from session storage
            const userName = sessionStorage.getItem('userName');
            if (userName) {
                updateWelcomeMessage(userName);
            }
        }
    }

    function updateWelcomeMessage(userName) {
        if (welcomeMessage) {
            // Extract first name for a more personal greeting
            const firstName = userName.split(' ')[0];
            welcomeMessage.textContent = `Welcome back, ${firstName} 👋`;
        }

        // Also update profile name in topbar
        const profileName = document.querySelector('.profile-button span');
        if (profileName) {
            const firstName = userName.split(' ')[0];
            profileName.textContent = firstName;
        }
    }

    const activatePanel = panelId => {
        modulePanels.forEach(panel => {
            panel.classList.toggle('hidden', panel.dataset.panel !== panelId);
        });

        // Update page title and welcome message
        updateTopbar(panelId);

        if (panelId === 'ai-panel' && typeof window.loadInsights === 'function') {
            window.loadInsights();
        }

        // Initialize dashboard charts when dashboard panel is activated
        if (panelId === 'dashboard-panel' && typeof initDashboardCharts === 'function') {
            initDashboardCharts();
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

    // Handle profile dropdown menu clicks
    const profileDropdownLinks = document.querySelectorAll('.profile-dropdown a');
    profileDropdownLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetPanel = link.dataset.panel;
            if (targetPanel) {
                // Close dropdown
                const profileDropdown = document.querySelector('.profile-dropdown');
                if (profileDropdown) {
                    profileDropdown.classList.remove('open');
                }
                // Navigate to panel
                sidebarLinks.forEach(item => item.classList.remove('active'));
                const targetLink = document.querySelector(`[data-panel="${targetPanel}"]`);
                if (targetLink) {
                    targetLink.classList.add('active');
                }
                activatePanel(targetPanel);
            }
        });
    });

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
        sessionStorage.removeItem('userName');
        window.location.replace('login.html');
    });

    return navigateToPanel;
};