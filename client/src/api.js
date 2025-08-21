import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
});

export const getUsers = () => api.get('/users');
export const createUser = (name) => api.post('/users', { name });
export const claimPoints = (userId) => api.post('/claim', { userId });
export const getLeaderboard = () => api.get('/leaderboard');
export const getUserHistory = (userId) => api.get(`/users/${userId}/history`);

export default api; 