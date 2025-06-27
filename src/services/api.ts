import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base URL and headers
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token if available
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
      return Promise.reject({
        message: 'No response from server',
        status: 500,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      return Promise.reject({
        message: error.message,
        status: 500,
      });
    }
  }
);

// API methods
export const deviceApi = {
  // Get all devices
  async getAll() {
    return api.get('/devices');
  },

  // Get device by ID
  async getById(id: string) {
    return api.get(`/devices/${id}`);
  },

  // Create a new device
  async create(deviceData: any) {
    return api.post('/devices', deviceData);
  },

  // Update a device
  async update(id: string, updateData: any) {
    return api.put(`/devices/${id}`, updateData);
  },

  // Delete a device
  async delete(id: string) {
    return api.delete(`/devices/${id}`);
  },
};

export default api;
