const MODULE_PARTIALS = [
    'partials/modules/dashboard-panel.html',
    'partials/modules/income-panel.html',
    'partials/modules/expenses-panel.html',
    'partials/modules/budget-panel.html',
    'partials/modules/savings-panel.html',
    'partials/modules/bills-panel.html',
    'partials/modules/reports-panel.html',
    'partials/modules/ai-panel.html',
    'partials/modules/transactions-panel.html',
    'partials/modules/settings-panel.html'
];

export const loadModules = async () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const topbarContainer = document.getElementById('topbar-container');
    const modulesContainer = document.getElementById('modules-container');
    const billModalContainer = document.getElementById('bill-modal-container');

    const { loadHtml } = await import('./utils.js');

    await Promise.all([
        loadHtml('partials/sidebar.html', sidebarContainer),
        loadHtml('partials/topbar.html', topbarContainer),
        loadHtml('partials/modules/bill-modal.html', billModalContainer)
    ]);

    for (const url of MODULE_PARTIALS) {
        await loadHtml(url, modulesContainer, true);
    }
};
