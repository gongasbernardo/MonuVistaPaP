import axios from 'axios';
import { API_URL } from '../config';

function getHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  type: string;
  joined: boolean;
  progress: number;
  completed: boolean;
  participantsCount: number;
  reward?: {
    xp: number;
    badge?: { name: string; description: string; icon: string };
  };
}

export interface SyncResult {
  activityCounts: Record<string, number>;
  completedNow: Array<{ title: string; xp: number; badge: string | null }>;
}

class ChallengeService {
  async seedChallenges(): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/challenges/seed`, {}, { headers: getHeaders() });
    } catch {
      // Ignore if already seeded
    }
  }

  async getChallenges(): Promise<Challenge[]> {
    await this.seedChallenges();
    const res = await axios.get(`${API_URL}/api/challenges`, { headers: getHeaders() });
    return res.data.data || [];
  }

  async joinChallenge(challengeId: string): Promise<void> {
    await axios.post(`${API_URL}/api/challenges/${challengeId}/join`, {}, { headers: getHeaders() });
  }

  async syncProgress(): Promise<SyncResult> {
    const res = await axios.post(`${API_URL}/api/challenges/sync-progress`, {}, { headers: getHeaders() });
    return res.data.data;
  }
}

export default new ChallengeService();
