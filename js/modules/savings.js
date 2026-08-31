import { formatCurrency } from './utils.js';

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

export const initSavings = () => {
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
};
