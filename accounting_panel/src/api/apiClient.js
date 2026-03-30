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
            throw res.data || { message: 'An error occurred' };
        }
    },
};

export default apiClient;
