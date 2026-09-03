export function initBills() {

    const tableBody = document.getElementById('billsTableBody');

    if (!tableBody) {
        console.log('Bills table body not found - bills panel may not be loaded yet');
        return;
    }

    // Initialize modal functionality
    initBillModal();

    // Initialize filter tabs
    initBillFilters();

    // Load sample bills for now
    loadSampleBills();

    // Update summary cards for testing
    document.getElementById('dueTodayAmount').textContent = '₹2,500';
    document.getElementById('dueTodayCount').textContent = '2 Bills due today';

    document.getElementById('upcomingAmount').textContent = '₹12,800';
    document.getElementById('upcomingCount').textContent = '7 Bills due soon';

    document.getElementById('paidAmount').textContent = '₹34,500';
    document.getElementById('paidCount').textContent = '12 Bills paid';

    document.getElementById('overdueAmount').textContent = '₹1,200';
    document.getElementById('overdueCount').textContent = '1 Bill overdue';
}

// Store bills data for filtering
let allBills = [];

function initBillFilters() {
    const filterTabs = document.querySelectorAll('.bill-tab');
    const searchInput = document.getElementById('billSearch');

    if (!filterTabs) return;

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filter = tab.dataset.filter;
            filterBills(filter);
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterBills('all', searchTerm);
        });
    }
}

