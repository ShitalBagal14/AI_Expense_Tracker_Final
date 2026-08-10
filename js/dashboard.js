document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('smartbudgetLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.replace('login.html');
        return;
    }

    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const modulePanels = document.querySelectorAll('.module-panel');

    const activatePanel = panelId => {
        modulePanels.forEach(panel => {
            panel.classList.toggle('hidden', panel.dataset.panel !== panelId);
        });
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

    const totalBudgetInput = document.getElementById('totalBudgetInput');
    const spentBudgetInput = document.getElementById('spentBudgetInput');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const savingsRateElement = document.getElementById('savingsRate');
    const budgetFill = document.querySelector('.budget-progress .progress-fill');
    const budgetUsagePercent = document.getElementById('budgetUsagePercent');

    const formatCurrency = amount => {
        return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    };

    const updateBudgetMetrics = () => {
        if (!totalBudgetInput || !spentBudgetInput || !remainingBudgetElement || !savingsRateElement || !budgetFill) {
            return;
        }

        const total = Math.max(0, Number(totalBudgetInput.value) || 0);
        const spent = Math.max(0, Number(spentBudgetInput.value) || 0);
        const remaining = Math.max(0, total - spent);
        const savingsRate = total > 0 ? Math.round((remaining / total) * 100) : 0;
        const usage = total > 0 ? Math.min(100, (spent / total) * 100) : 0;

        remainingBudgetElement.textContent = formatCurrency(remaining);
        savingsRateElement.textContent = `${savingsRate}%`;
        budgetFill.style.width = `${usage}%`;
        if (budgetUsagePercent) {
            budgetUsagePercent.textContent = `${Math.round(usage)}%`;
        }

        localStorage.setItem('budgetTotal', total.toString());
        localStorage.setItem('budgetSpent', spent.toString());
    };

    const loadBudgetMetrics = () => {
        if (!totalBudgetInput || !spentBudgetInput) return;

        const storedTotal = Number(localStorage.getItem('budgetTotal'));
        const storedSpent = Number(localStorage.getItem('budgetSpent'));

        if (!Number.isNaN(storedTotal) && storedTotal > 0) {
            totalBudgetInput.value = storedTotal;
        }

        if (!Number.isNaN(storedSpent) && storedSpent >= 0) {
            spentBudgetInput.value = storedSpent;
        }

        updateBudgetMetrics();
    };

    if (totalBudgetInput && spentBudgetInput) {
        totalBudgetInput.addEventListener('input', updateBudgetMetrics);
        spentBudgetInput.addEventListener('input', updateBudgetMetrics);
        loadBudgetMetrics();
    }

    const savingsGoalSelect = document.getElementById('savingsGoalSelect');
    const goalAmountInput = document.getElementById('goalAmountInput');
    const goalSavedInput = document.getElementById('goalSavedInput');
    const goalTitle = document.getElementById('goalTitle');
    const goalAmount = document.getElementById('goalAmount');
    const goalSaved = document.getElementById('goalSaved');
    const goalRemaining = document.getElementById('goalRemaining');
    const goalProgressLabel = document.getElementById('goalProgressLabel');
    const goalProgressPercent = document.getElementById('goalProgressPercent');
    const goalProgressFill = document.getElementById('goalProgressFill');

    const savingsGoals = {
        'Emergency Fund': { amount: 50000, saved: 26500 },
        'Vacation': { amount: 35000, saved: 18200 },
        'Bike': { amount: 18000, saved: 7400 },
        'Laptop': { amount: 65000, saved: 26000 },
        'House': { amount: 350000, saved: 145000 },
        'Education': { amount: 120000, saved: 47000 },
        'Wedding': { amount: 180000, saved: 89000 },
        'Investment': { amount: 90000, saved: 42000 },
        'Retirement': { amount: 800000, saved: 160000 }
    };

    const updateSavingsGoal = (selectedGoal, keepInputs = false) => {
        if (!savingsGoalSelect || !goalTitle || !goalAmount || !goalSaved || !goalRemaining || !goalProgressLabel || !goalProgressPercent || !goalProgressFill) {
            return;
        }

        const goal = savingsGoals[selectedGoal] || Object.values(savingsGoals)[0];
        const amountValue = goalAmountInput && goalAmountInput.value ? Math.max(0, Number(goalAmountInput.value)) : goal.amount;
        const savedValue = goalSavedInput && goalSavedInput.value ? Math.max(0, Number(goalSavedInput.value)) : goal.saved;
        const amount = keepInputs ? amountValue : goal.amount;
        const saved = keepInputs ? Math.min(savedValue, amount) : goal.saved;

        if (!keepInputs) {
            if (goalAmountInput) goalAmountInput.value = goal.amount;
            if (goalSavedInput) goalSavedInput.value = goal.saved;
        }

        const remaining = Math.max(0, amount - saved);
        const progress = amount > 0 ? Math.round((saved / amount) * 100) : 0;

        goalTitle.textContent = selectedGoal;
        goalAmount.textContent = formatCurrency(amount);
        goalSaved.textContent = formatCurrency(saved);
        goalRemaining.textContent = formatCurrency(remaining);
        goalProgressLabel.textContent = `${progress}%`;
        goalProgressPercent.textContent = `${progress}%`;
        goalProgressFill.style.width = `${Math.min(progress, 100)}%`;
    };

    if (savingsGoalSelect) {
        savingsGoalSelect.addEventListener('change', event => {
            updateSavingsGoal(event.target.value);
        });
    }

    if (goalAmountInput) {
        goalAmountInput.addEventListener('input', () => {
            updateSavingsGoal(savingsGoalSelect.value, true);
        });
    }

    if (goalSavedInput) {
        goalSavedInput.addEventListener('input', () => {
            updateSavingsGoal(savingsGoalSelect.value, true);
        });
    }

    if (savingsGoalSelect) {
        updateSavingsGoal(savingsGoalSelect.value);
    }

    const lineChart = document.getElementById('incomeExpenseChart');
    if (lineChart) {
        new Chart(lineChart, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    {
                        label: 'Income',
                        data: [52000, 58000, 61000, 64000, 70000, 73000, 75000],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        tension: 0.35,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#2563eb'
                    },
                    {
                        label: 'Expenses',
                        data: [38000, 42000, 45000, 46000, 47000, 48500, 48500],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        tension: 0.35,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#ef4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#24344a' } }
                },
                scales: {
                    x: { ticks: { color: '#556c8f' }, grid: { display: false } },
                    y: { ticks: { color: '#556c8f' }, grid: { color: 'rgba(148, 163, 184, 0.16)' } }
                }
            }
        });
    }

    const doughnutChart = document.getElementById('expenseDoughnutChart');
    if (doughnutChart) {
        new Chart(doughnutChart, {
            type: 'doughnut',
            data: {
                labels: ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment'],
                datasets: [
                    {
                        data: [15520, 8730, 7275, 4850, 3880],
                        backgroundColor: ['#2563eb', '#22c55e', '#f59e0b', '#0ea5e9', '#8b5cf6'],
                        hoverOffset: 6,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    const reportLineChart = document.getElementById('reportLineChart');
    if (reportLineChart) {
        new Chart(reportLineChart, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Expenses',
                    data: [43000, 39500, 42500, 46800, 51200, 53200, 53500],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#ef4444'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: '#556c8f' }, grid: { display: false } },
                    y: { ticks: { color: '#556c8f' }, grid: { color: 'rgba(148, 163, 184, 0.16)' } }
                }
            }
        });
    }

    const reportDoughnutChart = document.getElementById('reportDoughnutChart');
    if (reportDoughnutChart) {
        new Chart(reportDoughnutChart, {
            type: 'doughnut',
            data: {
                labels: ['Food & Dining', 'Transport', 'Housing', 'Savings'],
                datasets: [{
                    data: [15520, 11250, 8750, 28900],
                    backgroundColor: ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6'],
                    hoverOffset: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#475569' } }
                }
            }
        });
    }

    const billsSearchInput = document.querySelector('.bills-search-box input');
    const billRows = document.querySelectorAll('.bills-table tbody tr');
    const billFilterButtons = document.querySelectorAll('.bills-filter-group .filter-btn');

    if (billsSearchInput) {
        billsSearchInput.addEventListener('input', event => {
            const query = event.target.value.toLowerCase();
            billRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(query) ? '' : 'none';
            });
        });
    }

    billFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            billFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    const billModal = document.getElementById('billModal');
    const billModalOpen = document.querySelector('.bills-panel .secondary-btn');
    const billModalClose = document.getElementById('billModalClose');
    const billModalCancel = document.getElementById('billModalCancel');
    const billTypeOptions = document.querySelectorAll('.type-option');
    const emiDetails = document.getElementById('emiDetails');
    const billForm = document.querySelector('.bill-entry-form');

    const setBillType = type => {
        billTypeOptions.forEach(option => {
            const isActive = option.dataset.type === type;
            option.classList.toggle('active', isActive);
        });
        emiDetails.classList.toggle('active', type === 'emi');
    };

    billModalOpen?.addEventListener('click', () => {
        billModal?.classList.remove('hidden');
    });

    const closeBillModal = () => {
        billModal?.classList.add('hidden');
    };

    billModalClose?.addEventListener('click', closeBillModal);
    billModalCancel?.addEventListener('click', closeBillModal);

    billModal?.addEventListener('click', event => {
        if (event.target === billModal) {
            closeBillModal();
        }
    });

    billTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            setBillType(option.dataset.type);
        });
    });

    billForm?.addEventListener('submit', event => {
        event.preventDefault();
        closeBillModal();
    });
});
