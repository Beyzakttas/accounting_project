const MESSAGES = {
    MODELS: {
        USER: {
            FULLNAME_REQUIRED: 'Lütfen adınızı ve soyadınızı girin.',
            EMAIL_REQUIRED: 'Lütfen geçerli bir e-posta adresi girin.',
            PASSWORD_REQUIRED: 'Lütfen hesabınız için bir şifre belirleyin.',
            PASSWORD_LENGTH: 'Güvenliğiniz için şifreniz en az 8 karakter olmalıdır.',
            PASSWORD_COMPLEXITY: 'Şifreniz en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter (!@#$%^&* gibi) içermelidir.',
        },
        CATEGORY: {
            NAME_REQUIRED: 'Lütfen kategori adını belirtin.'
        },
        COMPANY: {
            NAME_REQUIRED: 'Lütfen şirket adını girin.',
            ADDRESS_REQUIRED: 'Lütfen şirket adresini belirtin.',
            TAX_NUMBER_REQUIRED: 'Lütfen geçerli bir vergi numarası girin.',
            PHONE_REQUIRED: 'Lütfen iletişim için bir telefon numarası girin.',
            EMAIL_REQUIRED: 'Şirket e-posta adresi belirtilmelidir.',
        }
    },
    AUTH: {
        NO_TOKEN: 'Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.',
        INVALID_TOKEN_USER: 'Oturum süreniz dolmuş veya kullanıcı tanımlanamadı. Lütfen tekrar giriş yapın.',
        ACCOUNT_SUSPENDED: 'Hesabınız şu an pasif durumda. Lütfen yöneticinizle iletişime geçin.',
        COMPANY_INACTIVE: 'Bağlı olduğunuz şirketin hesabı şu an hizmet dışıdır.',
        INVALID_TOKEN: 'Oturum anahtarı geçersiz, lütfen sayfayı yenileyip tekrar deneyin.',
        ACCESS_DENIED: 'Bu işlemi yapmaya yetkiniz bulunmuyor. Lütfen yetkili biriyle iletişime geçin.'
    },
    CONTROLLERS: {
        AUTH: {
            USER_NOT_FOUND: 'Bu e-posta adresiyle kayıtlı bir hesap bulamadık. Lütfen bilgilerinizi kontrol edin.',
            INVALID_CREDENTIALS: 'Girdiğiniz şifre eksik veya hatalı. Lütfen tekrar deneyin.',
            SERVER_ERROR: 'Şu an sistemlerimizde bir yoğunluk var, lütfen biraz sonra tekrar deneyin.',
            REGISTER_SUCCESS: 'Hesabınız başarıyla oluşturuldu, hoş geldiniz!',
            RESET_LINK_SENT: 'Şifre sıfırlama bağlantısını e-posta adresinize gönderdik. Lütfen kutunuzu kontrol edin.',
            INVALID_RESET_TOKEN: 'Şifre sıfırlama bağlantısının süresi dolmuş veya geçersiz.',
            PASSWORD_RESET_SUCCESS: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
            EMAIL_NOT_FOUND: 'Bu e-posta adresine ait bir kullanıcı kaydı bulunamadı.',
            REFRESH_TOKEN_SUCCESS: 'Oturum başarıyla yenilendi.',
            INVALID_REFRESH_TOKEN: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın.'
        },
        ADMIN: {
            COMPANY_EXISTS: 'Bu şirket adı zaten sistemde kayıtlı.',
            OWNER_EXISTS: 'Bu e-posta adresi başka bir şirket sahibi tarafından kullanılıyor.',
            COMPANY_CREATED: 'Şirket ve yönetici hesabı başarıyla oluşturuldu.',
            COMPANY_NOT_FOUND: 'Aradığınız şirket bulunamadı.',
            COMPANY_UPDATED: 'Şirket bilgileri başarıyla güncellendi.',
            SERVER_ERROR: 'İşleminiz şu an gerçekleştirilemiyor, lütfen biraz bekleyip tekrar deneyin.'
        },
        OWNER: {
            EMAIL_EXISTS: 'Bu e-posta adresi zaten kullanımda.',
            STAFF_CREATED: 'Personel kaydı başarıyla oluşturuldu.',
            COMPANY_NOT_FOUND: 'Bağlı olduğunuz şirket bilgisine ulaşılamadı.',
            SETTINGS_UPDATED: 'Şirket ayarlarınız başarıyla kaydedildi.',
            CATEGORY_EXISTS: 'Bu kategori zaten sistemde mevcut.',
            CATEGORY_CREATED: 'Yeni kategori başarıyla eklendi.',
            SERVER_ERROR: 'Beklenmedik bir sorun oluştu, lütfen daha sonra tekrar deneyin.'
        }
    }
};

export default MESSAGES;
