export const initExpenses = () => {
    const form = document.querySelector('.expense-entry-form');
    form?.addEventListener('submit', event => {
        event.preventDefault();
    });
};
