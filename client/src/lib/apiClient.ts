const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async signUp(email: string, password: string, display_name?: string) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async signIn(email: string, password: string) {
    const response = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async signOut() {
    this.clearToken();
    return { success: true };
  }

  // Products
  async getProducts(category?: string) {
    const query = category && category !== '' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // Messages
  async getMessages() {
    return this.request('/messages');
  }

  async getProductMessages(productId: string) {
    return this.request(`/products/${productId}/messages`);
  }

  async createMessage(message: any) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(profile: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Reviews API
  async createReview(reviewData: {
    product_id: string;
    rating: number;
    title?: string;
    comment: string;
  }): Promise<any> {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }

    return response.json();
  }

  async getProductReviews(productId: string): Promise<any[]> {
    const response = await fetch(`/api/products/${productId}/reviews`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get reviews');
    }

    return response.json();
  }

  async getProductStats(productId: string): Promise<any> {
    const response = await fetch(`/api/products/${productId}/stats`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get product stats');
    }

    return response.json();
  }

  async getProductBadges(productId: string): Promise<any[]> {
    const response = await fetch(`/api/products/${productId}/badges`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get product badges');
    }

    return response.json();
  }

  async markReviewHelpful(reviewId: string): Promise<any> {
    const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark review helpful');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// Default fetcher for react-query
export const queryFetcher = async ({ queryKey }: { queryKey: any[] }) => {
  const [url, ...params] = queryKey;
  const endpoint = params.length > 0 ? `${url}/${params.join('/')}` : url;
  return apiClient.request(endpoint.replace('/api', ''));
};

// API request helper for mutations
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  return apiClient.request(endpoint.replace('/api', ''), options);
};