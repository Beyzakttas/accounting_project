export const getAccessToken = () => {
    return localStorage.getItem('token');
};

export const setAccessToken = (token) => {
    localStorage.setItem('token', token);
};

export const deleteAccessToken = () => {
    localStorage.removeItem('token');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token) => {
    localStorage.setItem('refreshToken', token);
};

export const deleteRefreshToken = () => {
    localStorage.removeItem('refreshToken');
};
