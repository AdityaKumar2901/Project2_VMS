import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Public APIs
export const publicAPI = {
  getVendors: (params) => api.get('/public/vendors', { params }),
  getVendorById: (id, params) => api.get(`/public/vendors/${id}`, { params }),
  getProducts: (params) => api.get('/public/products', { params }),
  getProductById: (id, params) => api.get(`/public/products/${id}`, { params }),
  getCategories: () => api.get('/public/categories'),
};

// Customer APIs
export const customerAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/items', data),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  reviewProduct: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  reviewVendor: (vendorId, data) => api.post(`/reviews/vendor/${vendorId}`, data),
};

// Vendor APIs
export const vendorAPI = {
  getProfile: () => api.get('/vendor/me'),
  updateProfile: (data) => api.put('/vendor/me', data),
  getProducts: () => api.get('/vendor/products'),
  createProduct: (data) => api.post('/vendor/products', data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),
  getOrders: (params) => api.get('/vendor/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/vendor/orders/${id}/status`, { status }),
  getReviews: () => api.get('/vendor/reviews'),
  replyToReview: (reviewId, reply) => api.post(`/vendor/reviews/${reviewId}/reply`, { reply }),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getVendors: (params) => api.get('/admin/vendors', { params }),
  verifyVendor: (id, verified) => api.put(`/admin/vendors/${id}/verify`, { verified }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
};

export default api;
