import { formatCurrency } from './utils.js';

export const initBudget = () => {
    const totalBudgetInput = document.getElementById('totalBudgetInput');
    const spentBudgetInput = document.getElementById('spentBudgetInput');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const savingsRateElement = document.getElementById('savingsRate');
    const budgetFill = document.querySelector('.budget-progress .progress-fill');
    const budgetUsagePercent = document.getElementById('budgetUsagePercent');

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

        if (typeof window.refreshInsightsFromBudget === 'function') {
            window.refreshInsightsFromBudget();
        }
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
};
