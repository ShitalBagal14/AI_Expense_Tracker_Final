/* =========================================================
   AI INSIGHTS MODULE
========================================================= */

let aiInsightsInitialized = false;

export function initAiInsights() {
    console.log("AI Insights module initialized");

    const aiPanel = document.querySelector('[data-panel="ai-insights-panel"]');

    if (!aiPanel) {
        console.warn("AI Insights panel not found");
        return;
    }

    console.log("AI Insights panel found, loading data...");

    // Initialize refresh button
    const refreshBtn = aiPanel.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshAiInsights);
    }

    // Initialize overview buttons
    const overviewBtns = aiPanel.querySelectorAll('.overview-btn');
    overviewBtns.forEach(btn => {
        btn.addEventListener('click', handleOverviewAction);
    });

    // Load initial insights
    loadAiInsights();

    aiInsightsInitialized = true;
}

/* =========================================================
   LOAD AI INSIGHTS
========================================================= */

async function loadAiInsights() {
    console.log("Loading AI insights...");

    try {
        // Try to fetch real data from API
        const response = await fetch('http://127.0.0.1:5000/api/ai-insights');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateAiInsights(data);
                return;
            }
        }
    } catch (error) {
        console.log("Could not fetch AI insights, using sample data");
    }

    // Use sample data if API fails
    const sampleData = generateSampleAiInsights();
    updateAiInsights(sampleData);
}

/* =========================================================
   REFRESH AI INSIGHTS
========================================================= */

