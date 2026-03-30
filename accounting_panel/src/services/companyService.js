import apiClient from '../api/apiClient';

export const getAllCompanies = async () => {
    return await apiClient.get('/api/company');
};
