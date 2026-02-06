import { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonLoading,
  IonSegment,
  IonSegmentButton,
  IonInput,
} from "@ionic/react";
import {
  cameraOutline,
  trophyOutline,
  locationOutline,
  heartOutline,
  heartSharp,
  chatbubbleOutline,
  sendOutline,
  chevronDownOutline,
  chevronUpOutline,
} from "ionicons/icons";
import authService from "../services/authService";
import axios from "axios";
import { API_URL } from "../config";
import { COUNTRIES } from "../constants/locations";
import BottomNav from "../components/BottomNav";
import "./Home.css";

interface Post {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  country: string;
  region: string;
  userName: string;
  likes: any[];
  comments: any[];
  createdAt: string;
}

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

interface Challenge {
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
}

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "country">("all");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<string[]>([]);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    loadPosts();
    loadUserStats();
    loadChallenges();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [filterType, selectedCountry]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/posts`;

      if (filterType === "country" && selectedCountry) {
        url = `${API_URL}/api/posts/country/${selectedCountry}`;
      }

      const response = await axios.get(url, { params: { limit: 20 } });

      if (response.data.success) {
        setPosts(response.data.data);
        // Set liked posts based on current user
        const userData = authService.getUser();
        if (userData) {
          const liked = response.data.data
            .filter((p: Post) => p.likes.some((l: any) => l.userId === userData.id))
            .map((p: Post) => p._id);
          setLikedPosts(liked);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const loadChallenges = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      // Seed challenges if none exist
      await axios.post(`${API_URL}/api/challenges/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      const response = await axios.get(`${API_URL}/api/challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setChallenges(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar desafios:", error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const token = authService.getToken();
      await axios.post(`${API_URL}/api/challenges/${challengeId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadChallenges();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao participar");
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `${API_URL}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Toggle like in UI
        if (likedPosts.includes(postId)) {
          setLikedPosts(likedPosts.filter((id) => id !== postId));
        } else {
          setLikedPosts([...likedPosts, postId]);
        }

        // Reload posts
        loadPosts();
      }
    } catch (error) {
      console.error("Erro ao dar like:", error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      const token = authService.getToken();
      await axios.put(
        `${API_URL}/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText({ ...commentText, [postId]: "" });
      loadPosts();
    } catch (error) {
      console.error("Erro ao comentar:", error);
    }
  };

  const toggleComments = (postId: string) => {
    if (expandedComments.includes(postId)) {
      setExpandedComments(expandedComments.filter((id) => id !== postId));
    } else {
      setExpandedComments([...expandedComments, postId]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `há ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) return `há ${Math.floor(diffInMinutes / 60)} horas`;
    if (diffInMinutes < 10080) return `há ${Math.floor(diffInMinutes / 1440)} dias`;

    return date.toLocaleDateString("pt-PT");
  };

  return (
    <IonPage>
      <IonHeader className="home-header">
        <IonToolbar>
          <div className="header-content">
            <IonTitle>MonuVista</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="home-content">
        {/* 1. USER SUMMARY — real data */}
        <div className="user-summary-card">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
            <div className="user-details">
              <h2>{user?.name || "Utilizador"}</h2>
              <p className="cultural-level">
                Nível {userStats?.level || 1} - {userStats?.levelTitle || "Iniciante"}
              </p>
            </div>
          </div>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-number">{userStats?.discoveries ?? 0}</span>
              <span className="stat-label">Descobertas</span>
            </div>
            <div className="stat">
              <span className="stat-number">{userStats?.badgesCount ?? 0}</span>
              <span className="stat-label">Badges</span>
            </div>
            <div className="stat">
              <span className="stat-number">{userStats?.groupsCount ?? 0}</span>
              <span className="stat-label">Grupos</span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVE CHALLENGES — real data */}
        <div className="section">
          <h3 className="section-title">Desafios Ativos</h3>
          {challenges.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", padding: "16px" }}>
              Sem desafios disponíveis
            </p>
          ) : (
            challenges.map((challenge) => (
              <div key={challenge._id} className="challenge-card">
                <div className="challenge-header">
                  <IonIcon icon={trophyOutline} />
                  <h4>{challenge.title}</h4>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                {challenge.joined && (
                  <>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            (challenge.progress / challenge.target) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {challenge.progress} de {challenge.target} concluídos
                      {challenge.completed && " ✅"}
                    </div>
                  </>
                )}
                {!challenge.joined && !challenge.completed && (
                  <button
                    className="challenge-button"
                    onClick={() => handleJoinChallenge(challenge._id)}
                  >
                    Participar
                  </button>
                )}
                {challenge.joined && !challenge.completed && (
                  <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    {challenge.participantsCount} participante(s)
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* 4. COMMUNITY FEED */}
        <div className="section">
          <h3 className="section-title">Feed da Comunidade</h3>

          {/* FILTERS */}
          <div className="filters-section">
            <IonSegment
              value={filterType}
              onIonChange={(e) => setFilterType(e.detail.value as any)}
            >
              <IonSegmentButton value="all">Todas</IonSegmentButton>
              <IonSegmentButton value="country">Por País</IonSegmentButton>
            </IonSegment>

            {filterType === "country" && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="country-filter"
              >
                <option value="">Seleccione um país...</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* POSTS */}
          <IonLoading isOpen={loading} message="A carregar publicações..." />

          {posts.length === 0 && !loading && (
            <div className="no-posts">
              <IonIcon icon={cameraOutline} />
              <p>Nenhuma publicação encontrada</p>
            </div>
          )}

          {posts.map((post) => (
            <div key={post._id} className="community-post">
              <div className="post-header">
                <div className="post-avatar">
                  {post.userName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="post-info">
                  <h4>{post.userName}</h4>
                  <p className="post-time">{formatDate(post.createdAt)}</p>
                  <p className="post-location">
                    <IonIcon icon={locationOutline} style={{ marginRight: "4px" }} />
                    {post.location}, {post.country}
                  </p>
                </div>
              </div>
              <p className="post-title">{post.title}</p>
              <p className="post-description">{post.description}</p>

              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt={post.title} />
                </div>
              )}

              <div className="post-actions">
                <button
                  onClick={() => handleLikePost(post._id)}
                  className={`action-btn ${
                    likedPosts.includes(post._id) ? "liked" : ""
                  }`}
                >
                  <IonIcon
                    icon={likedPosts.includes(post._id) ? heartSharp : heartOutline}
                  />
                  {post.likes.length}
                </button>
                <button
                  className="action-btn"
                  onClick={() => toggleComments(post._id)}
                >
                  <IonIcon icon={chatbubbleOutline} />
                  {post.comments.length}
                  <IonIcon
                    icon={expandedComments.includes(post._id) ? chevronUpOutline : chevronDownOutline}
                    style={{ fontSize: 12, marginLeft: 4 }}
                  />
                </button>
              </div>

              {/* Comments section */}
              {expandedComments.includes(post._id) && (
                <div className="comments-section">
                  {post.comments.length > 0 && (
                    <div className="comments-list">
                      {post.comments.map((c: any, idx: number) => (
                        <div key={idx} className="comment-item">
                          <strong>{c.userName}</strong>
                          <span>{c.text}</span>
                          <small>{formatDate(c.createdAt)}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="comment-input-row">
                    <IonInput
                      placeholder="Escrever comentário..."
                      value={commentText[post._id] || ""}
                      onIonChange={(e) =>
                        setCommentText({ ...commentText, [post._id]: e.detail.value || "" })
                      }
                    />
                    <IonButton
                      fill="clear"
                      onClick={() => handleAddComment(post._id)}
                    >
                      <IonIcon icon={sendOutline} />
                    </IonButton>
                  </div>
                </div>
              )}

              <div className="post-metadata">
                <span className="badge">{post.region}</span>
                <span className="badge">{post.country}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: "80px" }}></div>
      </IonContent>

      <BottomNav />
    </IonPage>
  );
};

export default Home;
