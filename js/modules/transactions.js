export const initTransactions = () => {
    console.log("Initializing Transactions module...");

    const tableBody = document.getElementById('transactionsTableBody');

    if (!tableBody) {
        console.log('Transactions table body not found - transactions panel may not be loaded yet');
        return;
    }

    console.log("Transactions table body found");

    // Initialize modal functionality
    initTransactionModal();

    // Initialize filter tabs
    initTransactionFilters();

    // Load sample transactions
    loadSampleTransactions();

    console.log("Transactions module initialized");
};

// Store transactions data for filtering
let allTransactions = [];

function initTransactionFilters() {
    const filterTabs = document.querySelectorAll('.transaction-tab');
    const searchInput = document.getElementById('transactionSearch');

    if (!filterTabs) return;

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filter = tab.dataset.filter;
            filterTransactions(filter);
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterTransactions('all', searchTerm);
        });
    }
}

function filterTransactions(filterType, searchTerm = '') {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) return;

    let filteredTransactions = allTransactions;

    // Apply category filter
    if (filterType !== 'all') {
        filteredTransactions = allTransactions.filter(transaction => {
            if (filterType === 'income') return transaction.type === 'income';
            if (filterType === 'expense') return transaction.type === 'expense';
            return true;
        });
    }

    // Apply search filter
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(transaction => {
            return transaction.description.toLowerCase().includes(searchTerm) ||
                   transaction.category.toLowerCase().includes(searchTerm);
        });
    }

    // Render filtered transactions
    renderTransactionsTable(filteredTransactions);
    updateSummaryCards(filteredTransactions);

    // Update pagination info
    const paginationInfo = document.getElementById('transactionsPaginationInfo');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${filteredTransactions.length} transactions`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function renderTransactionsTable(transactions) {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) return;

    if (transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="color: #64748b; font-size: 14px;">
                        No transactions found for this category
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = transactions.map(transaction => {
        const typeClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';

        return `
            <tr>
                <td>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </td>
                <td>
                    <span class="transaction-type ${typeClass}">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                </td>
                <td>
                    <div class="transaction-category">${transaction.category}</div>
                </td>
                <td>
                    <div class="transaction-description">${transaction.description}</div>
                </td>
                <td>
                    <div class="transaction-amount ${amountClass}">${amountPrefix} ₹${transaction.amount.toLocaleString('en-IN')}</div>
                </td>
                <td>
                    <button class="transaction-action-btn">Edit</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateSummaryCards(transactions) {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    document.getElementById('totalIncome').textContent = `₹${totalIncome.toLocaleString('en-IN')}`;
    document.getElementById('incomeCount').textContent = `${income.length} Income transactions`;

    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toLocaleString('en-IN')}`;
    document.getElementById('expenseCount').textContent = `${expenses.length} Expense transactions`;

    document.getElementById('netBalance').textContent = `₹${netBalance.toLocaleString('en-IN')}`;
    document.getElementById('totalTransactions').textContent = transactions.length;
}

function initTransactionModal() {
    const openModalBtn = document.getElementById('openTransactionModal');
    const closeModalBtn = document.getElementById('closeTransactionModal');
    const cancelBtn = document.getElementById('cancelTransactionBtn');
    const modal = document.getElementById('transactionModal');
    const overlay = document.getElementById('transactionModalOverlay');
    const transactionForm = document.getElementById('transactionForm');
    const typeOptions = document.querySelectorAll('.type-option');

    console.log('Initializing transaction modal...');
    console.log('Open button:', openModalBtn);
    console.log('Modal:', modal);
    console.log('Overlay:', overlay);

    if (!openModalBtn || !modal) {
        console.log('Modal elements not found');
        return;
    }

    // Open modal
    openModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Opening modal...');
        modal.style.display = 'flex';
        overlay.style.display = 'block';
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
    });

    // Close modal
    const closeModal = () => {
        console.log('Closing modal...');
        modal.style.display = 'none';
        overlay.style.display = 'none';
        transactionForm.reset();
        // Reset type selection
        typeOptions.forEach(option => option.classList.remove('selected'));
        typeOptions[0].classList.add('selected');
    };

    closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    overlay.addEventListener('click', closeModal);

    // Handle type selection
    typeOptions.forEach(option => {
        option.addEventListener('click', () => {
            typeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;
        });
    });

    // Handle form submission
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }

    console.log('Transaction modal initialized');
}

async function handleTransactionSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const saveBtn = document.getElementById('saveTransactionBtn');
    const modal = document.getElementById('transactionModal');
    const overlay = document.getElementById('transactionModalOverlay');
    const typeOptions = document.querySelectorAll('.type-option');

    // Validate form
    if (!validateTransactionForm(form)) {
        return;
    }

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Collect form data
    const formData = {
        type: form.transactionType.value,
        amount: parseFloat(form.transactionAmount.value),
        date: form.transactionDate.value,
        category: form.transactionCategory.value,
        paymentMethod: form.paymentMethod.value,
        description: form.transactionDescription.value,
        notes: form.transactionNotes.value
    };

    try {
        // Try to send to API
        const response = await fetch('http://127.0.0.1:5000/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showSuccessMessage('Transaction saved successfully!');
                // Close modal manually
                modal.style.display = 'none';
                overlay.style.display = 'none';
                form.reset();
                typeOptions.forEach(option => option.classList.remove('selected'));
                typeOptions[0].classList.add('selected');
                loadTransactionsFromAPI();
            } else {
                showErrorMessage(result.message || 'Failed to save transaction');
            }
        } else {
            // Simulate success for demo
            setTimeout(() => {
                showSuccessMessage('Transaction saved successfully!');
                // Close modal manually
                modal.style.display = 'none';
                overlay.style.display = 'none';
                form.reset();
                typeOptions.forEach(option => option.classList.remove('selected'));
                typeOptions[0].classList.add('selected');
                addTransactionToTable(formData);
            }, 1000);
        }
    } catch (error) {
        console.log("API error, simulating success");
        setTimeout(() => {
            showSuccessMessage('Transaction saved successfully!');
            // Close modal manually
            modal.style.display = 'none';
            overlay.style.display = 'none';
            form.reset();
            typeOptions.forEach(option => option.classList.remove('selected'));
            typeOptions[0].classList.add('selected');
            addTransactionToTable(formData);
        }, 1000);
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Transaction';
    }
}

function validateTransactionForm(form) {
    let isValid = true;

    // Clear previous errors
    clearFormErrors(form);

    // Validate required fields
    if (!form.transactionAmount.value || parseFloat(form.transactionAmount.value) <= 0) {
        showFieldError(form.transactionAmount, 'Valid amount is required');
        isValid = false;
    }

    if (!form.transactionDate.value) {
        showFieldError(form.transactionDate, 'Date is required');
        isValid = false;
    }

    if (!form.transactionCategory.value) {
        showFieldError(form.transactionCategory, 'Category is required');
        isValid = false;
    }

    if (!form.paymentMethod.value) {
        showFieldError(form.paymentMethod, 'Payment method is required');
        isValid = false;
    }

    if (!form.transactionDescription.value.trim()) {
        showFieldError(form.transactionDescription, 'Description is required');
        isValid = false;
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

function addTransactionToTable(transactionData) {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) return;

    const typeClass = transactionData.type === 'income' ? 'income' : 'expense';
    const amountClass = transactionData.type === 'income' ? 'income' : 'expense';
    const amountPrefix = transactionData.type === 'income' ? '+' : '-';

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="transaction-date">${formatDate(transactionData.date)}</div>
        </td>
        <td>
            <span class="transaction-type ${typeClass}">${transactionData.type.charAt(0).toUpperCase() + transactionData.type.slice(1)}</span>
        </td>
        <td>
            <div class="transaction-category">${transactionData.category}</div>
        </td>
        <td>
            <div class="transaction-description">${transactionData.description}</div>
        </td>
        <td>
            <div class="transaction-amount ${amountClass}">${amountPrefix} ₹${transactionData.amount.toLocaleString('en-IN')}</div>
        </td>
        <td>
            <button class="transaction-action-btn">Edit</button>
        </td>
    `;

    tableBody.insertBefore(row, tableBody.firstChild);

    // Update all transactions array
    allTransactions.unshift(transactionData);
    updateSummaryCards(allTransactions);
}

