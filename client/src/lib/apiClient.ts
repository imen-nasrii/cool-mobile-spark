const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
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
    // Always get fresh token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
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
      
      // If unauthorized, clear token and redirect to login
      if (response.status === 401 || response.status === 403) {
        this.clearToken();
        // The error will be caught by the calling component
        throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
      }
      
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
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
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
    // Deprecated - use conversations API instead
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
}

export const apiClient = new ApiClient();

// Default fetcher for react-query
export const queryFetcher = async ({ queryKey }: { queryKey: any[] }) => {
  const [url, ...params] = queryKey;
  const endpoint = params.length > 0 ? `${url}/${params.join('/')}` : url;
  const cleanEndpoint = endpoint.replace('/api', '');
  
  if (cleanEndpoint.includes('/products')) {
    return apiClient.getProducts();
  }
  
  return fetch(`/api${cleanEndpoint}`).then(res => res.json());
};

// API request helper for mutations - use apiClient for consistency
export const apiRequest = (endpoint: string, options: RequestInit = {}) => {
  return apiClient.request(endpoint, options);
};