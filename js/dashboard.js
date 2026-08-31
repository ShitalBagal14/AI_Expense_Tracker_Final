import { checkAuth } from './modules/utils.js';
import { loadModules } from './modules/loader.js';
import { initLayout } from './modules/layout.js';

import { initDashboardCharts } from './modules/dashboard-module.js';
import { initIncome } from './modules/income.js';
import { initExpenses } from './modules/expenses.js';
import { initBudget } from './modules/budget.js';
import { initSavings } from './modules/savings.js';
import { initBills } from './modules/bills.js';
import { initReports } from './modules/reports.js';
import { initAi } from './modules/ai.js';
import { initTransactions } from './modules/transactions.js';
import { initSettings } from './modules/settings.js';


console.log("dashboard.js loaded successfully");


document.addEventListener("DOMContentLoaded", async () => {

    console.log("DOM loaded");


    // ==============================
    // AUTHENTICATION
    // ==============================

    if (!checkAuth()) {
        console.error("User is not authenticated");
        return;
    }


    // ==============================
    // LOAD HTML MODULES
    // ==============================

    try {

        await loadModules();

        console.log("All modules loaded successfully");

    } catch (error) {

        console.error("Module loading failed:", error);
        return;

    }


    // ==============================
    // LAYOUT
    // ==============================

    let navigateToPanel;

    try {

        navigateToPanel = initLayout();

        console.log("Layout initialized");

    } catch (error) {

        console.error("Layout initialization failed:", error);

    }


    // ==============================
    // DASHBOARD
    // ==============================

    try {

        initDashboardCharts();

    } catch (error) {

        console.error("Dashboard initialization failed:", error);

    }


    // ==============================
    // INCOME
    // ==============================

    try {

        initIncome();

    } catch (error) {

        console.error("Income initialization failed:", error);

    }


    // ==============================
    // EXPENSES
    // ==============================

    try {

        initExpenses();

    } catch (error) {

        console.error("Expenses initialization failed:", error);

    }


    // ==============================
    // BUDGET
    // ==============================

    try {

        initBudget();

    } catch (error) {

        console.error("Budget initialization failed:", error);

    }


    // ==============================
    // SAVINGS
    // ==============================

    try {

        initSavings();

    } catch (error) {

        console.error("Savings initialization failed:", error);

    }


    // ==============================
    // BILLS & EMI
    // ==============================

    try {

        console.log("Initializing Bills & EMI...");

        initBills();

        console.log("Bills & EMI initialized successfully");

    } catch (error) {

        console.error("Bills initialization failed:", error);

    }


    // ==============================
    // REPORTS
    // ==============================

    try {

        initReports();

    } catch (error) {

        console.error("Reports initialization failed:", error);

    }


    // ==============================
    // AI
    // ==============================

    try {

        initAi(navigateToPanel);

    } catch (error) {

        console.error("AI initialization failed:", error);

    }


    // ==============================
    // TRANSACTIONS
    // ==============================

    try {

        initTransactions();

    } catch (error) {

        console.error("Transactions initialization failed:", error);

    }


    // ==============================
    // SETTINGS
    // ==============================

    try {

        initSettings();

    } catch (error) {

        console.error("Settings initialization failed:", error);

    }


    console.log("Dashboard initialization completed");

});