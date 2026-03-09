const MESSAGES = {
    MODELS: {
        USER: {
            FULLNAME_REQUIRED: 'isim soyisim alanı zorunludur',
            EMAIL_REQUIRED: 'E-posta alanı zorunludur',
            PASSWORD_REQUIRED: 'Şifre alanı zorunludur',
            PASSWORD_LENGTH: 'Şifre en az 8 karakter uzunluğunda olmalıdır',
            PASSWORD_COMPLEXITY: 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter (!@#$%^&* gibi) içermelidir',
        },
        CATEGORY: {
            NAME_REQUIRED: 'Kategori adı zorunludur'
        },
        COMPANY: {
            NAME_REQUIRED: 'Şirket adı zorunludur',
            ADDRESS_REQUIRED: 'Adres alanı zorunludur',
            TAX_NUMBER_REQUIRED: 'Vergi numarası zorunludur',
            PHONE_REQUIRED: 'Telefon numarası zorunludur',
            EMAIL_REQUIRED: 'E-posta alanı zorunludur',
        }
    },
    AUTH: {
        NO_TOKEN: 'Erişim reddedildi. Token bulunamadı.',
        INVALID_TOKEN_USER: 'Geçersiz token. Kullanıcı bulunamadı.',
        ACCOUNT_SUSPENDED: 'Hesabınız askıya alınmıştır. Lütfen yöneticinizle iletişime geçin.',
        COMPANY_INACTIVE: 'Bağlı olduğunuz şirketin hesabı aktif değil veya süresi dolmuş.',
        INVALID_TOKEN: 'Geçersiz token.',
        ACCESS_DENIED: 'Access denied. Insufficient permissions.'
    },
    CONTROLLERS: {
        AUTH: {
            USER_NOT_FOUND: 'User not found',
            INVALID_CREDENTIALS: 'Invalid credentials',
            SERVER_ERROR: 'Server error',
            REGISTER_SUCCESS: 'User registered successfully',
            RESET_LINK_SENT: 'Şifre sıfırlama bağlantısı e-posta adresine gönderildi.',
            INVALID_RESET_TOKEN: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.',
            PASSWORD_RESET_SUCCESS: 'Şifreniz başarıyla güncellendi.',
            EMAIL_NOT_FOUND: 'Bu e-posta adresiyle bir kullanıcı bulunamadı.'
        },
        ADMIN: {
            COMPANY_EXISTS: 'Company name already exists',
            OWNER_EXISTS: 'Owner email already exists',
            COMPANY_CREATED: 'Company and Owner created successfully',
            COMPANY_NOT_FOUND: 'Company not found',
            COMPANY_UPDATED: 'Company updated successfully',
            SERVER_ERROR: 'Server error'
        },
        OWNER: {
            EMAIL_EXISTS: 'Email already exists',
            STAFF_CREATED: 'Staff created successfully',
            COMPANY_NOT_FOUND: 'Company not found',
            SETTINGS_UPDATED: 'Company settings updated',
            CATEGORY_EXISTS: 'Category already exists',
            CATEGORY_CREATED: 'Category created successfully',
            SERVER_ERROR: 'Server error'
        }
    }
};

export default MESSAGES;
