// src/services/api.js
import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== USER ENDPOINTS =====
export const userAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getCurrentUser: () => api.get('/users/me'),
  getAllUsers: () => api.get('/users'),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// ===== INVENTORY ENDPOINTS =====
export const inventoryAPI = {
  // Create new inventory item
  create: (itemData) => 
    api.post('/inventory/manage', {
      action: 'create',
      payload: itemData,
    }),
  
  // Read all inventory items
  readAll: () => 
    api.post('/inventory/manage', {
      action: 'read',
      payload: {},
    }),
  
  // Read single inventory item
  readOne: (itemId) => 
    api.post('/inventory/manage', {
      action: 'read',
      payload: { item_id: itemId },
    }),
  
  // Update inventory item (L2 only)
  update: (itemId, itemData) => 
    api.post('/inventory/manage', {
      action: 'update',
      payload: {
        item_id: itemId,
        ...itemData,
      },
    }),
  
  // Delete inventory item (L2 only)
  delete: (itemId) => 
    api.post('/inventory/manage', {
      action: 'delete',
      payload: { item_id: itemId },
    }),
};

// ===== SALES ENDPOINTS =====
export const salesAPI = {
  create: (saleData) => api.post('/sales/', saleData),
  getAll: () => api.get('/sales/'),
  getById: (saleId) => api.get(`/sales/${saleId}`),
  getByDate: (date) => api.get(`/sales/by_date/${date}`),
  update: (saleId, saleData) => api.put(`/sales/${saleId}`, saleData),
  delete: (saleId) => api.delete(`/sales/${saleId}`),
};

// ===== EXPENSES ENDPOINTS =====
export const expensesAPI = {
  create: (expenseData) => api.post('/expenses/', expenseData),
  getAll: () => api.get('/expenses/'),
  getById: (expenseId) => api.get(`/expenses/${expenseId}`),
  getByDate: (date) => api.get(`/expenses/by_date/${date}`),
  update: (expenseId, expenseData) => api.put(`/expenses/${expenseId}`, expenseData),
  delete: (expenseId) => api.delete(`/expenses/${expenseId}`),
};

// ===== CREDIT ENDPOINTS =====
export const creditAPI = {
  recordPayment: (paymentData) => api.post('/credit/', paymentData),
  getAllActive: () => api.get('/credit/all'),
  getPaymentsBySale: (saleId) => api.get(`/credit/${saleId}`),
  getCreditRecord: (saleId) => api.get(`/credit/record/${saleId}`),
  deletePayment: (paymentId) => api.delete(`/credit/payment/${paymentId}`),
};

export default api;