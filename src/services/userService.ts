import axios from 'axios';
import { API_URL } from '../config';
import authService from './authService';

export interface PublicUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

class UserService {
  async searchUsers(query: string): Promise<PublicUser[]> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/api/users`, {
      params: { search: query },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data?.data || [];
  }

  async getUserById(id: string): Promise<PublicUser | null> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/api/users/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data?.user || null;
  }
}

export default new UserService();
