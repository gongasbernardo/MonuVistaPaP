import { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonButton,
  IonTextarea,
  IonInput,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { chatbubbleOutline, sendOutline, addOutline, personOutline } from 'ionicons/icons';
import chatService, { ChatConversation, ChatMessage } from '../services/chatService';
import authService from '../services/authService';
import './PrivateChats.css';

const PrivateChats = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [newChatEmail, setNewChatEmail] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const [createError, setCreateError] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const currentUser = authService.getUser();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
    }
  }, [selectedChat]);

  const loadConversations = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await chatService.getConversations();
      setConversations(data);
      if (data.length > 0) {
        setSelectedChat(data[0]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar chats');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    setLoadingMessages(true);
    setError('');

    try {
      const data = await chatService.getMessages(chatId);
      setMessages(data);
      setTimeout(() => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar mensagens');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chat: ChatConversation) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;
    try {
      const message = await chatService.sendMessage(selectedChat._id, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      setConversations((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, lastMessage: message.content, updatedAt: message.createdAt }
            : chat
        )
      );
      setTimeout(() => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao enviar mensagem');
    }
  };

  const handleCreateChat = async () => {
    if (!newChatEmail.trim()) {
      setCreateError('Introduza o email do utilizador');
      return;
    }

    setCreatingChat(true);
    setCreateError('');

    try {
      const chat = await chatService.createChat(newChatEmail.trim());
      setConversations((prev) => [chat, ...prev]);
      setSelectedChat(chat);
      setNewChatEmail('');
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Erro ao criar chat');
    } finally {
      setCreatingChat(false);
    }
  };

  const formatUpdatedAt = (value: string) => {
    const date = new Date(value);
    return date.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getChatTitle = (chat: ChatConversation) => {
    if (chat.title) return chat.title;
    const others = chat.participants.filter((name) => name !== currentUser?.name);
    return others.length > 0 ? others.join(', ') : 'Chat privado';
  };

  return (
    <IonPage>
      <IonHeader className="private-chats-header">
        <IonToolbar>
          <IonTitle>Chats Privados</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="private-chats-content" fullscreen>
        <div className="chat-page">
          <section className="chat-sidebar">
            <div className="chat-sidebar-header">
              <div>
                <h2>Conversas</h2>
                <p>Envie mensagens privadas aos seus contactos.</p>
              </div>
              <IonIcon icon={chatbubbleOutline} className="chat-sidebar-icon" />
            </div>

            <div className="chat-create-row">
              <IonInput
                value={newChatEmail}
                placeholder="Email para iniciar chat"
                onIonChange={(e) => setNewChatEmail(e.detail.value || '')}
                clearInput
              />
              <IonButton onClick={handleCreateChat} disabled={creatingChat}>
                <IonIcon icon={addOutline} />
              </IonButton>
            </div>
            {createError && <IonText color="danger">{createError}</IonText>}

            {loading && (
              <div className="chat-loading">
                <IonSpinner name="crescent" />
                <span>Carregando conversas...</span>
              </div>
            )}

            {!loading && conversations.length === 0 && (
              <div className="chat-empty">
                <IonText>Nenhuma conversa encontrada. Crie um novo chat ou peça a alguém para começar uma mensagem.</IonText>
              </div>
            )}

            <IonList>
              {conversations.map((chat) => (
                <IonItem
                  key={chat._id}
                  button
                  detail={false}
                  className={selectedChat?._id === chat._id ? 'active-chat-item' : ''}
                  onClick={() => handleSelectChat(chat)}
                >
                  <IonAvatar slot="start">
                    <IonIcon icon={personOutline} />
                  </IonAvatar>
                  <IonLabel>
                    <h3>{getChatTitle(chat)}</h3>
                    <p>{chat.lastMessage || 'Sem mensagens ainda'}</p>
                  </IonLabel>
                  <div className="chat-meta">
                    <IonText>{formatUpdatedAt(chat.updatedAt)}</IonText>
                    {chat.unreadCount > 0 && <IonBadge color="primary">{chat.unreadCount}</IonBadge>}
                  </div>
                </IonItem>
              ))}
            </IonList>
          </section>

          <section className="chat-window">
            {!selectedChat && (
              <div className="chat-window-empty">
                <IonText>Selecione uma conversa para começar a conversar.</IonText>
              </div>
            )}

            {selectedChat && (
              <>
                <div className="chat-window-header">
                  <div>
                    <h2>{getChatTitle(selectedChat)}</h2>
                    <p>{selectedChat.participants.length} participantes</p>
                  </div>
                </div>

                <div className="chat-messages" ref={messagesRef}>
                  {loadingMessages && (
                    <div className="chat-loading">
                      <IonSpinner name="crescent" />
                    </div>
                  )}

                  {!loadingMessages && messages.length === 0 && (
                    <div className="chat-window-empty">
                      <IonText>Não há mensagens nesta conversa.</IonText>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`chat-message ${message.senderId === currentUser?.id ? 'own-message' : 'other-message'}`}
                    >
                      <div className="message-author">{message.senderName}</div>
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">{new Date(message.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-row">
                  <IonTextarea
                    value={newMessage}
                    placeholder="Escreva uma mensagem..."
                    onIonChange={(e) => setNewMessage(e.detail.value || '')}
                    rows={2}
                  />
                  <IonButton onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <IonIcon icon={sendOutline} />
                  </IonButton>
                </div>
              </>
            )}

            {error && <IonText color="danger">{error}</IonText>}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PrivateChats;
