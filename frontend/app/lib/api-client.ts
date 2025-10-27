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
  // ============================================
  // USER MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * Get all users with optional filters
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUser(id: number) {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: number;
  }) {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(
    id: number,
    userData: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      status?: string;
    }
  ) {
    const response = await axiosInstance.patch(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(id: number) {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  // ============================================
  // INVITATION ENDPOINTS
  // ============================================

  /**
   * Accept invitation and create account
   */
  async acceptInvitation(data: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    const response = await axiosInstance.post('/auth/accept-invitation', data);
    return response.data;
  },

  /**
   * Change user password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await axiosInstance.post('/users/change-password', data);
    return response.data;
  },

  // Category endpoints
  async getCategories() {
    try {
      console.log('Fetching categories...');
      console.log('Token:', localStorage.getItem('token'));
      const response = await axiosInstance.get('/categories');
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get categories error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      throw error;
    }
  },

  async createCategory(data: {
    name: string;
    categoryType: string;
    type: string;
    description?: string;
  }) {
    const response = await axiosInstance.post('/categories', data);
    return response.data;
  },

  async updateCategory(
    id: number,
    data: {
      name?: string;
      categoryType?: string;
      type?: string;
      description?: string;
    }
  ) {
    const response = await axiosInstance.patch(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number) {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },

  // Product endpoints
  async getProducts(params?: {
    categoryId?: number;
    categoryType?: string;
    search?: string;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },

  async getProduct(id: number) {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: {
    name: string;
    categoryId: number;
    price: number;
    unit: string;
    description?: string;
    barcode?: string;
    stock?: number;
  }) {
    const response = await axiosInstance.post('/products', data);
    return response.data;
  },

  async updateProduct(
    id: number,
    data: {
      name?: string;
      categoryId?: number;
      price?: number;
      unit?: string;
      description?: string;
      barcode?: string;
      stock?: number;
    }
  ) {
    const response = await axiosInstance.patch(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number) {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },

  async updateProductStock(id: number, data: { quantity: number }) {
    const response = await axiosInstance.patch(`/products/${id}/stock`, data);
    return response.data;
  },

  async getLowStockProducts(threshold?: number) {
    const params = threshold ? { threshold } : undefined;
    const response = await axiosInstance.get('/products/low-stock', { params });
    return response.data;
  },

  async getOutOfStockProducts() {
    const response = await axiosInstance.get('/products/out-of-stock');
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

  // Add these endpoints to your existing api-client.ts

  // Clients endpoints
  async getClients(params?: {
    customerType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axiosInstance.get('/clients', { params });
    return response.data;
  },

  async getClient(id: number) {
    const response = await axiosInstance.get(`/clients/${id}`);
    return response.data;
  },

  async createClient(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    idNumber?: string;
    customerType?: 'INDIVIDUAL' | 'CORPORATE';
    hasAccount?: boolean;
    creditLimit?: number;
    employeeId?: string;
    department?: string;
  }) {
    const response = await axiosInstance.post('/clients', data);
    return response.data;
  },

  async updateClient(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address?: string;
      idNumber?: string;
      customerType?: 'INDIVIDUAL' | 'CORPORATE';
      hasAccount?: boolean;
      creditLimit?: number;
      employeeId?: string;
      department?: string;
    }
  ) {
    const response = await axiosInstance.patch(`/clients/${id}`, data);
    return response.data;
  },

  async deleteClient(id: number) {
    const response = await axiosInstance.delete(`/clients/${id}`);
    return response.data;
  },

  async getClientStatistics(id: number) {
    const response = await axiosInstance.get(`/clients/${id}/statistics`);
    return response.data;
  },

  async getClientBalance(id: number) {
    const response = await axiosInstance.get(`/clients/${id}/balance`);
    return response.data;
  },

  async searchClientsByPhoneOrEmail(query: string) {
    const response = await axiosInstance.get('/clients/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getCorporateClients(sponsorCompanyId?: number) {
    const response = await axiosInstance.get('/clients/corporate', {
      params: sponsorCompanyId ? { sponsorCompanyId } : {},
    });
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

  // Restaurant Tables endpoints
  async getRestaurantTables(params?: {
    status?: string;
    minCapacity?: number;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axiosInstance.get('/restaurant-tables', { params });
    return response.data;
  },

  async getRestaurantTable(id: number) {
    const response = await axiosInstance.get(`/restaurant-tables/${id}`);
    return response.data;
  },

  async getRestaurantTableStatistics() {
    const response = await axiosInstance.get('/restaurant-tables/statistics');
    return response.data;
  },

  async createRestaurantTable(data: {
    tableNumber: string;
    capacity: number;
    location?: string;
    description?: string;
  }) {
    const response = await axiosInstance.post('/restaurant-tables', data);
    return response.data;
  },

  async updateRestaurantTable(
    id: number,
    data: {
      tableNumber?: string;
      capacity?: number;
      location?: string;
      description?: string;
      status?: string;
    }
  ) {
    const response = await axiosInstance.patch(
      `/restaurant-tables/${id}`,
      data
    );
    return response.data;
  },

  async deleteRestaurantTable(id: number) {
    const response = await axiosInstance.delete(`/restaurant-tables/${id}`);
    return response.data;
  },

  async assignRestaurantTable(id: number, data: { orderId: number }) {
    const response = await axiosInstance.post(
      `/restaurant-tables/${id}/assign`,
      data
    );
    return response.data;
  },

  async clearRestaurantTable(id: number) {
    const response = await axiosInstance.post(`/restaurant-tables/${id}/clear`);
    return response.data;
  },

  async reserveRestaurantTable(id: number) {
    const response = await axiosInstance.post(
      `/restaurant-tables/${id}/reserve`
    );
    return response.data;
  },

  async unreserveRestaurantTable(id: number) {
    const response = await axiosInstance.post(
      `/restaurant-tables/${id}/unreserve`
    );
    return response.data;
  },

  // Restaurant Orders endpoints
  async getRestaurantOrders(params?: {
    stayId?: number;
    clientId?: number;
    status?: string;
    serviceMode?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axiosInstance.get('/restaurant-orders', { params });
    return response.data;
  },

  async getRestaurantOrder(id: number) {
    const response = await axiosInstance.get(`/restaurant-orders/${id}`);
    return response.data;
  },

  async getRestaurantOrderStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const response = await axiosInstance.get('/restaurant-orders/statistics', {
      params,
    });
    return response.data;
  },

  async createRestaurantOrder(data: {
    clientId: number;
    stayId?: number;
    serviceMode: string;
    tableNumber?: string;
    status: string;
    items: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    const response = await axiosInstance.post('/restaurant-orders', data);
    return response.data;
  },

  async updateRestaurantOrder(
    id: number,
    data: {
      status?: string;
      tableNumber?: string;
      serviceMode?: string;
    }
  ) {
    const response = await axiosInstance.patch(
      `/restaurant-orders/${id}`,
      data
    );
    return response.data;
  },

  async addRestaurantOrderItems(
    id: number,
    data: {
      items: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
      }>;
    }
  ) {
    const response = await axiosInstance.post(
      `/restaurant-orders/${id}/items`,
      data
    );
    return response.data;
  },

  async removeRestaurantOrderItem(orderId: number, itemId: number) {
    const response = await axiosInstance.delete(
      `/restaurant-orders/${orderId}/items/${itemId}`
    );
    return response.data;
  },

  async payRestaurantOrder(
    id: number,
    data: {
      amount: number;
      paymentMethod: string;
      notes?: string;
      reference?: string;
    }
  ) {
    const response = await axiosInstance.post(
      `/restaurant-orders/${id}/pay`,
      data
    );
    return response.data;
  },

  async cancelRestaurantOrder(id: number) {
    const response = await axiosInstance.post(
      `/restaurant-orders/${id}/cancel`
    );
    return response.data;
  },

  async deleteRestaurantOrder(id: number) {
    const response = await axiosInstance.delete(`/restaurant-orders/${id}`);
    return response.data;
  },
};
