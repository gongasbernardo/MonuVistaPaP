import { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonModal,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
} from "@ionic/react";
import {
  mailOutline,
  starOutline,
  albumsOutline,
  peopleOutline,
  compassOutline,
  logOutOutline,
  ribbonOutline,
  flashOutline,
  trendingUpOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  personOutline,
  lockClosedOutline,
  imageOutline,
  closeOutline,
  checkmarkOutline,
  chevronForwardOutline,
  cameraOutline,
  trashOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService";
import { API_URL } from "../config";
import BottomNav from "../components/BottomNav";
import "./Profile.css";

interface Badge {
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface UserStats {
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number | null;
  discoveries: number;
  badges: Badge[];
  badgesCount: number;
  postsCount: number;
  groupsCount: number;
}

const AVATAR_OPTIONS = [
  "🏛️", "🏰", "⛪", "🗿", "🎭", "🌍", "📸", "🗺️",
  "🏔️", "🌊", "🌅", "🎨", "🦁", "🐉", "🌺", "⭐",
  "🔥", "💎", "🎯", "🚀", "🎵", "📚", "🧭", "🏆",
];

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "settings" | "privacy">("stats");
  const [settingsSection, setSettingsSection] = useState<"avatar" | "name" | "email" | "password" | null>(null);

  // Form fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");
  const [showToast, setShowToast] = useState(false);

  const settingsModalRef = useRef<HTMLIonModalElement>(null);
  const history = useHistory();

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    setNewName(userData?.name || "");
    setNewEmail(userData?.email || "");
    setSelectedAvatar(userData?.avatar || "");
    setCustomPhoto(userData?.avatar?.startsWith("data:") ? userData.avatar : null);
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUserStats(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    history.push("/login");
  };

  const showMessage = (msg: string, color: "success" | "danger") => {
    setToastMsg(msg);
    setToastColor(color);
    setShowToast(true);
  };

  const closeModal = () => {
    settingsModalRef.current?.dismiss();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showMessage("A imagem deve ter no máximo 2MB", "danger");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomPhoto(base64);
      setSelectedAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeCustomPhoto = () => {
    setCustomPhoto(null);
    setSelectedAvatar("");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = authService.getToken();
      const payload: any = {};

      if (settingsSection === "avatar") {
        payload.avatar = selectedAvatar;
      } else if (settingsSection === "name") {
        if (!newName.trim()) { showMessage("O nome não pode estar vazio", "danger"); setSaving(false); return; }
        payload.name = newName.trim();
      } else if (settingsSection === "email") {
        if (!newEmail.trim()) { showMessage("O email não pode estar vazio", "danger"); setSaving(false); return; }
        payload.email = newEmail.trim();
      } else if (settingsSection === "password") {
        if (!currentPassword) { showMessage("Introduz a palavra-passe atual", "danger"); setSaving(false); return; }
        if (newPassword.length < 6) { showMessage("A palavra-passe deve ter pelo menos 6 caracteres", "danger"); setSaving(false); return; }
        if (newPassword !== confirmPassword) { showMessage("As palavras-passe não coincidem", "danger"); setSaving(false); return; }
        payload.currentPassword = currentPassword;
        payload.password = newPassword;
      }

      const response = await axios.put(`${API_URL}/api/auth/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setNewName(updatedUser.name);
        setNewEmail(updatedUser.email);
        setSelectedAvatar(updatedUser.avatar || "");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        closeModal();
        showMessage("Perfil atualizado com sucesso!", "success");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao atualizar perfil";
      if (settingsSection === "password") {
        setPasswordError(msg);
      } else {
        showMessage(msg, "danger");
      }
    } finally {
      setSaving(false);
    }
  };

  const openSettingsSection = (section: "avatar" | "name" | "email" | "password") => {
    setNewName(user?.name || "");
    setNewEmail(user?.email || "");
    setSelectedAvatar(user?.avatar || "");
    setCustomPhoto(user?.avatar?.startsWith("data:") ? user.avatar : null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setSettingsSection(section);
    settingsModalRef.current?.present();
  };

  const getModalTitle = () => {
    switch (settingsSection) {
      case "avatar": return "Alterar Avatar";
      case "name": return "Alterar Nome";
      case "email": return "Alterar Email";
      case "password": return "Alterar Palavra-passe";
      default: return "Definições";
    }
  };

  const xpProgress = userStats?.nextLevelXp
    ? Math.min((userStats.xp / userStats.nextLevelXp) * 100, 100)
    : 100;

  if (loading) {
    return (
      <IonPage>
        <IonContent className="profile-content">
          <div className="profile-loading">
            <div className="profile-loading-spinner" />
            <p>A carregar perfil...</p>
          </div>
        </IonContent>
        <BottomNav />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="profile-content" fullscreen>
        {/* Hero Header */}
        <div className="profile-hero">
          <div className="profile-hero-bg" />
          <div className="profile-hero-content">
            <div className="profile-avatar-ring">
              <div className="profile-avatar">
                {user?.avatar?.startsWith("data:")
                  ? <img src={user.avatar} alt="avatar" className="profile-avatar-photo" />
                  : user?.avatar
                    ? <span className="profile-avatar-emoji">{user.avatar}</span>
                    : user?.name?.charAt(0)?.toUpperCase() || "U"
                }
              </div>
            </div>
            <h1 className="profile-name">{user?.name || "Utilizador"}</h1>
            <div className="profile-email">
              <IonIcon icon={mailOutline} />
              <span>{user?.email || ""}</span>
            </div>
            <div className="profile-level-badge">
              <IonIcon icon={ribbonOutline} />
              <span>Nível {userStats?.level || 1}</span>
              <span className="level-divider">•</span>
              <span>{userStats?.levelTitle || "Iniciante"}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <div
            className={`profile-tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <IonIcon icon={trendingUpOutline} />
            <span>Estatísticas</span>
          </div>
          <div
            className={`profile-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <IonIcon icon={settingsOutline} />
            <span>Definições</span>
          </div>
          <div
            className={`profile-tab ${activeTab === "privacy" ? "active" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            <IonIcon icon={shieldCheckmarkOutline} />
            <span>Privacidade</span>
          </div>
        </div>

        <div className="profile-body">
          {/* ===== STATS TAB ===== */}
          {activeTab === "stats" && (
            <>
              <div className="xp-card">
                <div className="xp-card-header">
                  <div className="xp-card-title">
                    <IonIcon icon={flashOutline} />
                    <span>Experiência</span>
                  </div>
                  <span className="xp-amount">{userStats?.xp ?? 0} XP</span>
                </div>
                <div className="xp-bar-container">
                  <div className="xp-bar-bg">
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}>
                      <div className="xp-bar-shine" />
                    </div>
                  </div>
                  <div className="xp-bar-labels">
                    <span>Nível {userStats?.level || 1}</span>
                    <span>
                      {userStats?.nextLevelXp
                        ? `${userStats.nextLevelXp} XP para o próximo`
                        : "Nível máximo atingido!"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <IonIcon icon={trendingUpOutline} />
                  <h3>Estatísticas</h3>
                </div>
                <div className="stats-grid">
                  <div className="stat-card stat-discoveries">
                    <div className="stat-icon-wrap">
                      <IonIcon icon={compassOutline} />
                    </div>
                    <span className="stat-value">{userStats?.discoveries ?? 0}</span>
                    <span className="stat-label">Descobertas</span>
                  </div>
                  <div className="stat-card stat-badges">
                    <div className="stat-icon-wrap">
                      <IonIcon icon={starOutline} />
                    </div>
                    <span className="stat-value">{userStats?.badgesCount ?? 0}</span>
                    <span className="stat-label">Badges</span>
                  </div>
                  <div className="stat-card stat-posts">
                    <div className="stat-icon-wrap">
                      <IonIcon icon={albumsOutline} />
                    </div>
                    <span className="stat-value">{userStats?.postsCount ?? 0}</span>
                    <span className="stat-label">Publicações</span>
                  </div>
                  <div className="stat-card stat-groups">
                    <div className="stat-icon-wrap">
                      <IonIcon icon={peopleOutline} />
                    </div>
                    <span className="stat-value">{userStats?.groupsCount ?? 0}</span>
                    <span className="stat-label">Grupos</span>
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              {(userStats?.badges?.length ?? 0) > 0 && (
                <div className="profile-section">
                  <div className="section-header">
                    <IonIcon icon={ribbonOutline} />
                    <h3>Badges Conquistados</h3>
                  </div>
                  <div className="badges-grid">
                    {userStats!.badges.map((badge, idx) => {
                      const badgeIcons: Record<string, string> = {
                        shield: "🛡️",
                        camera: "📸",
                        people: "👥",
                        chatbubble: "💬",
                        trophy: "🏆",
                      };
                      return (
                        <div key={idx} className="badge-card">
                          <span className="badge-icon-large">
                            {badgeIcons[badge.icon] || "🏆"}
                          </span>
                          <span className="badge-name">{badge.name}</span>
                          <span className="badge-desc">{badge.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {activeTab === "settings" && (
            <div className="settings-tab">
              <div className="settings-list">
                <div className="settings-item" onClick={() => openSettingsSection("avatar")}>
                  <div className="settings-item-icon avatar-icon">
                    <IonIcon icon={imageOutline} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-title">Alterar Avatar</span>
                    <span className="settings-item-desc">Escolhe um emoji como avatar</span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} className="settings-item-arrow" />
                </div>

                <div className="settings-item" onClick={() => openSettingsSection("name")}>
                  <div className="settings-item-icon name-icon">
                    <IonIcon icon={personOutline} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-title">Alterar Nome</span>
                    <span className="settings-item-desc">{user?.name || "Sem nome"}</span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} className="settings-item-arrow" />
                </div>

                <div className="settings-item" onClick={() => openSettingsSection("email")}>
                  <div className="settings-item-icon email-icon">
                    <IonIcon icon={mailOutline} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-title">Alterar Email</span>
                    <span className="settings-item-desc">{user?.email || "Sem email"}</span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} className="settings-item-arrow" />
                </div>

                <div className="settings-item" onClick={() => openSettingsSection("password")}>
                  <div className="settings-item-icon password-icon">
                    <IonIcon icon={lockClosedOutline} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-title">Alterar Palavra-passe</span>
                    <span className="settings-item-desc">••••••••</span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} className="settings-item-arrow" />
                </div>
              </div>
            </div>
          )}

          {/* ===== PRIVACY TAB ===== */}
          {activeTab === "privacy" && (
            <div className="privacy-tab">
              <div className="privacy-card">
                <h3>Termos de Privacidade</h3>
                <p className="privacy-updated">Última atualização: Fevereiro 2026</p>

                <div className="privacy-section">
                  <h4>1. Recolha de Dados</h4>
                  <p>
                    O MonuVista recolhe apenas os dados necessários para o funcionamento da aplicação,
                    incluindo o seu nome, endereço de email e atividade dentro da plataforma
                    (descobertas, publicações, participação em grupos).
                  </p>
                </div>

                <div className="privacy-section">
                  <h4>2. Utilização dos Dados</h4>
                  <p>
                    Os seus dados são utilizados exclusivamente para personalizar a sua experiência,
                    calcular estatísticas de gamificação (XP, níveis, badges) e permitir a interação
                    com outros utilizadores na comunidade.
                  </p>
                </div>

                <div className="privacy-section">
                  <h4>3. Armazenamento e Segurança</h4>
                  <p>
                    As suas informações são armazenadas de forma segura. As palavras-passe são
                    encriptadas utilizando algoritmos de hashing (bcrypt) e nunca são armazenadas
                    em texto simples. Utilizamos tokens JWT para autenticação segura.
                  </p>
                </div>

                <div className="privacy-section">
                  <h4>4. Partilha de Dados</h4>
                  <p>
                    O MonuVista não vende, troca ou transfere os seus dados pessoais a terceiros.
                    As informações partilhadas na comunidade (publicações, comentários) são visíveis
                    para outros utilizadores registados.
                  </p>
                </div>

                <div className="privacy-section">
                  <h4>5. Direitos do Utilizador</h4>
                  <p>
                    Tem o direito de aceder, corrigir ou eliminar os seus dados pessoais a qualquer
                    momento. Pode alterar as suas informações pessoais na secção de Definições do
                    seu perfil.
                  </p>
                </div>

                <div className="privacy-section">
                  <h4>6. Cookies e Armazenamento Local</h4>
                  <p>
                    A aplicação utiliza armazenamento local (localStorage) para manter a sua sessão
                    ativa e guardar preferências. Não utilizamos cookies de rastreamento de terceiros.
                  </p>
                </div>

                <div className="privacy-section">
                  <h4>7. Contacto</h4>
                  <p>
                    Para questões relacionadas com a privacidade dos seus dados, pode contactar-nos
                    através da funcionalidade de suporte disponível na aplicação.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="logout-btn" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} />
            <span>Terminar Sessão</span>
          </div>
        </div>
      </IonContent>

      {/* Settings Modal */}
      <IonModal
        ref={settingsModalRef}
        onDidDismiss={() => setSettingsSection(null)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>{getModalTitle()}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={closeModal}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="settings-modal-body">
            {settingsSection === "avatar" && (
              <div className="avatar-picker">
                {/* Custom Photo Upload */}
                <div className="avatar-upload-section">
                  <p className="avatar-upload-label">Carregar foto personalizada:</p>
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-file-input"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />
                  {customPhoto ? (
                    <div className="avatar-upload-preview">
                      <img src={customPhoto} alt="preview" />
                      <div className="avatar-upload-preview-text">
                        <span>Foto personalizada</span>
                        <span>Clica guardar para aplicar</span>
                      </div>
                      <div className="avatar-upload-remove" onClick={removeCustomPhoto}>
                        <IonIcon icon={trashOutline} />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="avatar-upload-btn"
                      onClick={() => document.getElementById("avatar-file-input")?.click()}
                    >
                      <IonIcon icon={cameraOutline} />
                      <span>Escolher Foto</span>
                    </div>
                  )}
                </div>

                <div className="avatar-or-divider">ou escolhe um emoji</div>

                <div className="avatar-grid">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <div
                      key={emoji}
                      className={`avatar-option ${selectedAvatar === emoji ? "selected" : ""}`}
                      onClick={() => { setSelectedAvatar(emoji); setCustomPhoto(null); }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                {selectedAvatar && (
                  <div className="avatar-preview">
                    <span>Pré-visualização:</span>
                    <div className="avatar-preview-circle">
                      {selectedAvatar.startsWith("data:")
                        ? <img src={selectedAvatar} alt="preview" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                        : selectedAvatar
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {settingsSection === "name" && (
              <div className="settings-form">
                <label className="settings-label">Novo Nome</label>
                <input
                  type="text"
                  className="settings-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Introduz o teu novo nome"
                />
              </div>
            )}

            {settingsSection === "email" && (
              <div className="settings-form">
                <label className="settings-label">Novo Email</label>
                <input
                  type="email"
                  className="settings-input"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Introduz o teu novo email"
                />
              </div>
            )}

            {settingsSection === "password" && (
              <div className="settings-form">
                <label className="settings-label">Palavra-passe Atual</label>
                <input
                  type="password"
                  className="settings-input"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Introduz a palavra-passe atual"
                />
                {passwordError && (
                  <div className="password-error">
                    <IonIcon icon={closeOutline} />
                    <span>{passwordError}</span>
                  </div>
                )}
                <label className="settings-label" style={{ marginTop: 12 }}>Nova Palavra-passe</label>
                <input
                  type="password"
                  className="settings-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
                <label className="settings-label" style={{ marginTop: 12 }}>Confirmar Palavra-passe</label>
                <input
                  type="password"
                  className="settings-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repete a palavra-passe"
                />
              </div>
            )}
          </div>

          <div className="settings-modal-footer">
            <div className="settings-cancel-btn" onClick={closeModal}>
              Cancelar
            </div>
            <div
              className={`settings-save-btn ${saving ? "disabled" : ""}`}
              onClick={() => !saving && handleSaveProfile()}
            >
              <IonIcon icon={checkmarkOutline} />
              <span>{saving ? "A guardar..." : "Guardar"}</span>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        color={toastColor}
        duration={2500}
        onDidDismiss={() => setShowToast(false)}
        position="top"
      />

      <BottomNav />
    </IonPage>
  );
};

export default Profile;
