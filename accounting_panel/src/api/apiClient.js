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
            const errData = typeof res.data === 'object' ? res.data : { message: res.data };
            const message =
                errData.message ||
                errData.error ||
                (Array.isArray(errData.errors) ? errData.errors.map(e => e.msg || e.message).join(', ') : null) ||
                'Bir hata oluştu.';
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
