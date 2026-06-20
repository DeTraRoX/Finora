import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '/api';

if (import.meta.env.VITE_API_URL) {
  const normalized = import.meta.env.VITE_API_URL.replace(/\/$/, '');
  if (!normalized.endsWith('/api')) {
    baseURL = `${normalized}/api`;
  } else {
    baseURL = normalized;
  }
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g. token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Enhance message for 404 errors to help debug deployment configurations
    if (error.response && error.response.status === 404) {
      const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      error.message = `404 Not Found: API Request to "${fullUrl}" failed. Please verify your Render VITE_API_URL settings.`;
    }
    
    // If blocked or unauthorized, clear cache/token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Optional: reload page to send user to login if they are on a protected page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
