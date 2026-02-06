import React, { useState, useEffect } from "react";
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
} from "@ionic/react";
import {
  cameraOutline,
  trophyOutline,
  locationOutline,
  addCircleOutline,
  heartOutline,
  heartSharp,
  chatbubbleOutline,
  sparklesOutline,
} from "ionicons/icons";
import authService from "../services/authService";
import { useHistory } from "react-router-dom";
import axios from "axios";
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

const COUNTRIES = [
  "Portugal",
  "Espanha",
  "França",
  "Itália",
  "Grécia",
  "Alemanha",
  "Reino Unido",
  "Holanda",
  "Bélgica",
  "Polónia",
];

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "country">("all");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const history = useHistory();

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    loadPosts();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [filterType, selectedCountry]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/posts";

      if (filterType === "country" && selectedCountry) {
        url = `http://localhost:5000/api/posts/country/${selectedCountry}`;
      }

      const response = await axios.get(url, {
        params: { limit: 20 },
      });

      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  const navigateTo = (path: string) => {
    history.push(path);
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
        {/* 1. ACTION BUTTON - CREATE POST */}
        <div className="action-section">
          <button
            className="explore-button"
            onClick={() => navigateTo("/visit")}
          >
            <IonIcon icon={sparklesOutline} />
            <span>Visitar com IA</span>
          </button>
          <button
            className="explore-button secondary"
            onClick={() => navigateTo("/create-post")}
          >
            <IonIcon icon={addCircleOutline} />
            <span>Criar Publicação</span>
          </button>
        </div>

        {/* 2. USER SUMMARY */}
        <div className="user-summary-card">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
            <div className="user-details">
              <h2>{user?.name || "Utilizador"}</h2>
              <p className="cultural-level">Nível 3 - Explorador</p>
            </div>
          </div>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Descobertas</span>
            </div>
            <div className="stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Badges</span>
            </div>
            <div className="stat">
              <span className="stat-number">5</span>
              <span className="stat-label">Grupos</span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVE CHALLENGES */}
        <div className="section">
          <h3 className="section-title">Desafios Ativos</h3>
          <div className="challenge-card">
            <div className="challenge-header">
              <IonIcon icon={trophyOutline} />
              <h4>Explorador Medieval</h4>
            </div>
            <p className="challenge-description">
              Descubra 5 monumentos medievais este mês
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "40%" }}></div>
            </div>
            <div className="progress-text">2 de 5 concluídos</div>
            <button className="challenge-button">Participar</button>
          </div>
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
                <button className="action-btn">
                  <IonIcon icon={chatbubbleOutline} />
                  {post.comments.length}
                </button>
              </div>

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
