import React, { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonLoading,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonButton,
  IonTextarea,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonNote,
  IonBadge,
  IonToggle,
} from "@ionic/react";
import {
  add,
  chatbubbles,
  people,
  imageOutline,
  closeOutline,
  lockClosed,
} from "ionicons/icons";
import axios from "axios";
import { API_URL } from "../config";
import BottomNav from "../components/BottomNav";
import "./Groups.css";

interface Group {
  _id: string;
  name: string;
  description: string;
  image: string;
  isPrivate: boolean;
  tags: string[];
  owner: any;
  members: any[];
  messages: any[];
  sharedContent: any[];
  createdAt: string;
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<string>("myGroups");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [shareImage, setShareImage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupImage, setNewGroupImage] = useState("");
  const [newGroupIsPrivate, setNewGroupIsPrivate] = useState(false);
  const [newGroupPassword, setNewGroupPassword] = useState("");
  const [newGroupTags, setNewGroupTags] = useState("");
  const [groupPasswordInput, setGroupPasswordInput] = useState("");
  const [pendingGroupId, setPendingGroupId] = useState("");
  const [userId, setUserId] = useState("");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDescription, setEditGroupDescription] = useState("");
  const [editGroupImage, setEditGroupImage] = useState("");
  const [editGroupTags, setEditGroupTags] = useState("");
  const [editGroupIsPrivate, setEditGroupIsPrivate] = useState(false);
  const [editGroupPassword, setEditGroupPassword] = useState("");
  const [kickReason, setKickReason] = useState("");
  const [memberToKick, setMemberToKick] = useState<any | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const createModalRef = useRef<HTMLIonModalElement>(null);
  const passwordModalRef = useRef<HTMLIonModalElement>(null);
  const detailModalRef = useRef<HTMLIonModalElement>(null);
  const editModalRef = useRef<HTMLIonModalElement>(null);
  const kickModalRef = useRef<HTMLIonModalElement>(null);
  const membersModalRef = useRef<HTMLIonModalElement>(null);
  const newGroupImageInputRef = useRef<HTMLInputElement>(null);
  const shareImageInputRef = useRef<HTMLInputElement>(null);
  const editGroupImageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const resolvedId = parsedUser?.id || parsedUser?._id;
          if (resolvedId) setUserId(resolvedId);
        } catch {
          // ignore invalid JSON
        }
      }
    }
    fetchGroups();
    fetchUserGroups();
    fetchNotifications();
  }, []);

  // Poll for new messages every 3 seconds when a group is selected
  useEffect(() => {
    if (!selectedGroup) return;

    const pollMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/groups/${selectedGroup._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedGroup = response.data.group;
        if (fetchedGroup && fetchedGroup.messages) {
          // Only update if there are new messages (avoid unnecessary re-renders)
          setSelectedGroup((prev) => {
            if (!prev) return prev;
            if (fetchedGroup.messages.length !== prev.messages.length) {
              return { ...prev, messages: fetchedGroup.messages, sharedContent: fetchedGroup.sharedContent };
            }
            return prev;
          });
        }
      } catch (error) {
        // Silently ignore polling errors
      }
    };

    const intervalId = setInterval(pollMessages, 3000);
    return () => clearInterval(intervalId);
  }, [selectedGroup?._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedGroup?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedGroup?.messages?.length]);

  const openCreateModal = () => {
    createModalRef.current?.present();
  };

  const closeCreateModal = () => {
    createModalRef.current?.dismiss();
  };

  const openPasswordModal = () => {
    passwordModalRef.current?.present();
  };

  const closePasswordModal = () => {
    passwordModalRef.current?.dismiss();
  };

  const openDetailModal = () => {
    detailModalRef.current?.present();
  };

  const closeDetailModal = () => {
    detailModalRef.current?.dismiss();
    setIsEditingGroup(false);
    setEditGroupPassword("");
    editModalRef.current?.dismiss();
  };

  const openMembersModal = () => {
    setShowMembersModal(true);
    membersModalRef.current?.present();
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    membersModalRef.current?.dismiss();
  };

  const handleNewGroupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewGroupImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleShareImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setShareImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditGroupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditGroupImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/groups`);
      setGroups(response.data.groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/groups/my/groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserGroups(response.data.groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${API_URL}/api/auth/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const unread = (response.data.notifications || []).filter(
        (n: any) => !n.read && n.type === "kicked"
      );

      if (unread.length > 0) {
        setNotificationMessage(unread[0].message);
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.post(
        `${API_URL}/api/auth/notifications/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error marking notifications read:", error);
    }
  };

  const openKickModal = (member: any) => {
    setMemberToKick(member);
    setKickReason("");
    kickModalRef.current?.present();
  };

  const handleKickMember = async () => {
    if (!selectedGroup || !memberToKick) return;
    if (!kickReason.trim()) {
      alert("Por favor, indique o motivo da expulsÃ£o");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Erro: Token nÃ£o encontrado. FaÃ§a login novamente.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/groups/${selectedGroup._id}/kick`,
        { memberId: memberToKick._id, reason: kickReason.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedGroup = response.data.group;
      setSelectedGroup(updatedGroup);
      setUserGroups(userGroups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)));
      setGroups(groups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)));
      kickModalRef.current?.dismiss();
    } catch (error: any) {
      console.error("Error kicking member:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Erro ao expulsar membro";
      alert("Erro: " + errorMessage);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Por favor, digite o nome do grupo");
      return;
    }

    if (newGroupIsPrivate && !newGroupPassword.trim()) {
      alert("Por favor, digite uma palavra-passe para o grupo privado");
      return;
    }

    if (newGroupIsPrivate && newGroupPassword.length < 4) {
      alert("A palavra-passe deve ter pelo menos 4 caracteres");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Erro: Token nÃ£o encontrado. FaÃ§a login novamente.");
        return;
      }

      const tags = newGroupTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await axios.post(
        `${API_URL}/api/groups`,
        {
          name: newGroupName,
          description: newGroupDescription,
          image: newGroupImage,
          isPrivate: newGroupIsPrivate,
          password: newGroupIsPrivate ? newGroupPassword : null,
          tags: tags,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserGroups([response.data.group, ...userGroups]);
      setGroups([response.data.group, ...groups]);
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupImage("");
      setNewGroupIsPrivate(false);
      setNewGroupPassword("");
      setNewGroupTags("");
      closeCreateModal();
      alert("Grupo criado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar grupo:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Erro ao criar grupo";
      alert("Erro: " + errorMessage);
    }
  };

  const handleJoinGroup = async (groupId: string, isPrivate: boolean = false) => {
    if (isPrivate) {
      setPendingGroupId(groupId);
      openPasswordModal();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/groups/${groupId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserGroups([response.data.group, ...userGroups]);
      fetchGroups();
      alert("Entrou no grupo com sucesso!");
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Erro ao entrar no grupo");
    }
  };

  const handleJoinPrivateGroup = async () => {
    if (!groupPasswordInput.trim()) {
      alert("Por favor, digite a palavra-passe do grupo");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/groups/${pendingGroupId}/join`,
        { password: groupPasswordInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserGroups([response.data.group, ...userGroups]);
      fetchGroups();
      setGroupPasswordInput("");
      closePasswordModal();
      setPendingGroupId("");
      alert("Entrou no grupo com sucesso!");
    } catch (error: any) {
      console.error("Error joining group:", error);
      alert(
        error.response?.data?.message || "Erro ao entrar. Verifique a palavra-passe."
      );
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/groups/${groupId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserGroups(userGroups.filter((g) => g._id !== groupId));
      fetchGroups();
      closeDetailModal();
      alert("Saiu do grupo com sucesso!");
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Erro ao sair do grupo");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedGroup) {
      alert("Por favor, escreva uma mensagem");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/groups/${selectedGroup._id}/messages`,
        { content: message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedGroup = { ...response.data.group };
      setSelectedGroup(updatedGroup);
      setUserGroups((prev) =>
        prev.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        )
      );
      setGroups((prev) =>
        prev.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        )
      );
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erro ao enviar mensagem");
    }
  };

  const handleShareContent = async () => {
    if (!shareTitle.trim() || !selectedGroup) {
      alert("Por favor, digite um tÃ­tulo");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/groups/${selectedGroup._id}/share`,
        {
          title: shareTitle,
          description: shareDescription,
          image: shareImage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedGroup = { ...response.data.group };
      setSelectedGroup(updatedGroup);
      setUserGroups((prev) =>
        prev.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        )
      );
      setGroups((prev) =>
        prev.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        )
      );
      setShareTitle("");
      setShareDescription("");
      setShareImage("");
      alert("ConteÃºdo partilhado com sucesso!");
    } catch (error) {
      console.error("Error sharing content:", error);
      alert("Erro ao partilhar conteÃºdo");
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;
    if (!editGroupName.trim()) {
      alert("Por favor, digite o nome do grupo");
      return;
    }

    if (editGroupIsPrivate && !selectedGroup.isPrivate && !editGroupPassword.trim()) {
      alert("Defina uma palavra-passe para tornar o grupo privado");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Erro: Token nÃ£o encontrado. FaÃ§a login novamente.");
        return;
      }

      const tags = editGroupTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload: any = {
        name: editGroupName,
        description: editGroupDescription,
        image: editGroupImage,
        tags,
        isPrivate: editGroupIsPrivate,
      };

      if (editGroupPassword.trim()) {
        payload.password = editGroupPassword.trim();
      }

      const response = await axios.put(
        `${API_URL}/api/groups/${selectedGroup._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedGroup = response.data.group;
      setSelectedGroup(updatedGroup);
      setUserGroups(userGroups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)));
      setGroups(groups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)));
      setIsEditingGroup(false);
      setEditGroupPassword("");
      alert("Grupo atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating group:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Erro ao atualizar grupo";
      alert("Erro: " + errorMessage);
    }
  };

  const openGroupDetail = (group: Group) => {
    setSelectedGroup(group);
    setEditGroupName(group.name || "");
    setEditGroupDescription(group.description || "");
    setEditGroupImage(group.image || "");
    setEditGroupTags((group.tags || []).join(", "));
    setEditGroupIsPrivate(Boolean(group.isPrivate));
    setEditGroupPassword("");
    setIsEditingGroup(false);
    openDetailModal();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Grupos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="A carregar grupos..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Grupos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {showNotification && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
            }}
            onClick={() => {
              setShowNotification(false);
              markNotificationsRead();
            }}
          >
            <div
              style={{
                background: 'var(--ion-background-color, #fff)',
                borderRadius: 12,
                padding: 24,
                maxWidth: 340,
                width: '90%',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Aviso</h3>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ion-text-color, #333)' }}>
                {notificationMessage}
              </p>
              <IonButton
                expand="block"
                onClick={() => {
                  setShowNotification(false);
                  markNotificationsRead();
                }}
              >
                OK
              </IonButton>
            </div>
          </div>
        )}
        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(e.detail.value as string)}
          className="groups-segment"
        >
          <IonSegmentButton value="myGroups">
            <IonLabel>Meus Grupos</IonLabel>
            <IonBadge color="primary">{userGroups.length}</IonBadge>
          </IonSegmentButton>
          <IonSegmentButton value="discover">
            <IonLabel>Descobrir</IonLabel>
            <IonBadge color="secondary">{groups.length}</IonBadge>
          </IonSegmentButton>
        </IonSegment>

        {segment === "myGroups" ? (
          <div className="groups-container">
            {userGroups.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={people} size="large" />
                <p>VocÃª nÃ£o tem grupos ainda</p>
                <p className="subtitle">
                  Crie um novo grupo ou descubra grupos existentes
                </p>
              </div>
            ) : (
              userGroups.map((group) => (
                <IonCard
                  key={group._id}
                  className="group-card"
                  button
                  onClick={() => openGroupDetail(group)}
                >
                  <IonCardHeader>
                    <div className="group-header">
                      {group.image && (
                        <img
                          src={group.image}
                          alt={group.name}
                          className="group-image"
                        />
                      )}
                      <div className="group-info">
                        <IonTitle size="large">{group.name}</IonTitle>
                        <IonNote>{group.description}</IonNote>
                        <div className="group-stats">
                          <span>
                            <IonIcon icon={people} />
                            {group.members.length} membros
                          </span>
                          <span>
                            <IonIcon icon={chatbubbles} />
                            {group.messages.length} mensagens
                          </span>
                        </div>
                      </div>
                    </div>
                  </IonCardHeader>
                </IonCard>
              ))
            )}
          </div>
        ) : (
          <div className="groups-container">
            {groups.filter((g) => !userGroups.find((ug) => ug._id === g._id))
              .length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={people} size="large" />
                <p>Nenhum grupo disponÃ­vel</p>
              </div>
            ) : (
              groups
                .filter((g) => !userGroups.find((ug) => ug._id === g._id))
                .map((group) => (
                  <IonCard key={group._id} className="group-card">
                    <IonCardHeader>
                      <div className="group-header">
                        {group.image && (
                          <img
                            src={group.image}
                            alt={group.name}
                            className="group-image"
                          />
                        )}
                        <div className="group-info">
                          <IonTitle size="large">{group.name}</IonTitle>
                          <IonNote>{group.description}</IonNote>
                          <div className="group-stats">
                            <span>
                              <IonIcon icon={people} />
                              {group.members.length} membros
                            </span>
                            <span>
                              <IonIcon icon={chatbubbles} />
                              {group.messages.length} mensagens
                            </span>
                          </div>
                        </div>
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="group-meta">
                        {group.isPrivate && (
                          <span className="private-badge">
                            <IonIcon icon={lockClosed} /> Privado
                          </span>
                        )}
                      </div>
                      {group.tags && group.tags.length > 0 && (
                        <div className="tags">
                          {group.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <IonButton
                        expand="block"
                        onClick={() => handleJoinGroup(group._id, group.isPrivate)}
                      >
                        Juntar-se
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                ))
            )}
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={openCreateModal}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Create Group Modal */}
        <IonModal
          ref={createModalRef}
          onDidDismiss={() => {
            setNewGroupName("");
            setNewGroupDescription("");
            setNewGroupImage("");
            setNewGroupIsPrivate(false);
            setNewGroupPassword("");
            setNewGroupTags("");
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Criar Grupo</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeCreateModal}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Nome do Grupo *</IonLabel>
                <IonInput
                  placeholder="Digite o nome do grupo"
                  value={newGroupName}
                  onIonChange={(e) => setNewGroupName(e.detail.value || "")}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">DescriÃ§Ã£o</IonLabel>
                <IonTextarea
                  placeholder="Digite a descriÃ§Ã£o do grupo"
                  value={newGroupDescription}
                  onIonChange={(e) => setNewGroupDescription(e.detail.value || "")}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Tags</IonLabel>
                <IonInput
                  placeholder="Digite tags separadas por vÃ­rgula (ex: viagem, turismo)"
                  value={newGroupTags}
                  onIonChange={(e) => setNewGroupTags(e.detail.value || "")}
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Imagem do Grupo</IonLabel>
                <IonButton
                  expand="block"
                  fill="outline"
                  className="image-picker-button"
                  onClick={() => newGroupImageInputRef.current?.click()}
                >
                  <IonIcon icon={imageOutline} slot="start" />
                  Escolher imagem
                </IonButton>
                {newGroupImage && (
                  <img
                    src={newGroupImage}
                    alt="PrÃ©-visualizaÃ§Ã£o"
                    className="image-preview"
                  />
                )}
                <input
                  ref={newGroupImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewGroupImageChange}
                  style={{ display: "none" }}
                />
              </IonItem>
              <IonItem>
                <IonLabel>Grupo Privado</IonLabel>
                <IonToggle
                  slot="end"
                  checked={newGroupIsPrivate}
                  onIonChange={(e) => {
                    setNewGroupIsPrivate(e.detail.checked);
                    if (!e.detail.checked) setNewGroupPassword("");
                  }}
                />
              </IonItem>
              {newGroupIsPrivate && (
                <IonItem>
                  <IonLabel position="stacked">Palavra-passe *</IonLabel>
                  <IonInput
                    type="password"
                    placeholder="Digite a palavra-passe (mÃ­n. 4 caracteres)"
                    value={newGroupPassword}
                    onIonChange={(e) => setNewGroupPassword(e.detail.value || "")}
                  />
                </IonItem>
              )}
              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={handleCreateGroup}
              >
                Criar Grupo
              </IonButton>
            </IonList>
          </IonContent>
        </IonModal>

        {/* Password Modal for Private Groups */}
        <IonModal ref={passwordModalRef}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Entrar em Grupo Privado</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closePasswordModal}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Palavra-passe do Grupo</IonLabel>
                <IonInput
                  type="password"
                  placeholder="Digite a palavra-passe"
                  value={groupPasswordInput}
                  onIonChange={(e) => setGroupPasswordInput(e.detail.value || "")}
                />
              </IonItem>
              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={handleJoinPrivateGroup}
              >
                Entrar
              </IonButton>
            </IonList>
          </IonContent>
        </IonModal>

        {/* Group Detail Modal */}
        <IonModal ref={detailModalRef} keepContentsMounted={true}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedGroup?.name}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeDetailModal}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedGroup && (
              <div className="group-detail">
                {(() => {
                  const ownerId =
                    typeof selectedGroup.owner === "string"
                      ? selectedGroup.owner
                      : selectedGroup.owner?._id;
                  return (
                    <>
                {selectedGroup.image && (
                  <img
                    src={selectedGroup.image}
                    alt={selectedGroup.name}
                    className="group-detail-image"
                  />
                )}
                <div className="group-detail-info">
                  <h2>{selectedGroup.name}</h2>
                  <p>{selectedGroup.description}</p>
                  <div className="detail-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {selectedGroup.members.length}
                      </span>
                      <span className="stat-label">Membros</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {selectedGroup.messages.length}
                      </span>
                      <span className="stat-label">Mensagens</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {selectedGroup.sharedContent.length}
                      </span>
                      <span className="stat-label">ConteÃºdo</span>
                    </div>
                  </div>

                  {userId === ownerId && (
                    <IonButton
                      expand="block"
                      fill="outline"
                      className="ion-margin-top"
                      onClick={() => {
                        setIsEditingGroup(true);
                        editModalRef.current?.present();
                      }}
                    >
                      Editar grupo
                    </IonButton>
                  )}

                  {userId !== ownerId && (
                    <IonButton
                      expand="block"
                      color="danger"
                      className="ion-margin-top"
                      onClick={() => handleLeaveGroup(selectedGroup._id)}
                    >
                      Sair do Grupo
                    </IonButton>
                  )}
                </div>

                {userId === ownerId && isEditingGroup && null}

                {userId === ownerId && isEditingGroup && null}
                    </>
                  );
                })()}

                {/* Messages Section */}
                <div className="section">
                  <h3>Mensagens ({selectedGroup.messages.length})</h3>
                  <div className="messages-list">
                    {selectedGroup.messages.length === 0 ? (
                      <p className="empty-text">Nenhuma mensagem ainda</p>
                    ) : (
                      selectedGroup.messages.map((msg: any, idx: number) => (
                        <div key={idx} className="message-item">
                          <div className="message-header">
                            <strong>{msg.username}</strong>
                            <small>
                              {new Date(msg.timestamp).toLocaleDateString(
                                "pt-PT"
                              )}
                            </small>
                          </div>
                          <p>{msg.content}</p>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="message-input">
                    <IonInput
                      placeholder="Escreva uma mensagem..."
                      value={message}
                      onIonChange={(e) => setMessage(e.detail.value || "")}
                    />
                    <IonButton onClick={handleSendMessage} color="primary">
                      Enviar
                    </IonButton>
                  </div>
                </div>

                {/* Shared Content Section */}
                <div className="section">
                  <h3>ConteÃºdo Partilhado ({selectedGroup.sharedContent.length})</h3>
                  <div className="shared-content-list">
                    {selectedGroup.sharedContent.length === 0 ? (
                      <p className="empty-text">Nenhum conteÃºdo partilhado</p>
                    ) : (
                      selectedGroup.sharedContent.map(
                        (content: any, idx: number) => (
                          <IonCard key={idx} className="shared-item">
                            {content.image && (
                              <img
                                src={content.image}
                                alt={content.title}
                              />
                            )}
                            <IonCardHeader>
                              <IonTitle size="small">{content.title}</IonTitle>
                              <IonNote>{content.username}</IonNote>
                            </IonCardHeader>
                            <IonCardContent>
                              <p>{content.description}</p>
                              <small>
                                {new Date(content.timestamp).toLocaleDateString(
                                  "pt-PT"
                                )}
                              </small>
                            </IonCardContent>
                          </IonCard>
                        )
                      )
                    )}
                  </div>

                  <div className="share-form">
                    <h4>Partilhar ConteÃºdo</h4>
                    <IonInput
                      placeholder="TÃ­tulo"
                      value={shareTitle}
                      onIonChange={(e) => setShareTitle(e.detail.value || "")}
                    />
                    <IonTextarea
                      placeholder="DescriÃ§Ã£o"
                      value={shareDescription}
                      onIonChange={(e) =>
                        setShareDescription(e.detail.value || "")
                      }
                    />
                    <IonButton
                      expand="block"
                      fill="outline"
                      className="image-picker-button"
                      onClick={() => shareImageInputRef.current?.click()}
                    >
                      <IonIcon icon={imageOutline} slot="start" />
                      Escolher imagem
                    </IonButton>
                    {shareImage && (
                      <img
                        src={shareImage}
                        alt="PrÃ©-visualizaÃ§Ã£o"
                        className="image-preview"
                      />
                    )}
                    <input
                      ref={shareImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleShareImageChange}
                      style={{ display: "none" }}
                    />
                    <IonButton expand="block" onClick={handleShareContent}>
                      <IonIcon icon={imageOutline} slot="start" />
                      Partilhar
                    </IonButton>
                  </div>
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Edit Group Modal */}
        <IonModal
          ref={editModalRef}
          onDidDismiss={() => {
            setIsEditingGroup(false);
            setEditGroupPassword("");
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Grupo</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    editModalRef.current?.dismiss();
                    setIsEditingGroup(false);
                    setEditGroupPassword("");
                  }}
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Nome do Grupo *</IonLabel>
                <IonInput
                  value={editGroupName}
                  onIonChange={(e) => setEditGroupName(e.detail.value || "")}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">DescriÃ§Ã£o</IonLabel>
                <IonTextarea
                  value={editGroupDescription}
                  onIonChange={(e) => setEditGroupDescription(e.detail.value || "")}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Tags</IonLabel>
                <IonInput
                  placeholder="Digite tags separadas por vÃ­rgula"
                  value={editGroupTags}
                  onIonChange={(e) => setEditGroupTags(e.detail.value || "")}
                />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Imagem do Grupo</IonLabel>
                <IonButton
                  expand="block"
                  fill="outline"
                  className="image-picker-button"
                  onClick={() => editGroupImageInputRef.current?.click()}
                >
                  <IonIcon icon={imageOutline} slot="start" />
                  Escolher imagem
                </IonButton>
                {editGroupImage && (
                  <img
                    src={editGroupImage}
                    alt="PrÃ©-visualizaÃ§Ã£o"
                    className="image-preview"
                  />
                )}
                <input
                  ref={editGroupImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditGroupImageChange}
                  style={{ display: "none" }}
                />
              </IonItem>
              <IonItem>
                <IonLabel>Grupo Privado</IonLabel>
                <IonToggle
                  slot="end"
                  checked={editGroupIsPrivate}
                  onIonChange={(e) => {
                    setEditGroupIsPrivate(e.detail.checked);
                    if (!e.detail.checked) setEditGroupPassword("");
                  }}
                />
              </IonItem>
              {editGroupIsPrivate && (
                <IonItem>
                  <IonLabel position="stacked">Nova Palavra-passe</IonLabel>
                  <IonInput
                    type="password"
                    placeholder="Deixe vazio para manter"
                    value={editGroupPassword}
                    onIonChange={(e) => setEditGroupPassword(e.detail.value || "")}
                  />
                </IonItem>
              )}
              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={openMembersModal}
              >
                Gerir Membros
              </IonButton>
              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={handleUpdateGroup}
              >
                Guardar alteraÃ§Ãµes
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                color="medium"
                onClick={() => {
                  editModalRef.current?.dismiss();
                  setIsEditingGroup(false);
                  setEditGroupPassword("");
                }}
              >
                Cancelar
              </IonButton>
            </IonList>
          </IonContent>
        </IonModal>

        {/* Manage Members Modal */}
        <IonModal
          ref={membersModalRef}
          onDidDismiss={() => setShowMembersModal(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Gerir Membros</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeMembersModal}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedGroup && (
              <IonList>
                {selectedGroup.members.map((member: any) => {
                  const memberOwnerId =
                    typeof selectedGroup.owner === "string"
                      ? selectedGroup.owner
                      : selectedGroup.owner?._id;
                  return (
                    <IonItem key={member._id || member.id || member}>
                      <IonLabel>
                        <h2>{member.name || "Utilizador"}</h2>
                        <p>{member.email || ""}</p>
                      </IonLabel>
                      {String(member._id || member.id || member) !== String(memberOwnerId) && (
                        <IonButton
                          color="danger"
                          onClick={() => {
                            openKickModal(member);
                            closeMembersModal();
                          }}
                        >
                          Expulsar
                        </IonButton>
                      )}
                    </IonItem>
                  );
                })}
              </IonList>
            )}
          </IonContent>
        </IonModal>

        {/* Kick Member Modal */}
        <IonModal ref={kickModalRef}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Expulsar Membro</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    kickModalRef.current?.dismiss();
                    setMemberToKick(null);
                    setKickReason("");
                  }}
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {memberToKick && (
              <IonList>
                <div style={{ padding: "1rem" }}>
                  <p>
                    <strong>Membro: {memberToKick.name || "Utilizador"}</strong>
                  </p>
                  <p>{memberToKick.email || ""}</p>
                  <p style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
                    <strong>Indique o motivo da expulsÃ£o:</strong>
                  </p>
                </div>
                <IonItem>
                  <IonLabel position="stacked">Motivo *</IonLabel>
                  <IonTextarea
                    placeholder="Ex: Comportamento inadequado, spam, etc..."
                    value={kickReason}
                    onIonChange={(e) => setKickReason(e.detail.value || "")}
                  />
                </IonItem>
                <div style={{ padding: "1rem" }}>
                  <IonButton
                    expand="block"
                    color="danger"
                    onClick={handleKickMember}
                  >
                    Expulsar
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={() => {
                      kickModalRef.current?.dismiss();
                      setMemberToKick(null);
                      setKickReason("");
                      openMembersModal();
                    }}
                  >
                    Cancelar
                  </IonButton>
                </div>
              </IonList>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
      <BottomNav />
    </IonPage>
  );
};

export default Groups;
