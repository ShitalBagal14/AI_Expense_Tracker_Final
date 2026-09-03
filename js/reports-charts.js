// Simple reports chart loader without module complications
(function() {
    console.log("Reports charts script loaded");

    // Declare chart variables in proper scope
    var incomeExpenseChart = null;
    var expenseCategoryChart = null;
    var monthlyExpenseChart = null;
    var savingsTrendChart = null;

    // Flag to prevent multiple initializations
    var hasInitialized = false;

    // Wait for DOM to be ready
    function initReportsCharts() {
        if (hasInitialized) {
            console.log("Already initialized, skipping");
            return true;
        }

        console.log("Initializing reports charts...");

        // Check if Chart.js is available
        if (typeof Chart === 'undefined' && typeof window.Chart === 'undefined') {
            console.error("Chart.js not available");
            return false;
        }

        const ChartLib = window.ChartLib || window.Chart || Chart;
        console.log("Using Chart library:", typeof ChartLib);

        // Check if canvas elements exist
        const canvases = ['reportsIncomeExpenseChart', 'expenseCategoryChart', 'monthlyExpenseChart', 'savingsTrendChart'];
        let allCanvasesFound = true;

        canvases.forEach(id => {
            const canvas = document.getElementById(id);
            if (!canvas) {
                console.log(`Canvas ${id} not found yet`);
                allCanvasesFound = false;
            } else {
                console.log(`Canvas ${id} found`);
            }
        });

        if (!allCanvasesFound) {
            console.log("Not all canvases found, will retry later");
            return false;
        }

        // Generate sample data
        const sampleData = {
            summary: {
                total_income: 450000,
                total_expenses: 285000,
                total_savings: 165000,
                savings_rate: 36.7
            },
            monthly: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                income: [65000, 72000, 68000, 75000, 70000, 80000],
                expenses: [45000, 52000, 48000, 55000, 42000, 43000],
                savings: [20000, 20000, 20000, 20000, 28000, 37000]
            },
            categories: {
                labels: ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment'],
                values: [85000, 45000, 75000, 35000, 45000]
            },
            top_category: {
                name: 'Food & Dining',
                amount: 85000
            }
        };

        console.log("Sample data generated:", sampleData);
        console.log("Sample monthly data:", sampleData.monthly);

        // Update summary cards
        updateSummary(sampleData);

        // Create charts - Income vs Expenses last to avoid conflicts
        console.log("Starting chart creation sequence");

        setTimeout(() => {
            createCategoryChart(sampleData, ChartLib);
        }, 50);

        setTimeout(() => {
            createMonthlyExpenseChart(sampleData, ChartLib);
        }, 100);

        setTimeout(() => {
            createSavingsChart(sampleData, ChartLib);
        }, 150);

        setTimeout(() => {
            updateTopCategory(sampleData);
        }, 200);

        // Create income vs expenses chart last with a longer delay
        setTimeout(() => {
            createIncomeExpenseChart(sampleData, ChartLib);
        }, 1000);

        hasInitialized = true;
        return true;
    }

    function updateSummary(data) {
        const summary = data.summary || {};

        const income = document.getElementById("totalIncome");
        const expenses = document.getElementById("totalExpenses");
        const savings = document.getElementById("totalSavings");
        const rate = document.getElementById("savingRate");

        if (income) income.textContent = formatCurrency(summary.total_income);
        if (expenses) expenses.textContent = formatCurrency(summary.total_expenses);
        if (savings) savings.textContent = formatCurrency(summary.total_savings);
        if (rate) rate.textContent = `${Number(summary.savings_rate || 0).toFixed(1)}%`;
    }

    function createIncomeExpenseChart(data, ChartLib) {
        const canvas = document.getElementById("reportsIncomeExpenseChart");
        if (!canvas) {
            console.warn("reportsIncomeExpenseChart canvas not found");
            return;
        }

        console.log("Creating income vs expenses chart");
        console.log("Canvas element:", canvas);
        console.log("Canvas parent:", canvas.parentElement);

        // Fix canvas styling - remove any malformed styles
        canvas.style.height = '350px';
        canvas.style.width = '100%';
        canvas.style.display = 'block';
        canvas.style.visibility = 'visible';
        canvas.style.position = 'relative';

        const monthly = data.monthly || {};
        console.log("Monthly data:", monthly);
        console.log("Monthly labels:", monthly.labels);
        console.log("Monthly income:", monthly.income);
        console.log("Monthly expenses:", monthly.expenses);

        try {
            // Reset the canvas completely
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Properly destroy any existing chart on this canvas
            const existingChart = ChartLib.getChart(canvas);
            if (existingChart) {
                console.log("Destroying existing chart on canvas");
                existingChart.destroy();
            }

            // Also destroy our local reference if it exists
            if (incomeExpenseChart && typeof incomeExpenseChart.destroy === 'function') {
                incomeExpenseChart.destroy();
            }

            console.log("Creating new chart with ChartLib:", typeof ChartLib);

            incomeExpenseChart = new ChartLib(canvas, {
                type: "line",
                data: {
                    labels: monthly.labels || [],
                    datasets: [
                        {
                            label: "Income",
                            data: monthly.income || [],
                            borderWidth: 3,
                            tension: 0.4,
                            fill: false,
                            borderColor: "#10b981",
                            backgroundColor: "rgba(16, 185, 129, 0.1)"
                        },
                        {
                            label: "Expenses",
                            data: monthly.expenses || [],
                            borderWidth: 3,
                            tension: 0.4,
                            fill: false,
                            borderColor: "#ef4444",
                            backgroundColor: "rgba(239, 68, 68, 0.1)"
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
                        legend: { position: "top" },
                        tooltip: {
                            callbacks: {
                                label(context) {
                                    return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
            console.log("Income vs expenses chart created successfully");
            console.log("Chart object:", incomeExpenseChart);
        } catch (error) {
            console.error("Error creating income vs expenses chart:", error);
            console.error("Error details:", error.message, error.stack);

            // Try to create a simple chart as fallback
            try {
                console.log("Attempting fallback chart creation");
                incomeExpenseChart = new ChartLib(canvas, {
                    type: "line",
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: "Income",
                            data: [65000, 72000, 68000, 75000, 70000, 80000],
                            borderColor: "#10b981",
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
                console.log("Fallback chart created successfully");
            } catch (fallbackError) {
                console.error("Fallback chart also failed:", fallbackError);
                console.error("Fallback error details:", fallbackError.message, fallbackError.stack);
            }
        }
    }

    function createCategoryChart(data, ChartLib) {
        const canvas = document.getElementById("expenseCategoryChart");
        if (!canvas) {
            console.warn("expenseCategoryChart canvas not found");
            return;
        }

        console.log("Creating category chart");
        canvas.style.height = '250px';
        canvas.style.width = '100%';

        const categories = data.categories || {};

        try {
            // Properly destroy any existing chart on this canvas
            const existingChart = ChartLib.getChart(canvas);
            if (existingChart) {
                console.log("Destroying existing chart on canvas");
                existingChart.destroy();
            }

            // Also destroy our local reference if it exists
            if (expenseCategoryChart && typeof expenseCategoryChart.destroy === 'function') {
                expenseCategoryChart.destroy();
            }

            expenseCategoryChart = new ChartLib(canvas, {
                type: "doughnut",
                data: {
                    labels: categories.labels || [],
                    datasets: [{
                        data: categories.values || [],
                        borderWidth: 2,
                        backgroundColor: [
                            "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
                            "#ec4899", "#f43f5e", "#f97316", "#eab308",
                            "#84cc16", "#22c55e"
                        ],
                        borderColor: "#ffffff"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "68%",
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label(context) {
                                    return `${context.label}: ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    }
                }
            });
            console.log("Category chart created successfully");
            createCategoryLegend(data);
        } catch (error) {
            console.error("Error creating category chart:", error);
        }
    }

    function createCategoryLegend(data) {
        const legend = document.getElementById("categoryLegend");
        if (!legend) return;

        legend.innerHTML = "";
        const categories = data.categories || {};
        const labels = categories.labels || [];
        const values = categories.values || [];
        const total = Number(data.summary?.total_expenses || 0);

        labels.forEach((category, index) => {
            const amount = Number(values[index] || 0);
            const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;

            legend.innerHTML += `
                <div class="category-item">
                    <div class="category-name">
                        <span class="category-dot" style="background: hsl(${index * 55}, 70%, 55%);"></span>
                        ${category}
                    </div>
                    <strong>${percentage}%</strong>
                </div>
            `;
        });
    }

    function createMonthlyExpenseChart(data, ChartLib) {
        const canvas = document.getElementById("monthlyExpenseChart");
        if (!canvas) {
            console.warn("monthlyExpenseChart canvas not found");
            return;
        }

        console.log("Creating monthly expense chart");
        canvas.style.height = '350px';
        canvas.style.width = '100%';

        const monthly = data.monthly || {};

        try {
            // Properly destroy any existing chart on this canvas
            const existingChart = ChartLib.getChart(canvas);
            if (existingChart) {
                console.log("Destroying existing chart on canvas");
                existingChart.destroy();
            }

            // Also destroy our local reference if it exists
            if (monthlyExpenseChart && typeof monthlyExpenseChart.destroy === 'function') {
                monthlyExpenseChart.destroy();
            }

            monthlyExpenseChart = new ChartLib(canvas, {
                type: "bar",
                data: {
                    labels: monthly.labels || [],
                    datasets: [{
                        label: "Expenses",
                        data: monthly.expenses || [],
                        borderRadius: 8,
                        borderWidth: 0,
                        backgroundColor: "#6366f1"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label(context) {
                                    return formatCurrency(context.raw);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
            console.log("Monthly expense chart created successfully");
        } catch (error) {
            console.error("Error creating monthly expense chart:", error);
        }
    }

    function createSavingsChart(data, ChartLib) {
        const canvas = document.getElementById("savingsTrendChart");
        if (!canvas) {
            console.warn("savingsTrendChart canvas not found");
            return;
        }

        console.log("Creating savings chart");
        canvas.style.height = '350px';
        canvas.style.width = '100%';

        const monthly = data.monthly || {};

        try {
            // Properly destroy any existing chart on this canvas
            const existingChart = ChartLib.getChart(canvas);
            if (existingChart) {
                console.log("Destroying existing chart on canvas");
                existingChart.destroy();
            }

            // Also destroy our local reference if it exists
            if (savingsTrendChart && typeof savingsTrendChart.destroy === 'function') {
                savingsTrendChart.destroy();
            }

            savingsTrendChart = new ChartLib(canvas, {
                type: "line",
                data: {
                    labels: monthly.labels || [],
                    datasets: [{
                        label: "Savings",
                        data: monthly.savings || [],
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.2)"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label(context) {
                                    return `Savings: ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
            console.log("Savings chart created successfully");
        } catch (error) {
            console.error("Error creating savings chart:", error);
        }
    }

    function updateTopCategory(data) {
        const container = document.getElementById("topCategory");
        if (!container) return;

        const top = data.top_category;
        if (!top) return;

        const total = Number(data.summary?.total_expenses || 0);
        const amount = Number(top.amount || 0);
        const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class="top-category-icon">💰</div>
            <div>
                <span>${top.name || "No data"}</span>
                <h3>${formatCurrency(amount)}</h3>
                <small>${percentage}% of total expenses</small>
            </div>
        `;
    }

    function formatCurrency(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 0
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM content loaded");
            setTimeout(initReportsCharts, 500);
        });
    } else {
        console.log("DOM already ready");
        setTimeout(initReportsCharts, 500);
    }

    // Only try to initialize when reports panel becomes visible
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('hidden') === false) {
                console.log("Reports panel became visible");
                setTimeout(initReportsCharts, 100);
            }
        });
    });

    const reportPanel = document.querySelector('[data-panel="reports-panel"]');
    if (reportPanel) {
        console.log("Reports panel found, setting up observer");
        observer.observe(reportPanel, {
            attributes: true,
            attributeFilter: ['class']
        });
    } else {
        console.log("Reports panel not found yet");
    }
})();