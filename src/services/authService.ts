import axios from 'axios';
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/auth`;

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  language?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  language?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: User;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('AuthService: Starting login request');
      const response = await axios.post(`${API_URL}/login`, data, { timeout: 30000 });
      console.log('AuthService: Login response received:', response.data);
      
      const token = response.data.token || response.data.accessToken;
      const user: User | undefined = {
        ...(response.data.user || response.data.data?.user || {}),
        language: response.data.user?.language || response.data.data?.user?.language,
      };

      if (token) {
        localStorage.setItem('token', token);
      }

      if (user && Object.keys(user).length > 0) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      console.log('AuthService: Login successful');
      return { ...response.data, token, user };
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Starting register request to', `${API_URL}/register`);
      const response = await axios.post(`${API_URL}/register`, data, { timeout: 30000 });
      console.log('[AuthService] Register response received, status:', response.status);
      console.log('[AuthService] Response data:', response.data);
      
      const token = response.data.token || response.data.accessToken;
      const user: User = {
        ...(response.data.user || response.data.data?.user || {}),
        language: response.data.user?.language || response.data.data?.user?.language || data.language,
      };

      console.log('[AuthService] Extracted token:', !!token);
      console.log('[AuthService] Extracted user:', user);

      if (token) {
        localStorage.setItem('token', token);
        console.log('[AuthService] Token stored in localStorage');
      }

      if (user && Object.keys(user).length > 0) {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('[AuthService] User stored in localStorage');
      }

      if (data.language) {
        localStorage.setItem('language', data.language);
        console.log('[AuthService] Language stored in localStorage');
      }

      const result = { ...response.data, token, user };
      console.log('[AuthService] Register successful, returning:', result);
      return result;
    } catch (error: any) {
      console.error('[AuthService] Register error:', error);
      console.error('[AuthService] Error response:', error?.response?.data);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/reset-password`, {
      resetToken,
      newPassword
    });
    return response.data;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getLanguage(): string {
    const user = this.getUser();
    return user?.language || localStorage.getItem('language') || 'pt';
  }

  setLanguage(language: string): void {
    const user = this.getUser();
    if (user) {
      user.language = language;
      localStorage.setItem('user', JSON.stringify(user));
    }
    localStorage.setItem('language', language);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('language');
  }
}

export default new AuthService();
