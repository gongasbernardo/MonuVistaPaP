import axios from 'axios';
import { API_URL } from '../config';
import authService from './authService';

export interface ChatConversation {
  _id: string;
  title?: string;
  participants: string[];
  participantIds?: string[];
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

class ChatService {
  async getConversations(): Promise<ChatConversation[]> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/api/chats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data?.data || [];
  }

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/api/chats/${chatId}/messages`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data?.data || [];
  }

  async sendMessage(chatId: string, content: string): Promise<ChatMessage> {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/api/chats/${chatId}/messages`,
      { content },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return response.data?.data;
  }

  async createChat(participantEmail: string): Promise<ChatConversation> {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/api/chats`,
      { participantEmail },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return response.data?.data;
  }
}

export default new ChatService();
