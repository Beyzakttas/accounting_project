// Simple translation utility. Can be integrated with i18next later.
export const translate = (key) => {
    const translations = {
        'errors.session_expired': 'Oturum süreniz doldu, lütfen tekrar giriş yapın.',
        'errors.internal_server_error': 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    };
    return translations[key] || key;
};
