import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Replace with your backend URL
});

export const login = async (username, password, role) => {
  try {
    const response = await api.post('/login', { username, password, role });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default api;