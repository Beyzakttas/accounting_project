/**
 * Merkezi Doğrulama Kütüphanesi
 * Tüm form alanlarındaki kuralların tek elden yönetildiği dosyadır.
 */

export const validateEmail = (email) => {
    if (!email) return "E-posta alanı zorunludur.";
    
    // Basit ve yaygın kullanılan RegEx
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return "Lütfen geçerli bir e-posta adresi giriniz.";
    
    return ""; // Hata yok
};

export const validatePasswordStrength = (password) => {
    if (!password) return "Şifre alanı zorunludur.";
    
    if (password.length < 6) return "Şifre en az 6 karakter olmalıdır.";
    
    // Opsiyonel güvenlik kuralları (Müşteri isteklerine göre açılabilir)
    // if (!/[A-Z]/.test(password)) return "Şifre en az bir büyük harf içermelidir.";
    // if (!/[0-9]/.test(password)) return "Şifre en az bir rakam içermelidir.";
    
    return ""; // Hata yok
};

export const validateRequired = (value, fieldName = "Bu alan") => {
    if (value === undefined || value === null || value.toString().trim() === "") {
        return `${fieldName} zorunludur.`;
    }
    return ""; // Hata yok
};

/**
 * Form Validator Helper
 * Nesne olarak verilen form state'ini belirtilen kurallara göre çoklu doğrular.
 * @param {Object} data - Form verisi { email: 'x', password: 'y' }
 * @param {Object} rules - Doğrulama kuralları { email: validateEmail, password: validatePasswordStrength }
 * @returns {Object} { isValid: boolean, errors: { email: 'hata', ... } }
 */
export const validateForm = (data, rules) => {
    const errors = {};
    let isValid = true;

    for (const key in rules) {
        if (rules.hasOwnProperty(key)) {
            const errorMessage = rules[key](data[key] || '');
            if (errorMessage) {
                errors[key] = errorMessage;
                isValid = false;
            }
        }
    }

    return { isValid, errors };
};
