import { api } from './api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

class AuthManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimeout: number | null = null;

  constructor() {
    this.loadTokensFromStorage();
    this.setupTokenRefresh();
  }

  async login(email: string, password: string): Promise<User> {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    const { user, token } = data;

    const tokens = {
      accessToken: token,
      refreshToken: token,
      expiresIn: 3600
    };

    this.setTokens(tokens);
    this.scheduleTokenRefresh(tokens.expiresIn);

    return user;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<User> {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    const { user, token } = data;

    const tokens = {
      accessToken: token,
      refreshToken: token,
      expiresIn: 3600
    };

    this.setTokens(tokens);
    this.scheduleTokenRefresh(tokens.expiresIn);

    return user;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        console.log('Logging out...');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.clearTokens();
  }

  async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      this.clearTokens();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    // Update API default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    delete api.defaults.headers.common['Authorization'];

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');

    if (this.accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
    }
  }

  private setupTokenRefresh(): void {
    // Set up axios interceptor for automatic token refresh
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshTokens();
          if (refreshed) {
            // Retry the original request
            return api.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    // Refresh 1 minute before expiration
    const refreshTime = (expiresIn - 60) * 1000;
    
    this.refreshTimeout = setTimeout(() => {
      this.refreshTokens();
    }, refreshTime);
  }
}

export const authManager = new AuthManager();