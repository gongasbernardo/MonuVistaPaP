import axios from 'axios';
import { API_URL } from '../config';

export interface Monument {
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  century: string;
  style: string;
}

export interface UserMonuments {
  favorites: Array<{
    name: string;
    location: string;
    addedAt: string;
  }>;
  visited: Array<{
    name: string;
    location: string;
    visitedAt: string;
  }>;
}

class MonumentService {
  async getUserMonuments(): Promise<UserMonuments> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_URL}/api/auth/monuments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get monuments');
    }
  }

  async addFavorite(monument: { name: string; location: string }): Promise<UserMonuments['favorites']> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.post(`${API_URL}/api/auth/favorites`, monument, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      return response.data.favorites;
    } else {
      throw new Error(response.data.message || 'Failed to add favorite');
    }
  }

  async removeFavorite(monumentName: string): Promise<UserMonuments['favorites']> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.delete(`${API_URL}/api/auth/favorites/${encodeURIComponent(monumentName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      return response.data.favorites;
    } else {
      throw new Error(response.data.message || 'Failed to remove favorite');
    }
  }

  async markVisited(monument: { name: string; location: string }): Promise<UserMonuments['visited']> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.post(`${API_URL}/api/auth/visited`, monument, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      return response.data.visited;
    } else {
      throw new Error(response.data.message || 'Failed to mark as visited');
    }
  }

  isFavorite(monumentName: string, favorites: UserMonuments['favorites']): boolean {
    return favorites.some(fav => fav.name === monumentName);
  }

  isVisited(monumentName: string, visited: UserMonuments['visited']): boolean {
    return visited.some(vis => vis.name === monumentName);
  }
}

const monumentService = new MonumentService();
export default monumentService;