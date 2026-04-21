import { request } from './NetworkService';
import { RequestTypes } from '../enums/RequestType';

const apiClient = {
    // Convenience methods (Vitrin)
    get: (endpoint, options) => apiClient.request(endpoint, { method: 'GET', ...options }),
    post: (endpoint, body, options) => apiClient.request(endpoint, { method: 'POST', body, ...options }),
    put: (endpoint, body, options) => apiClient.request(endpoint, { method: 'PUT', body, ...options }),
    delete: (endpoint, options) => apiClient.request(endpoint, { method: 'DELETE', ...options }),

    // Internal request engine (Mutfak)
    request: async (endpoint, options = {}) => {
        const { method, body, headers, params } = options;

        const res = await request({
            requestType: method?.toLowerCase() || RequestTypes.get,
            url: endpoint,
            data: body,
            headers: headers,
            params: params
        });

        // Response handling and error checking
        if (res.status >= 200 && res.status < 300) {
            return res.data;
        } else {
            // Kullanıcıya sadece anlamlı mesajları göster, teknik detayları filtrele
            const errData = res.data || {};
            let message = "Beklenmedik bir hata oluştu.";

            if (errData.message) {
                message = errData.message;
            } else if (errData.error) {
                message = errData.error;
            } else if (Array.isArray(errData.errors) && errData.errors.length > 0) {
                message = errData.errors[0].msg || errData.errors[0].message;
            }

            // Teknik hata kodlarını (500, 404 vb.) içeren mesajları bastır
            if (message.includes('Error') || message.includes('status code') || message.includes('failed')) {
                message = "Sunucu ile iletişim kurulurken bir sorun oluştu.";
            }

            // eslint-disable-next-line no-throw-literal
            throw { ...errData, message };
        }
    },
    // Yardımcı Formatlayıcılar (Utils)
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(amount || 0);
    },
    formatDate: (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR');
    }
};

export default apiClient;
