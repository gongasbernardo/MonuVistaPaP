import axios from 'axios';
import { API_URL } from '../config';
import authService from './authService';

export interface PublicUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  isFriend?: boolean;
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

  async getFriends(): Promise<PublicUser[]> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/api/friends`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data?.data || [];
  }

  async addFriend(userId: string): Promise<PublicUser> {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/api/friends`,
      { userId },
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    return response.data?.data;
  }
}

export default new UserService();
