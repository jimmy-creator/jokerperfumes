import axios from 'axios';
import { getRegionCode } from '../utils/region';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Tell the server which region the shopper is in, so it returns region-priced
// products and region-appropriate payment gateways.
api.interceptors.request.use((config) => {
  config.headers['X-Region'] = getRegionCode();
  return config;
});

// No Bearer token — authentication is via httpOnly cookie only
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if user was logged in and session expired
    // Don't redirect for initial profile checks or public pages
    if (error.response?.status === 401 && error.config?.url !== '/auth/profile') {
      const hadUser = localStorage.getItem('user');
      if (hadUser) {
        localStorage.removeItem('user');
        if (!['/login', '/register', '/forgot-password', '/', '/products'].includes(window.location.pathname) &&
            !window.location.pathname.startsWith('/product/')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
