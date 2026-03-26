import apiClient from '../utils/apiClient';

export const loginUser = async (loginData) => {
    return await apiClient.post('/api/auth/login', loginData);
};

export const registerUser = async (registerData) => {
    return await apiClient.post('/api/auth/register', registerData);
};

export const forgotPassword = async (email) => {
    return await apiClient.post('/api/auth/forgot-password', { email });
};

export const resetPassword = async (token, password) => {
    return await apiClient.post(`/api/auth/reset-password/${token}`, { password });
};
