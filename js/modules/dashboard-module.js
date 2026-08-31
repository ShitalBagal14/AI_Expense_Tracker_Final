export const initDashboardCharts = () => {
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
};
