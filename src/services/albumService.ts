// Album Service - Real API-backed album management
import axios from 'axios';
import { API_URL } from '../config';

export interface VisitInfo {
  visited: boolean;
  date?: string;
}

export interface AlbumMonument {
  _id: string;
  id: string;
  name: string;
  location: string;
  country: string;
  region: string;
  century: string;
  style: string;
  description: string;
  history: string;
  funFacts: string[];
  image: string;
  folderId: any;
  userId: string;
  visited: boolean;
  visitDate: string | null;
  visitInfo: VisitInfo;
  confidence?: number;
  createdAt: string;
  addedAt: string;
}

export interface Folder {
  _id: string;
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

function getHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

function mapMonument(m: any): AlbumMonument {
  const fid = m.folderId?._id || m.folderId;
  return {
    ...m,
    id: m._id,
    folderId: fid,
    addedAt: m.createdAt,
    confidence: m.confidence,
    visitInfo: {
      visited: m.visited,
      date: m.visitDate || undefined,
    },
  };
}

function mapFolder(f: any): Folder {
  return { ...f, id: f._id };
}

class AlbumService {
  // ========== FOLDERS ==========

  async getFolders(): Promise<Folder[]> {
    const res = await axios.get(`${API_URL}/api/album/folders`, { headers: getHeaders() });
    return (res.data.data || []).map(mapFolder);
  }

  async createFolder(name: string, color: string): Promise<Folder> {
    const res = await axios.post(`${API_URL}/api/album/folders`, { name, color }, { headers: getHeaders() });
    return mapFolder(res.data.data);
  }

  async deleteFolder(folderId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/album/folders/${folderId}`, { headers: getHeaders() });
  }

  async updateFolder(folderId: string, name: string, color: string): Promise<void> {
    await axios.put(`${API_URL}/api/album/folders/${folderId}`, { name, color }, { headers: getHeaders() });
  }

  // ========== MONUMENTS ==========

  async getMonuments(): Promise<AlbumMonument[]> {
    const res = await axios.get(`${API_URL}/api/album/monuments`, { headers: getHeaders() });
    return (res.data.data || []).map(mapMonument);
  }

  async getMonumentById(id: string): Promise<AlbumMonument | null> {
    try {
      const res = await axios.get(`${API_URL}/api/album/monuments/${id}`, { headers: getHeaders() });
      return mapMonument(res.data.data);
    } catch {
      return null;
    }
  }

  async getMonumentsByFolder(folderId: string): Promise<AlbumMonument[]> {
    const res = await axios.get(`${API_URL}/api/album/monuments`, {
      params: { folderId },
      headers: getHeaders()
    });
    return (res.data.data || []).map(mapMonument);
  }

  async getVisitedMonuments(): Promise<AlbumMonument[]> {
    const res = await axios.get(`${API_URL}/api/album/monuments`, {
      params: { visited: 'true' },
      headers: getHeaders()
    });
    return (res.data.data || []).map(mapMonument);
  }

  async getToVisitMonuments(): Promise<AlbumMonument[]> {
    const res = await axios.get(`${API_URL}/api/album/monuments`, {
      params: { visited: 'false' },
      headers: getHeaders()
    });
    return (res.data.data || []).map(mapMonument);
  }

  async addMonument(
    monument: {
      name: string; location: string; country: string; region: string;
      century: string; style: string; description: string; history: string;
      funFacts: string[]; image: string; folderId: string;
    },
    visited: boolean = false
  ): Promise<AlbumMonument> {
    const res = await axios.post(`${API_URL}/api/album/monuments`, {
      ...monument,
      visited,
    }, { headers: getHeaders() });
    return mapMonument(res.data.data);
  }

  async markAsVisited(monumentId: string): Promise<void> {
    await axios.put(`${API_URL}/api/album/monuments/${monumentId}`, { visited: true }, { headers: getHeaders() });
  }

  async markAsToVisit(monumentId: string): Promise<void> {
    await axios.put(`${API_URL}/api/album/monuments/${monumentId}`, { visited: false }, { headers: getHeaders() });
  }

  async moveToFolder(monumentId: string, folderId: string): Promise<void> {
    await axios.put(`${API_URL}/api/album/monuments/${monumentId}`, { folderId }, { headers: getHeaders() });
  }

  async deleteMonument(monumentId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/album/monuments/${monumentId}`, { headers: getHeaders() });
  }

  // ========== STATS ==========

  async getStats(): Promise<{ total: number; visited: number; toVisit: number; countries: number }> {
    const res = await axios.get(`${API_URL}/api/album/stats`, { headers: getHeaders() });
    return res.data.data;
  }

  async isInAlbum(monumentName: string): Promise<boolean> {
    try {
      const res = await axios.get(`${API_URL}/api/album/check/${encodeURIComponent(monumentName)}`, { headers: getHeaders() });
      return res.data.inAlbum;
    } catch {
      return false;
    }
  }
}

export default new AlbumService();
