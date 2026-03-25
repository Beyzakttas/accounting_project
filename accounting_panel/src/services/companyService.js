import apiClient from '../utils/apiClient';

export const getAllCompanies = async () => {
    return await apiClient.get('/api/company');
};