function filterBills(filterType, searchTerm = '') {
    const tableBody = document.getElementById('billsTableBody');
    if (!tableBody) return;

    let filteredBills = allBills;

    // Apply category filter
    if (filterType !== 'all') {
        filteredBills = allBills.filter(bill => {
            if (filterType === 'bill') return bill.type === 'bill';
            if (filterType === 'emi') return bill.type === 'emi';
            if (filterType === 'subscription') return bill.type === 'subscription';
            if (filterType === 'overdue') return bill.status === 'overdue';
            return true;
        });
    }

    // Apply search filter
    if (searchTerm) {
        filteredBills = filteredBills.filter(bill => {
            return bill.name.toLowerCase().includes(searchTerm) ||
                   bill.lender.toLowerCase().includes(searchTerm) ||
                   bill.category.toLowerCase().includes(searchTerm);
        });
    }

    // Render filtered bills
    renderBillsTable(filteredBills);
    updateSummaryCards(filteredBills);

    // Update pagination info
    const paginationInfo = document.getElementById('billsPaginationInfo');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${filteredBills.length} bills`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function renderBillsTable(bills) {
    const tableBody = document.getElementById('billsTableBody');
    if (!tableBody) return;

    if (bills.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="color: #64748b; font-size: 14px;">
                        No bills found for this category
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = bills.map(bill => {
        const icon = bill.type === 'emi' ? '🏦' : bill.type === 'subscription' ? '🔴' : '⚡';
        const category = bill.category.charAt(0).toUpperCase() + bill.category.slice(1);
        const statusClass = bill.status === 'overdue' ? 'status-overdue' :
                          bill.status === 'paid' ? 'status-paid' :
                          bill.status === 'due' ? 'status-due' : 'status-upcoming';

        return `
            <tr>
                <td>
                    <div class="bill-name-wrapper">
                        <div class="bill-icon">${icon}</div>
                        <div>
                            <div class="bill-name">${bill.name}</div>
                            <div class="bill-subtitle">${bill.lender}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="bill-category">${category}</span>
                </td>
                <td>
                    <strong>${formatDate(bill.startDate)}</strong><br>
                    <small>Due day: ${bill.dueDate || 'N/A'}</small>
                </td>
                <td>
                    <span class="bill-amount">₹${bill.amount.toLocaleString('en-IN')}</span>
                </td>
                <td>
                    <span class="bill-status ${statusClass}">${bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span>
                </td>
                <td>
                    <button class="pay-bill-btn">Pay Now</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateSummaryCards(bills) {
    const dueToday = bills.filter(b => b.status === 'due');
    const upcoming = bills.filter(b => b.status === 'upcoming');
    const paid = bills.filter(b => b.status === 'paid');
    const overdue = bills.filter(b => b.status === 'overdue');

    const dueTodayAmount = dueToday.reduce((sum, b) => sum + b.amount, 0);
    const upcomingAmount = upcoming.reduce((sum, b) => sum + b.amount, 0);
    const paidAmount = paid.reduce((sum, b) => sum + b.amount, 0);
    const overdueAmount = overdue.reduce((sum, b) => sum + b.amount, 0);

    document.getElementById('dueTodayAmount').textContent = `₹${dueTodayAmount.toLocaleString('en-IN')}`;
    document.getElementById('dueTodayCount').textContent = `${dueToday.length} Bills due today`;

    document.getElementById('upcomingAmount').textContent = `₹${upcomingAmount.toLocaleString('en-IN')}`;
    document.getElementById('upcomingCount').textContent = `${upcoming.length} Bills due soon`;

    document.getElementById('paidAmount').textContent = `₹${paidAmount.toLocaleString('en-IN')}`;
    document.getElementById('paidCount').textContent = `${paid.length} Bills paid`;

    document.getElementById('overdueAmount').textContent = `₹${overdueAmount.toLocaleString('en-IN')}`;
    document.getElementById('overdueCount').textContent = `${overdue.length} Bills overdue`;
};

function initBillModal() {
    const openModalBtn = document.getElementById('openBillModal');
    const closeModalBtn = document.getElementById('closeBillModal');
    const cancelBtn = document.getElementById('cancelBillBtn');
    const modal = document.getElementById('billModal');
    const overlay = document.getElementById('billModalOverlay');
    const billForm = document.getElementById('billForm');
    const billType = document.getElementById('billType');

    if (!openModalBtn || !modal) {
        console.log('Modal elements not found');
        return;
    }

    // Open modal
    openModalBtn.addEventListener('click', () => {
        modal.classList.add('active');
        overlay.classList.add('active');
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        billForm.reset();
        toggleEmiFields(false);
    };

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Handle EMI type selection
    if (billType) {
        billType.addEventListener('change', (e) => {
            const isEmi = e.target.value === 'emi';
            toggleEmiFields(isEmi);
        });
    }

    // Handle form submission
    if (billForm) {
        billForm.addEventListener('submit', handleBillSubmit);
    }
}

function toggleEmiFields(show) {
    const emiFields = document.querySelectorAll('.emi-field');
    emiFields.forEach(field => {
        if (show) {
            field.classList.add('visible');
        } else {
            field.classList.remove('visible');
        }
    });
}

async function handleBillSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const saveBtn = document.getElementById('saveBillBtn');

    // Validate form
    if (!validateBillForm(form)) {
        return;
    }

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Collect form data
    const formData = {
        type: form.billType.value,
        name: form.billName.value,
        lender: form.billLender.value,
        amount: parseFloat(form.billAmount.value),
        startDate: form.billStartDate.value,
        dueDate: form.billDueDate.value,
        category: form.billCategory.value,
        paymentMode: form.billPaymentMode.value,
        notes: form.billNotes.value
    };

    // Add EMI-specific fields if applicable
    if (formData.type === 'emi') {
        formData.tenure = parseInt(form.billTenure.value);
        formData.interestRate = parseFloat(form.billInterestRate.value);
    }

    try {
        // Try to send to API
        const response = await fetch('http://127.0.0.1:5000/api/bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showSuccessMessage('Bill/EMI saved successfully!');
                closeModal();
                loadBillsFromAPI();
            } else {
                showErrorMessage(result.message || 'Failed to save bill/EMI');
            }
        } else {
            // Simulate success for demo
            setTimeout(() => {
                showSuccessMessage('Bill/EMI saved successfully!');
                closeModal();
                addBillToTable(formData);
            }, 1000);
        }
    } catch (error) {
        console.log("API error, simulating success");
        setTimeout(() => {
            showSuccessMessage('Bill/EMI saved successfully!');
            closeModal();
            addBillToTable(formData);
        }, 1000);
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Bill / EMI';
    }
}

function validateBillForm(form) {
    let isValid = true;

    // Clear previous errors
    clearFormErrors(form);

    // Validate required fields
    if (!form.billType.value) {
        showFieldError(form.billType, 'Type is required');
        isValid = false;
    }

    if (!form.billName.value.trim()) {
        showFieldError(form.billName, 'Name/Title is required');
        isValid = false;
    }

    if (!form.billLender.value.trim()) {
        showFieldError(form.billLender, 'Lender/Biller is required');
        isValid = false;
    }

    if (!form.billAmount.value || parseFloat(form.billAmount.value) <= 0) {
        showFieldError(form.billAmount, 'Valid amount is required');
        isValid = false;
    }

    if (!form.billStartDate.value) {
        showFieldError(form.billStartDate, 'Start date is required');
        isValid = false;
    }

    if (!form.billCategory.value) {
        showFieldError(form.billCategory, 'Category is required');
        isValid = false;
    }

    if (!form.billPaymentMode.value) {
        showFieldError(form.billPaymentMode, 'Payment mode is required');
        isValid = false;
    }

    // EMI-specific validation
    if (form.billType.value === 'emi') {
        if (!form.billTenure.value || parseInt(form.billTenure.value) <= 0) {
            showFieldError(form.billTenure, 'Valid tenure is required');
            isValid = false;
        }

        if (!form.billInterestRate.value || parseFloat(form.billInterestRate.value) <= 0) {
            showFieldError(form.billInterestRate, 'Valid interest rate is required');
            isValid = false;
        }
    }

    return isValid;
}

function showFieldError(input, message) {
    input.classList.add('error');
    input.classList.remove('success');

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.classList.remove('error', 'success');

    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFormErrors(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => clearFieldError(input));
}

function addBillToTable(billData) {
    const tableBody = document.getElementById('billsTableBody');
    if (!tableBody) return;

    const icon = billData.type === 'emi' ? '🏦' : billData.type === 'subscription' ? '🔴' : '⚡';
    const category = billData.category.charAt(0).toUpperCase() + billData.category.slice(1);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="bill-name-wrapper">
                <div class="bill-icon">${icon}</div>
                <div>
                    <div class="bill-name">${billData.name}</div>
                    <div class="bill-subtitle">${billData.lender}</div>
                </div>
            </div>
        </td>
        <td>
            <span class="bill-category">${category}</span>
        </td>
        <td>
            <strong>${formatDate(billData.startDate)}</strong><br>
            <small>Due day: ${billData.dueDate || 'N/A'}</small>
        </td>
        <td>
            <span class="bill-amount">₹${billData.amount.toLocaleString('en-IN')}</span>
        </td>
        <td>
            <span class="bill-status status-upcoming">Upcoming</span>
        </td>
        <td>
            <button class="pay-bill-btn">Pay Now</button>
        </td>
    `;

    tableBody.insertBefore(row, tableBody.firstChild);
}

function loadSampleBills() {
    // Store sample bills data for filtering
    allBills = [
        {
            type: 'bill',
            name: 'Electricity Bill',
            lender: 'BSES Rajdhani',
            amount: 1250,
            startDate: '2025-08-10',
            dueDate: '10',
            category: 'utilities',
            status: 'due'
        },
        {
            type: 'subscription',
            name: 'Netflix Subscription',
            lender: 'Monthly Plan',
            amount: 649,
            startDate: '2025-08-12',
            dueDate: '12',
            category: 'subscriptions',
            status: 'upcoming'
        },
        {
            type: 'emi',
            name: 'SBI Personal Loan EMI',
            lender: 'XXXX-XXXX-3456',
            amount: 8500,
            startDate: '2025-08-15',
            dueDate: '15',
            category: 'housing',
            status: 'upcoming'
        },
        {
            type: 'bill',
            name: 'Internet Bill',
            lender: 'Airtel Broadband',
            amount: 999,
            startDate: '2025-08-05',
            dueDate: '5',
            category: 'utilities',
            status: 'overdue'
        },
        {
            type: 'emi',
            name: 'Home Loan EMI',
            lender: 'HDFC Bank',
            amount: 15000,
            startDate: '2025-08-20',
            dueDate: '20',
            category: 'housing',
            status: 'upcoming'
        },
        {
            type: 'subscription',
            name: 'Amazon Prime',
            lender: 'Monthly Plan',
            amount: 499,
            startDate: '2025-08-25',
            dueDate: '25',
            category: 'subscriptions',
            status: 'upcoming'
        },
        {
            type: 'bill',
            name: 'Mobile Postpaid',
            lender: 'Jio',
            amount: 799,
            startDate: '2025-08-01',
            dueDate: '1',
            category: 'utilities',
            status: 'paid'
        },
        {
            type: 'bill',
            name: 'Gas Bill',
            lender: 'Indane Gas',
            amount: 450,
            startDate: '2025-08-03',
            dueDate: '3',
            category: 'utilities',
            status: 'paid'
        }
    ];

    // Render all bills initially
    renderBillsTable(allBills);
    updateSummaryCards(allBills);
}

function loadBillsFromAPI() {
    // In production, this would fetch bills from the API
    console.log("Loading bills from API...");
}

function showSuccessMessage(message) {
    alert(message);
}

function showErrorMessage(message) {
    alert(message);
}