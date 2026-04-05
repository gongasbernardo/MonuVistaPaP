import { useState, useEffect } from "react";
import {
  IonButton,
  IonIcon,
  IonBadge,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonText,
} from "@ionic/react";
import { notificationsOutline } from "ionicons/icons";
import authService from "../services/authService";
import "./NotificationBell.css";

interface Notification {
  _id: string;
  type: string;
  message: string;
  groupId?: string;
  groupName?: string;
  reason?: string;
  kickedBy?: string;
  read: boolean;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  const markAsRead = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/notifications/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <IonButton fill="clear" onClick={() => setShowPopover(true)} className="notification-button">
        <IonIcon icon={notificationsOutline} />
        {unreadCount > 0 && (
          <IonBadge color="danger" className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </IonBadge>
        )}
      </IonButton>

      <IonPopover
        isOpen={showPopover}
        onDidDismiss={() => setShowPopover(false)}
        className="notification-popover"
      >
        <div className="notification-header">
          <h3>Notificações</h3>
          {unreadCount > 0 && (
            <IonButton fill="clear" size="small" onClick={markAsRead}>
              Marcar como lidas
            </IonButton>
          )}
        </div>

        <IonList className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <IonItem key={notification._id} className={notification.read ? "read" : "unread"}>
                <IonLabel>
                  <IonText color={notification.read ? "medium" : "dark"}>
                    <p className="notification-message">{notification.message}</p>
                  </IonText>
                  <p className="notification-date">{formatDate(notification.createdAt)}</p>
                  {notification.groupName && (
                    <p className="notification-group">{notification.groupName}</p>
                  )}
                </IonLabel>
              </IonItem>
            ))
          )}
        </IonList>
      </IonPopover>
    </>
  );
};

export default NotificationBell;