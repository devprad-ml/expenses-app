import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor: Automatically add Token to requests
api.interceptors.request.use((config) => {
    // gets token from local storage, can scale according to users
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. API Functions
// login/ register api (POST method)
export const auth = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }, { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'} 
    }),
  register: (email: string, password: string, full_name: string) => 
    api.post('/auth/register', { email, password, full_name }),

  getMe: () => api.get('/auth/me'),
  updateMe: (data: { monthly_budget_limit?: number }) => api.put('/auth/me', data),
};
// GET(read) API to get expenses with filters
export const expenses = {
  // Get all expenses (with optional filters)
  getAll: (filters?: { month?: number; category?: string; min_price?: number; max_price?: number }) => 
    api.get('/expenses/', { params: filters }),
    
  // parse text(alphanumeric) to create the expense
  parse: (text: string) => api.post('/expenses/parse', { text }),

  // Scan a receipt image and extract expense data
  scanReceipt: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/expenses/scan-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Confirm and Save,store
  create: (data: any) => api.post('/expenses/', data),
}
// now we can use it anywhere in the code
export default api;