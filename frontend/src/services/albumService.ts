// Album Service - Gestão de monumentos visitados e por visitar

export interface VisitInfo {
  visited: boolean;
  date?: string; // ISO string
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
}

export interface AlbumMonument {
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
  image: string; // base64 da foto tirada pelo usuário
  folderId: string; // ID da pasta onde está organizado
  visitInfo: VisitInfo;
  addedAt: string; // ISO string
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const STORAGE_KEY = 'monuvista_album';
const FOLDERS_KEY = 'monuvista_folders';

class AlbumService {
  // ========== FOLDERS ==========
  
  getFolders(): Folder[] {
    const stored = localStorage.getItem(FOLDERS_KEY);
    if (!stored) {
      // Criar pastas padrão
      const defaultFolders: Folder[] = [
        {
          id: 'default',
          name: 'Sem Categoria',
          color: '#6B7280',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'medieval',
          name: 'Medieval',
          color: '#8B5CF6',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'renaissance',
          name: 'Renascença',
          color: '#F59E0B',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'baroque',
          name: 'Barroco',
          color: '#EC4899',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(defaultFolders));
      return defaultFolders;
    }
    return JSON.parse(stored);
  }

  createFolder(name: string, color: string): Folder {
    const folders = this.getFolders();
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    return newFolder;
  }

  deleteFolder(folderId: string): void {
    if (folderId === 'default') {
      throw new Error('Não pode eliminar a pasta padrão');
    }
    
    const folders = this.getFolders().filter(f => f.id !== folderId);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    
    // Mover monumentos para pasta padrão
    const monuments = this.getMonuments();
    monuments.forEach(m => {
      if (m.folderId === folderId) {
        m.folderId = 'default';
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(monuments));
  }

  updateFolder(folderId: string, name: string, color: string): void {
    const folders = this.getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      folder.name = name;
      folder.color = color;
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    }
  }

  // ========== MONUMENTS ==========

  getMonuments(): AlbumMonument[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getMonumentById(id: string): AlbumMonument | null {
    const monuments = this.getMonuments();
    return monuments.find(m => m.id === id) || null;
  }

  getMonumentsByFolder(folderId: string): AlbumMonument[] {
    return this.getMonuments().filter(m => m.folderId === folderId);
  }

  getVisitedMonuments(): AlbumMonument[] {
    return this.getMonuments().filter(m => m.visitInfo.visited);
  }

  getToVisitMonuments(): AlbumMonument[] {
    return this.getMonuments().filter(m => !m.visitInfo.visited);
  }

  addMonument(
    monument: Omit<AlbumMonument, 'id' | 'addedAt' | 'visitInfo'>,
    visited: boolean = false
  ): AlbumMonument {
    const monuments = this.getMonuments();
    
    const visitInfo: VisitInfo = {
      visited,
    };

    if (visited) {
      const now = new Date();
      visitInfo.date = now.toISOString();
      visitInfo.year = now.getFullYear();
      visitInfo.month = now.getMonth() + 1;
      visitInfo.day = now.getDate();
      visitInfo.hour = now.getHours();
      visitInfo.minute = now.getMinutes();
    }

    const newMonument: AlbumMonument = {
      ...monument,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
      visitInfo,
    };

    monuments.push(newMonument);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(monuments));
    return newMonument;
  }

  markAsVisited(monumentId: string): void {
    const monuments = this.getMonuments();
    const monument = monuments.find(m => m.id === monumentId);
    
    if (monument) {
      const now = new Date();
      monument.visitInfo = {
        visited: true,
        date: now.toISOString(),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monuments));
    }
  }

  markAsToVisit(monumentId: string): void {
    const monuments = this.getMonuments();
    const monument = monuments.find(m => m.id === monumentId);
    
    if (monument) {
      monument.visitInfo = {
        visited: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monuments));
    }
  }

  moveToFolder(monumentId: string, folderId: string): void {
    const monuments = this.getMonuments();
    const monument = monuments.find(m => m.id === monumentId);
    
    if (monument) {
      monument.folderId = folderId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monuments));
    }
  }

  deleteMonument(monumentId: string): void {
    const monuments = this.getMonuments().filter(m => m.id !== monumentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(monuments));
  }

  // ========== STATS ==========

  getStats() {
    const monuments = this.getMonuments();
    const visited = monuments.filter(m => m.visitInfo.visited);
    const toVisit = monuments.filter(m => !m.visitInfo.visited);
    const countries = new Set(monuments.map(m => m.country));
    
    return {
      total: monuments.length,
      visited: visited.length,
      toVisit: toVisit.length,
      countries: countries.size,
    };
  }

  // Verifica se monumento já está no álbum
  isInAlbum(monumentName: string): boolean {
    const monuments = this.getMonuments();
    return monuments.some(m => m.name === monumentName);
  }
}

export default new AlbumService();
