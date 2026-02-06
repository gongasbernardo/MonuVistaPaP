import { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
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
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService";
import { API_URL } from "../config";
import BottomNav from "../components/BottomNav";
import "./Profile.css";

interface UserStats {
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number | null;
  discoveries: number;
  badgesCount: number;
  postsCount: number;
  groupsCount: number;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
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
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
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

        {/* XP Progress Card */}
        <div className="profile-body">
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

          {/* Stats Section */}
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

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </IonContent>
      <BottomNav />
    </IonPage>
  );
};

export default Profile;
