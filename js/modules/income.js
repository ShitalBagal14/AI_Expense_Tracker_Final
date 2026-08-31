export const initIncome = () => {
    const form = document.querySelector('.income-entry-form');
    form?.addEventListener('submit', event => {
        event.preventDefault();
    });
};
