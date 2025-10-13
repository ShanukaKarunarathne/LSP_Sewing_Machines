// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginUser = (username, password) => {
  return api.post('/users/login', { username, password });
};

export const getCurrentUser = () => {
  return api.get('/users/me');
};

// Inventory endpoints
export const getInventory = () => {
  return api.post('/inventory/manage', {
    action: 'read',
    payload: {}
  });
};

export const createInventoryItem = (itemData) => {
  return api.post('/inventory/manage', {
    action: 'create',
    payload: itemData
  });
};

// Sales endpoints
export const getAllSales = () => {
  return api.get('/sales/');
};

export const createSale = (saleData) => {
  return api.post('/sales/', saleData);
};

export const getSalesByDate = (date) => {
  return api.get(`/sales/by_date/${date}`);
};

// Credit endpoints
export const getAllCredits = () => {
  return api.get('/credit/all');
};

export const recordCreditPayment = (paymentData) => {
  return api.post('/credit/', paymentData);
};

// Expenses endpoints
export const getAllExpenses = () => {
  return api.get('/expenses/');
};

export const createExpense = (expenseData) => {
  return api.post('/expenses/', expenseData);
};

export default api;