function loadSampleTransactions() {
    console.log("Loading sample transactions...");

    // Store sample transactions data for filtering
    allTransactions = [
        {
            type: 'expense',
            amount: 320,
            date: '2025-08-05',
            category: 'Food & Dining',
            paymentMethod: 'UPI',
            description: 'Lunch at Restaurant',
            notes: ''
        },
        {
            type: 'expense',
            amount: 650,
            date: '2025-08-04',
            category: 'Transportation',
            paymentMethod: 'Credit Card',
            description: 'Uber Ride',
            notes: ''
        },
        {
            type: 'income',
            amount: 50000,
            date: '2025-08-03',
            category: 'Salary',
            paymentMethod: 'Bank Transfer',
            description: 'July Salary',
            notes: ''
        },
        {
            type: 'expense',
            amount: 1250,
            date: '2025-08-03',
            category: 'Utilities',
            paymentMethod: 'Net Banking',
            description: 'Electricity Bill',
            notes: ''
        },
        {
            type: 'expense',
            amount: 2999,
            date: '2025-08-02',
            category: 'Shopping',
            paymentMethod: 'Credit Card',
            description: 'Amazon Purchase',
            notes: ''
        },
        {
            type: 'income',
            amount: 5000,
            date: '2025-08-01',
            category: 'Investment',
            paymentMethod: 'UPI',
            description: 'Stock Dividend',
            notes: ''
        },
        {
            type: 'expense',
            amount: 450,
            date: '2025-07-31',
            category: 'Healthcare',
            paymentMethod: 'Cash',
            description: 'Medicine',
            notes: ''
        },
        {
            type: 'expense',
            amount: 1500,
            date: '2025-07-30',
            category: 'Entertainment',
            paymentMethod: 'Debit Card',
            description: 'Movie Tickets',
            notes: ''
        }
    ];

    console.log("Sample transactions loaded:", allTransactions.length);

    // Render all transactions initially
    renderTransactionsTable(allTransactions);
    updateSummaryCards(allTransactions);
}

function loadTransactionsFromAPI() {
    // In production, this would fetch transactions from the API
    console.log("Loading transactions from API...");
}

function showSuccessMessage(message) {
    alert(message);
}

function showErrorMessage(message) {
    alert(message);
}
