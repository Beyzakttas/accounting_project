import apiClient from '../utils/apiClient';

export const loginUser = async (loginData) => {
    return await apiClient.post('/auth/login', loginData);
};

export const registerUser = async (registerData) => {
    return await apiClient.post('/auth/register', registerData);
};

export const forgotPassword = async (email) => {
    return await apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token, password) => {
    return await apiClient.post(`/auth/reset-password/${token}`, { password });
};
