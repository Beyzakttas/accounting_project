import apiClient from '../utils/apiClient';

export const loginUser = async (loginData) => {
    return await apiClient.post('/api/auth/login', loginData);
};

export const registerUser = async (registerData) => {
    return await apiClient.post('/api/auth/register', registerData);
};
