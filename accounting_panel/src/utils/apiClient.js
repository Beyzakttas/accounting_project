const BASE_URL = 'http://localhost:5000';

const apiClient = {
    request: async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Otomatik Token Ekleme
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            // 401 Unauthorized (Yetkisiz) durumunda otomatik çıkış (Token süresi dolmuşsa)
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/';
                throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            }

            // 403 Forbidden (Yasaklı/Pasif) durumunda uyarı
            if (response.status === 403) {
                const errorData = await response.json();
                alert(errorData.message || 'Bu işlem için yetkiniz bulunmamaktadır veya hesabınız pasif durumdadır.');
                throw errorData;
            }

            const data = await response.json();

            if (!response.ok) {
                throw data; // Backend'den gelen hata JSON'unu fırlat
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    get: (endpoint, options) => apiClient.request(endpoint, { method: 'GET', ...options }),
    post: (endpoint, body, options) => apiClient.request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
    put: (endpoint, body, options) => apiClient.request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
    delete: (endpoint, options) => apiClient.request(endpoint, { method: 'DELETE', ...options }),
};

export default apiClient;
