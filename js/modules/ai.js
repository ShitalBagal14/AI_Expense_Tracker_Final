import { formatCurrency } from './utils.js';

const backendUrl = 'http://127.0.0.1:5000';

const DEFAULT_FINANCIAL_DATA = {
    income: 75000,
    expenses: 48500,
    categories: [
        { name: 'Food & Dining', amount: 15520 },
        { name: 'Transportation', amount: 8730 },
        { name: 'Housing', amount: 7275 },
        { name: 'Utilities', amount: 4850 },
        { name: 'Entertainment', amount: 3880 }
    ],
    bills: [
        { name: 'Electricity Bill', amount: 2500, type: 'utility' },
        { name: 'Internet Bill', amount: 1200, type: 'utility' },
        { name: 'Home Loan EMI', amount: 18500, type: 'emi' },
        { name: 'Car Loan EMI', amount: 12000, type: 'emi' }
    ],
    income_history: [52000, 58000, 61000, 64000, 70000, 73000, 75000],
    expense_history: [38000, 42000, 45000, 46000, 47000, 48500, 48500]
};

let insightsLoaded = false;

const buildInsightsPayload = () => {
    const budgetTotal = Number(localStorage.getItem('budgetTotal')) || DEFAULT_FINANCIAL_DATA.budget_total || 60000;
    const budgetSpent = Number(localStorage.getItem('budgetSpent')) || DEFAULT_FINANCIAL_DATA.expenses;

    return {
        ...DEFAULT_FINANCIAL_DATA,
        budget_total: budgetTotal,
        budget_spent: budgetSpent
    };
};

const renderAdvisorNotes = notes => {
    const advisorContent = document.getElementById('advisorContent');
    if (!advisorContent) return;

    advisorContent.innerHTML = notes.map((note, index) => `
        <div class="advisor-note">
            <span class="advisor-icon advisor-${note.color}">${index + 1}</span>
            <p>${note.text}</p>
        </div>
    `).join('');
};

const renderInsights = insights => {
    const healthScoreEl = document.getElementById('healthScore');
    const healthLabelEl = document.getElementById('healthLabel');
    const recommendationsList = document.getElementById('recommendationsList');
    const predictedIncomeEl = document.getElementById('predictedIncome');
    const predictedExpensesEl = document.getElementById('predictedExpenses');
    const predictedSavingsEl = document.getElementById('predictedSavings');
    const topCategoryNameEl = document.getElementById('topCategoryName');
    const topCategoryPercentEl = document.getElementById('topCategoryPercent');
    const topCategoryAmountEl = document.getElementById('topCategoryAmount');
    const upcomingPaymentsEl = document.getElementById('upcomingPayments');
    const expectedIncomeEl = document.getElementById('expectedIncome');
    const afterPaymentsBalanceEl = document.getElementById('afterPaymentsBalance');
    const paymentInsightNoteEl = document.getElementById('paymentInsightNote');

    if (healthScoreEl) {
        healthScoreEl.innerHTML = `${insights.health_score}<span>/100</span>`;
    }
    if (healthLabelEl) {
        healthLabelEl.textContent = insights.health_label;
    }
    if (recommendationsList) {
        recommendationsList.innerHTML = insights.recommendations
            .map(item => `<li>${item}</li>`)
            .join('');
    }
    if (predictedIncomeEl) {
        predictedIncomeEl.textContent = formatCurrency(insights.predictions.income);
    }
    if (predictedExpensesEl) {
        predictedExpensesEl.textContent = formatCurrency(insights.predictions.expenses);
    }
    if (predictedSavingsEl) {
        predictedSavingsEl.textContent = formatCurrency(insights.predictions.savings);
    }
    if (topCategoryNameEl) {
        topCategoryNameEl.textContent = insights.top_category.name;
    }
    if (topCategoryPercentEl) {
        topCategoryPercentEl.textContent = `${insights.top_category.percent}%`;
    }
    if (topCategoryAmountEl) {
        topCategoryAmountEl.textContent = formatCurrency(insights.top_category.amount);
    }

    renderAdvisorNotes(insights.advisor_notes);

    const payment = insights.payment_insights;
    if (upcomingPaymentsEl) {
        upcomingPaymentsEl.textContent = formatCurrency(payment.upcoming_payments);
    }
    if (expectedIncomeEl) {
        expectedIncomeEl.textContent = formatCurrency(payment.expected_income);
    }
    if (afterPaymentsBalanceEl) {
        afterPaymentsBalanceEl.textContent = formatCurrency(payment.after_payments_balance);
    }
    if (paymentInsightNoteEl) {
        paymentInsightNoteEl.textContent = payment.note;
    }
};

const showInsightsError = () => {
    const message = 'Unable to load AI insights. Make sure the Flask server is running.';
    const advisorContent = document.getElementById('advisorContent');
    const healthLabelEl = document.getElementById('healthLabel');

    if (advisorContent) {
        advisorContent.innerHTML = `<div class="advisor-note advisor-loading"><p>${message}</p></div>`;
    }
    if (healthLabelEl) {
        healthLabelEl.textContent = message;
    }
};

const loadInsights = async (force = false) => {
    if (insightsLoaded && !force) return;

    try {
        const response = await fetch(`${backendUrl}/api/insights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildInsightsPayload())
        });

        if (!response.ok) {
            throw new Error('Insights request failed');
        }

        const insights = await response.json();
        renderInsights(insights);
        insightsLoaded = true;
    } catch (error) {
        showInsightsError();
    }
};

export const initAi = navigateToPanel => {
    window.loadInsights = loadInsights;

    window.refreshInsightsFromBudget = () => {
        insightsLoaded = false;
        loadInsights(true);
    };

    document.getElementById('viewAllInsightsBtn')?.addEventListener('click', event => {
        event.preventDefault();
        navigateToPanel('ai-panel');
    });

    document.getElementById('viewDetailedAnalysisBtn')?.addEventListener('click', event => {
        event.preventDefault();
        navigateToPanel('ai-panel');
    });

    document.getElementById('refreshInsightsBtn')?.addEventListener('click', () => {
        insightsLoaded = false;
        loadInsights(true);
    });

    loadInsights();
};
