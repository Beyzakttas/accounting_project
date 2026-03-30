// Bridge utility to call toast from non-React files
export const showToast = (message, type = 'info') => {
    const event = new CustomEvent('app:toast', { detail: { message, type } });
    window.dispatchEvent(event);
};
