import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT token to every outgoing request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('glowconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on token expiry / invalid token, and normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';

    if (status === 401) {
      localStorage.removeItem('glowconnect_token');
      localStorage.removeItem('glowconnect_user');
      // Only force a redirect if we're not already on an auth page,
      // to avoid clobbering a login attempt's own error message.
      const onAuthPage = ['/login', '/register'].includes(window.location.pathname);
      if (!onAuthPage) {
        window.location.href = '/login?expired=1';
      }
    }

    return Promise.reject({ ...error, friendlyMessage: message, status });
  }
);

export default api;
