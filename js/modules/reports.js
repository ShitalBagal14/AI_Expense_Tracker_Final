let incomeExpenseChart = null;
let expenseCategoryChart = null;
let monthlyExpenseChart = null;
let savingsTrendChart = null;


/* =========================================================
   REPORTS INITIALIZATION
========================================================= */

export function initReports() {

    console.log("Reports module initialized");

    const reportPanel =
        document.querySelector('[data-panel="reports-panel"]');

    if (!reportPanel) {

        console.warn(
            "Reports panel not found"
        );

        return;
    }


    /* -----------------------------------------
       Refresh Button
    ----------------------------------------- */

    const refreshButton =
        document.getElementById("refreshReports");

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadReports
        );

    }


    /* -----------------------------------------
       Period Filter
    ----------------------------------------- */

    const periodSelect =
        document.getElementById("reportPeriod");

    if (periodSelect) {

        periodSelect.addEventListener(
            "change",
            loadReports
        );

    }


    /* -----------------------------------------
       Load Reports
    ----------------------------------------- */

    loadReports();
}


/* =========================================================
   LOAD REPORT DATA
========================================================= */

async function loadReports() {

    try {

        const periodElement =
            document.getElementById("reportPeriod");

        const months =
            periodElement
                ? periodElement.value
                : 6;


        const response = await fetch(
            `http://127.0.0.1:5000/api/reports?months=${months}`
        );


        if (!response.ok) {

            throw new Error(
                `Reports API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message || "Unable to load reports"
            );

        }


        console.log(
            "Reports data:",
            data
        );


        updateSummary(data);

        createIncomeExpenseChart(data);

        createCategoryChart(data);

        createMonthlyExpenseChart(data);

        createSavingsChart(data);

        updateTopCategory(data);

        generateInsights(data);


    } catch (error) {

        console.error(
            "Failed to load reports:",
            error
        );

    }
}


/* =========================================================
   SUMMARY CARDS
========================================================= */

function updateSummary(data) {

    const summary =
        data.summary || {};


    const income =
        document.getElementById("totalIncome");

    const expenses =
        document.getElementById("totalExpenses");

    const savings =
        document.getElementById("totalSavings");

    const rate =
        document.getElementById("savingRate");


    if (income) {

        income.textContent =
            formatCurrency(
                summary.total_income
            );

    }


    if (expenses) {

        expenses.textContent =
            formatCurrency(
                summary.total_expenses
            );

    }


    if (savings) {

        savings.textContent =
            formatCurrency(
                summary.total_savings
            );

    }


    if (rate) {

        rate.textContent =
            `${Number(
                summary.savings_rate || 0
            ).toFixed(1)}%`;

    }

}


/* =========================================================
   INCOME VS EXPENSE CHART
========================================================= */

function createIncomeExpenseChart(data) {

    const canvas =
        document.getElementById(
            "incomeExpenseChart"
        );


    if (!canvas) {

        console.warn(
            "incomeExpenseChart canvas not found"
        );

        return;

    }


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    const monthly =
        data.monthly || {};


    incomeExpenseChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels:
                    monthly.labels || [],

                datasets: [

                    {

                        label: "Income",

                        data:
                            monthly.income || [],

                        borderWidth: 3,

                        tension: 0.4,

                        fill: false

                    },

                    {

                        label: "Expenses",

                        data:
                            monthly.expenses || [],

                        borderWidth: 3,

                        tension: 0.4,

                        fill: false

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },


                plugins: {

                    legend: {

                        position: "top"

                    },


                    tooltip: {

                        callbacks: {

                            label(context) {

                                return `${context.dataset.label}: ${
                                    formatCurrency(
                                        context.raw
                                    )
                                }`;

                            }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback(value) {

                                return formatCurrency(
                                    value
                                );

                            }

                        }

                    }

                }

            }

        });

}


/* =========================================================
   EXPENSE CATEGORY DOUGHNUT
========================================================= */

function createCategoryChart(data) {

    const canvas =
        document.getElementById(
            "expenseCategoryChart"
        );


    if (!canvas) {

        console.warn(
            "expenseCategoryChart canvas not found"
        );

        return;

    }


    if (expenseCategoryChart) {

        expenseCategoryChart.destroy();

    }


    const categories =
        data.categories || {};


    expenseCategoryChart =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels:
                    categories.labels || [],

                datasets: [

                    {

                        data:
                            categories.values || [],

                        borderWidth: 2

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "68%",


                plugins: {

                    legend: {

                        display: false

                    },


                    tooltip: {

                        callbacks: {

                            label(context) {

                                return `${context.label}: ${
                                    formatCurrency(
                                        context.raw
                                    )
                                }`;

                            }

                        }

                    }

                }

            }

        });


    createCategoryLegend(data);

}


/* =========================================================
   CATEGORY LEGEND
========================================================= */

function createCategoryLegend(data) {

    const legend =
        document.getElementById(
            "categoryLegend"
        );


    if (!legend) {

        return;

    }


    legend.innerHTML = "";


    const categories =
        data.categories || {};


    const labels =
        categories.labels || [];


    const values =
        categories.values || [];


    const total =
        Number(
            data.summary?.total_expenses || 0
        );


    labels.forEach(
        (category, index) => {

            const amount =
                Number(
                    values[index] || 0
                );


            const percentage =
                total > 0
                    ? (
                        amount / total * 100
                    ).toFixed(1)
                    : 0;


            legend.innerHTML += `

                <div class="category-item">

                    <div class="category-name">

                        <span
                            class="category-dot"
                            style="
                                background: hsl(
                                    ${index * 55},
                                    70%,
                                    55%
                                );
                            ">
                        </span>

                        ${category}

                    </div>

                    <strong>
                        ${percentage}%
                    </strong>

                </div>

            `;

        }
    );

}


/* =========================================================
   MONTHLY EXPENSE CHART
========================================================= */

function createMonthlyExpenseChart(data) {

    const canvas =
        document.getElementById(
            "monthlyExpenseChart"
        );


    if (!canvas) {

        return;

    }


    if (monthlyExpenseChart) {

        monthlyExpenseChart.destroy();

    }


    const monthly =
        data.monthly || {};


    monthlyExpenseChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    monthly.labels || [],

                datasets: [

                    {

                        label: "Expenses",

                        data:
                            monthly.expenses || [],

                        borderRadius: 8,

                        borderWidth: 0

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        display: false

                    },


                    tooltip: {

                        callbacks: {

                            label(context) {

                                return formatCurrency(
                                    context.raw
                                );

                            }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback(value) {

                                return formatCurrency(
                                    value
                                );

                            }

                        }

                    }

                }

            }

        });

}


/* =========================================================
   SAVINGS TREND
========================================================= */

function createSavingsChart(data) {

    const canvas =
        document.getElementById(
            "savingsTrendChart"
        );


    if (!canvas) {

        return;

    }


    if (savingsTrendChart) {

        savingsTrendChart.destroy();

    }


    const monthly =
        data.monthly || {};


    savingsTrendChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels:
                    monthly.labels || [],

                datasets: [

                    {

                        label: "Savings",

                        data:
                            monthly.savings || [],

                        borderWidth: 3,

                        tension: 0.4,

                        fill: true

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        display: false

                    },


                    tooltip: {

                        callbacks: {

                            label(context) {

                                return `Savings: ${
                                    formatCurrency(
                                        context.raw
                                    )
                                }`;

                            }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback(value) {

                                return formatCurrency(
                                    value
                                );

                            }

                        }

                    }

                }

            }

        });

}


/* =========================================================
   TOP SPENDING CATEGORY
========================================================= */

function updateTopCategory(data) {

    const container =
        document.getElementById(
            "topCategory"
        );


    if (!container) {

        return;

    }


    const top =
        data.top_category;


    if (!top) {

        return;

    }


    const total =
        Number(
            data.summary?.total_expenses || 0
        );


    const amount =
        Number(
            top.amount || 0
        );


    const percentage =
        total > 0
            ? (
                amount / total * 100
            ).toFixed(1)
            : 0;


    container.innerHTML = `

        <div class="top-category-icon">
            💰
        </div>

        <div>

            <span>
                ${top.name || "No data"}
            </span>

            <h3>
                ${formatCurrency(amount)}
            </h3>

            <small>
                ${percentage}% of total expenses
            </small>

        </div>

    `;

}


/* =========================================================
   SIMPLE AI INSIGHTS
========================================================= */

function generateInsights(data) {

    const container =
        document.getElementById(
            "aiInsights"
        );


    if (!container) {

        return;

    }


    const summary =
        data.summary || {};


    const insights = [];


    const savingsRate =
        Number(
            summary.savings_rate || 0
        );


    if (savingsRate >= 30) {

        insights.push(
            "Your savings rate is healthy. Keep maintaining this spending pattern."
        );

    } else if (savingsRate >= 15) {

        insights.push(
            "Your savings are moderate. Try reducing unnecessary expenses."
        );

    } else {

        insights.push(
            "Your savings rate is low. Review your spending categories."
        );

    }


    const top =
        data.top_category;


    if (
        top &&
        top.name !== "No data" &&
        Number(top.amount) > 0
    ) {

        insights.push(
            `${top.name} is your highest spending category at ${formatCurrency(top.amount)}.`
        );

    }


    if (
        Number(summary.total_expenses || 0) >
        Number(summary.total_income || 0)
    ) {

        insights.push(
            "Your expenses are higher than your income. Consider reviewing your budget."
        );

    } else {

        insights.push(
            "Your expenses are below your income. Good job managing your finances!"
        );

    }


    container.innerHTML = "";


    insights.forEach(
        (text, index) => {

            container.innerHTML += `

                <div class="insight-item">

                    <span class="insight-icon">
                        ${
                            index === 0
                                ? "✨"
                                : index === 1
                                    ? "📊"
                                    : "💡"
                        }
                    </span>

                    <p>
                        ${text}
                    </p>

                </div>

            `;

        }
    );

}


/* =========================================================
   CURRENCY FORMAT
========================================================= */

function formatCurrency(value) {

    return "₹" +
        Number(value || 0)
            .toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits: 0
                }
            );

}