async function refreshAiInsights() {
    console.log("Refreshing AI insights...");

    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `
            <svg class="spin" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13.5 8A5.5 5.5 0 0 0 8 2.5"/>
                <path d="M2.5 8A5.5 5.5 0 0 0 8 13.5"/>
            </svg>
            Refreshing...
        `;
    }

    await loadAiInsights();

    if (refreshBtn) {
        setTimeout(() => {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13.5 8A5.5 5.5 0 0 0 8 2.5"/>
                    <path d="M2.5 8A5.5 5.5 0 0 0 8 13.5"/>
                </svg>
                Refresh Insights
            `;
        }, 1000);
    }
}

/* =========================================================
   UPDATE AI INSIGHTS UI
========================================================= */

function updateAiInsights(data) {
    console.log("Updating AI insights with data:", data);

    // Update summary cards
    updateSummaryCards(data.summary);

    // Update overview cards
    updateOverviewCards(data.overview);

    // Update recommendations
    updateRecommendations(data.recommendations);

    // Update glance section
    updateGlanceSection(data.glance);
}

/* =========================================================
   UPDATE SUMMARY CARDS
========================================================= */

function updateSummaryCards(summary) {
    if (!summary) return;

    // Financial Health
    const healthValue = document.querySelector('.health-card .card-value');
    const healthProgress = document.querySelector('.health-card .progress-fill');
    const healthText = document.querySelector('.health-card .progress-text');

    if (healthValue && summary.health) {
        healthValue.textContent = summary.health.score || 'Good';
    }
    if (healthProgress && summary.health) {
        healthProgress.style.width = `${summary.health.percentage || 78}%`;
    }
    if (healthText && summary.health) {
        healthText.textContent = `${summary.health.percentage || 78}/100`;
    }

    // Savings Potential
    const savingsValue = document.querySelector('.savings-card .card-value');
    if (savingsValue && summary.savings_potential) {
        savingsValue.textContent = formatCurrency(summary.savings_potential);
    }

    // Budget Adherence
    const budgetValue = document.querySelector('.budget-card .card-value');
    if (budgetValue && summary.budget_adherence) {
        budgetValue.textContent = `${summary.budget_adherence}%`;
    }

    // EMI Ratio
    const emiValue = document.querySelector('.emi-card .card-value');
    if (emiValue && summary.emi_ratio) {
        emiValue.textContent = `${summary.emi_ratio}%`;
    }

    // Goal Progress
    const goalValue = document.querySelector('.goal-card .card-value');
    if (goalValue && summary.goal_progress) {
        goalValue.textContent = `${summary.goal_progress}%`;
    }
}

/* =========================================================
   UPDATE OVERVIEW CARDS
========================================================= */

function updateOverviewCards(overview) {
    if (!overview) return;

    // Save More
    const saveCard = document.querySelector('.save-card .overview-content p');
    if (saveCard && overview.save_more) {
        saveCard.textContent = overview.save_more.message || 'Save ₹2,100/month by reducing subscriptions';
    }

    // Optimize Spending
    const optimizeCard = document.querySelector('.optimize-card .overview-content p');
    if (optimizeCard && overview.optimize_spending) {
        optimizeCard.textContent = overview.optimize_spending.message || 'Food & Dining and Shopping are top categories';
    }

    // Upcoming Payments
    const paymentCard = document.querySelector('.payment-card .overview-content p');
    if (paymentCard && overview.upcoming_payments) {
        paymentCard.textContent = overview.upcoming_payments.message || '2 bills and 1 EMI due in 7 days';
    }

    // Goal Progress
    const progressCard = document.querySelector('.progress-card .overview-content p');
    if (progressCard && overview.goal_progress) {
        progressCard.textContent = overview.goal_progress.message || 'Continue progress to reach ₹1,00,000';
    }
}

/* =========================================================
   UPDATE RECOMMENDATIONS
========================================================= */

function updateRecommendations(recommendations) {
    if (!recommendations) return;

    const recList = document.querySelector('.ai-recommendations-list');
    if (!recList) return;

    // For now, keep the static recommendations
    // In production, this would dynamically generate based on API data
    console.log("Recommendations would be updated here");
}

/* =========================================================
   UPDATE GLANCE SECTION
========================================================= */

function updateGlanceSection(glance) {
    if (!glance) return;

    const glanceItems = document.querySelectorAll('.glance-item');

    if (glanceItems.length >= 6) {
        // Total Income
        if (glance.total_income) {
            glanceItems[0].querySelector('.glance-value').textContent = formatCurrency(glance.total_income);
        }

        // Total Expenses
        if (glance.total_expenses) {
            glanceItems[1].querySelector('.glance-value').textContent = formatCurrency(glance.total_expenses);
        }

        // Total Savings
        if (glance.total_savings) {
            glanceItems[2].querySelector('.glance-value').textContent = formatCurrency(glance.total_savings);
        }

        // Total EMI
        if (glance.total_emi) {
            glanceItems[3].querySelector('.glance-value').textContent = formatCurrency(glance.total_emi);
        }

        // Bills
        if (glance.bills) {
            glanceItems[4].querySelector('.glance-value').textContent = formatCurrency(glance.bills.amount);
            glanceItems[4].querySelector('.glance-status').textContent = `${glance.bills.paid} paid, ${glance.bills.pending} pending`;
        }

        // Savings Goals
        if (glance.savings_goals) {
            glanceItems[5].querySelector('.glance-value').textContent = formatCurrency(glance.savings_goals.current);
            glanceItems[5].querySelector('.glance-status').textContent = `${glance.savings_goals.percentage}% of ${formatCurrency(glance.savings_goals.target)}`;
        }
    }
}

/* =========================================================
   HANDLE OVERVIEW ACTIONS
========================================================= */

function handleOverviewAction(event) {
    const btn = event.target;
    const card = btn.closest('.ai-overview-card');

    if (card) {
        const cardType = card.classList.contains('save-card') ? 'save' :
                        card.classList.contains('optimize-card') ? 'optimize' :
                        card.classList.contains('payment-card') ? 'payment' : 'progress';

        console.log(`Overview action clicked: ${cardType}`);

        // Add visual feedback
        btn.textContent = 'Loading...';
        setTimeout(() => {
            btn.textContent = 'View Suggestions';
            alert(`${cardType.charAt(0).toUpperCase() + cardType.slice(1)} details would open here`);
        }, 500);
    }
}

/* =========================================================
   GENERATE SAMPLE AI INSIGHTS
========================================================= */

function generateSampleAiInsights() {
    return {
        success: true,
        summary: {
            health: {
                score: 'Good',
                percentage: 78
            },
            savings_potential: 4650,
            budget_adherence: 82,
            emi_ratio: 28,
            goal_progress: 64
        },
        overview: {
            save_more: {
                message: 'Save ₹2,100/month by reducing subscriptions and impulse spending'
            },
            optimize_spending: {
                message: 'Food & Dining and Shopping are your top expense categories'
            },
            upcoming_payments: {
                message: '2 bills and 1 EMI due in 7 days (Total: ₹3,240)'
            },
            goal_progress: {
                message: 'Continue progress to reach ₹1,00,000 by Dec 2025'
            }
        },
        recommendations: [
            {
                type: 'dining',
                title: 'Reduce Dining Out',
                description: 'Cook at home more to save ₹2,000/month',
                savings: 2000
            },
            {
                type: 'subscription',
                title: 'Cancel Unused Subscriptions',
                description: 'Cancel unused subscriptions to save ₹850/month',
                savings: 850
            },
            {
                type: 'emergency',
                title: 'Increase Emergency Fund',
                description: 'Aim for 6 months of expenses',
                action: 'Increase savings'
            },
            {
                type: 'loan',
                title: 'Prepay High Interest Loan',
                description: 'Prepay ₹20,000 to save ₹2,340 in interest',
                savings: 2340
            }
        ],
        glance: {
            total_income: 125000,
            total_expenses: 58650,
            total_savings: 22500,
            total_emi: 8450,
            bills: {
                amount: 2330,
                paid: 2,
                pending: 1
            },
            savings_goals: {
                current: 64000,
                target: 100000,
                percentage: 64
            }
        }
    };
}

/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });
}

/* =========================================================
   EXPORT
========================================================= */

export { loadAiInsights, refreshAiInsights };