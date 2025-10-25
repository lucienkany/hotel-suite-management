// frontend/app/lib/api-client.ts
import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// List of endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/signup-company',
  '/auth/register',
  '/auth/accept-invitation',
];

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if this is a public endpoint
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    // Only add token for protected endpoints
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log('API Request:', {
      method: config.method,
      url: config.url,
      isPublic: isPublicEndpoint,
      hasAuth: !!config.headers.Authorization,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and handling auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
        error.config?.url?.includes(endpoint)
      );

      // Only redirect if it's not a public endpoint (to avoid redirect loops)
      if (!isPublicEndpoint) {
        console.log('Unauthorized - clearing token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Only redirect if we're in the browser and not already on login/signup pages
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/signup')
        ) {
          window.location.href = '/login?error=session_expired';
        }
      }
    }

    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth endpoints
  async signupCompany(data: {
    companyName: string;
    adminEmail: string;
    adminPassword: string;
    domain?: string;
    companyAddress?: string;
    adminFirstName?: string;
    adminLastName?: string;
  }) {
    try {
      const response = await axiosInstance.post('/auth/signup-company', data);
      return response.data;
    } catch (error) {
      console.error('Signup company API error:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await axiosInstance.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      // Clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  async getProfile() {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  // Room endpoints
  async getRooms() {
    const response = await axiosInstance.get('/rooms');
    return response.data;
  },

  async createRoom(data: any) {
    const response = await axiosInstance.post('/rooms', data);
    return response.data;
  },

  async updateRoom(id: number, data: any) {
    const response = await axiosInstance.put(`/rooms/${id}`, data);
    return response.data;
  },

  async deleteRoom(id: number) {
    const response = await axiosInstance.delete(`/rooms/${id}`);
    return response.data;
  },

  // Client endpoints
  async getClients() {
    const response = await axiosInstance.get('/clients');
    return response.data;
  },

  async createClient(data: any) {
    const response = await axiosInstance.post('/clients', data);
    return response.data;
  },

  async updateClient(id: number, data: any) {
    const response = await axiosInstance.put(`/clients/${id}`, data);
    return response.data;
  },

  async deleteClient(id: number) {
    const response = await axiosInstance.delete(`/clients/${id}`);
    return response.data;
  },

  // Stay endpoints
  async getStays() {
    const response = await axiosInstance.get('/stays');
    return response.data;
  },

  async createStay(data: any) {
    const response = await axiosInstance.post('/stays', data);
    return response.data;
  },

  async updateStay(id: number, data: any) {
    const response = await axiosInstance.put(`/stays/${id}`, data);
    return response.data;
  },

  async deleteStay(id: number) {
    const response = await axiosInstance.delete(`/stays/${id}`);
    return response.data;
  },
};
