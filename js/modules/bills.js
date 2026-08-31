export const initBills = () => {

    const tableBody = document.getElementById('billsTableBody');

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>

            <td>
                <div class="bill-name-wrapper">

                    <div class="bill-icon">
                        ⚡
                    </div>

                    <div>
                        <div class="bill-name">
                            Electricity Bill
                        </div>

                        <div class="bill-subtitle">
                            BSES Rajdhani
                        </div>
                    </div>

                </div>
            </td>

            <td>
                <span class="bill-category">
                    Utilities
                </span>
            </td>

            <td>
                <strong>10 Aug 2025</strong><br>
                <small>Due in 1 day</small>
            </td>

            <td>
                <span class="bill-amount">
                    ₹1,250
                </span>
            </td>

            <td>
                <span class="bill-status status-due">
                    Due Soon
                </span>
            </td>

            <td>
                <button class="pay-bill-btn">
                    Pay Now
                </button>
            </td>

        </tr>


        <tr>

            <td>
                <div class="bill-name-wrapper">

                    <div class="bill-icon">
                        🔴
                    </div>

                    <div>
                        <div class="bill-name">
                            Netflix Subscription
                        </div>

                        <div class="bill-subtitle">
                            Monthly Plan
                        </div>
                    </div>

                </div>
            </td>

            <td>
                <span class="bill-category">
                    Subscription
                </span>
            </td>

            <td>
                <strong>12 Aug 2025</strong><br>
                <small>Due in 3 days</small>
            </td>

            <td>
                <span class="bill-amount">
                    ₹649
                </span>
            </td>

            <td>
                <span class="bill-status status-upcoming">
                    Upcoming
                </span>
            </td>

            <td>
                <button class="pay-bill-btn">
                    Pay Now
                </button>
            </td>

        </tr>


        <tr>

            <td>
                <div class="bill-name-wrapper">

                    <div class="bill-icon">
                        🏦
                    </div>

                    <div>
                        <div class="bill-name">
                            SBI Personal Loan EMI
                        </div>

                        <div class="bill-subtitle">
                            XXXX-XXXX-3456
                        </div>
                    </div>

                </div>
            </td>

            <td>
                <span class="bill-category">
                    EMI
                </span>
            </td>

            <td>
                <strong>15 Aug 2025</strong><br>
                <small>Due in 6 days</small>
            </td>

            <td>
                <span class="bill-amount">
                    ₹8,500
                </span>
            </td>

            <td>
                <span class="bill-status status-upcoming">
                    Upcoming
                </span>
            </td>

            <td>
                <button class="pay-bill-btn">
                    Pay Now
                </button>
            </td>

        </tr>
    `;


    // Update summary cards for testing
    document.getElementById('dueTodayAmount').textContent = '₹2,500';
    document.getElementById('dueTodayCount').textContent = '2 Bills due today';

    document.getElementById('upcomingAmount').textContent = '₹12,800';
    document.getElementById('upcomingCount').textContent = '7 Bills due soon';

    document.getElementById('paidAmount').textContent = '₹34,500';
    document.getElementById('paidCount').textContent = '12 Bills paid';

    document.getElementById('overdueAmount').textContent = '₹1,200';
    document.getElementById('overdueCount').textContent = '1 Bill overdue';
};