import React, { useState, useEffect } from "react";
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
} from "@ionic/react";
import {
  peopleOutline,
  locationOutline,
  heartOutline,
  chatbubbleOutline,
  earthOutline,
} from "ionicons/icons";
import axios from "axios";
import BottomNav from "../components/BottomNav";
import "./Community.css";

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

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"recent" | "popular">("recent");
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    loadPosts();
  }, [filterType, selectedCountry]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/posts";

      if (selectedCountry) {
        url = `http://localhost:5000/api/posts/country/${selectedCountry}`;
      }

      const response = await axios.get(url, {
        params: { limit: 50 },
      });

      if (response.data.success) {
        let postsData = response.data.data;

        // Sort by filter type
        if (filterType === "popular") {
          postsData = postsData.sort(
            (a: Post, b: Post) => b.likes.length - a.likes.length
          );
        } else {
          postsData = postsData.sort(
            (a: Post, b: Post) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }

        setPosts(postsData);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `há ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440)
      return `há ${Math.floor(diffInMinutes / 60)} horas`;
    if (diffInMinutes < 10080)
      return `há ${Math.floor(diffInMinutes / 1440)} dias`;

    return date.toLocaleDateString("pt-PT");
  };

  const getTotalStats = () => {
    return {
      posts: posts.length,
      likes: posts.reduce((sum, post) => sum + post.likes.length, 0),
      comments: posts.reduce((sum, post) => sum + post.comments.length, 0),
      countries: new Set(posts.map((post) => post.country)).size,
    };
  };

  const stats = getTotalStats();

  return (
    <IonPage>
      <IonHeader className="community-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Comunidade</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="community-content">
        <IonLoading isOpen={loading} message="A carregar comunidade..." />

        {/* Stats Section */}
        <div className="community-stats">
          <div className="stat-item">
            <IonIcon icon={peopleOutline} />
            <div>
              <span className="stat-value">{stats.posts}</span>
              <span className="stat-label">Publicações</span>
            </div>
          </div>
          <div className="stat-item">
            <IonIcon icon={heartOutline} />
            <div>
              <span className="stat-value">{stats.likes}</span>
              <span className="stat-label">Gostos</span>
            </div>
          </div>
          <div className="stat-item">
            <IonIcon icon={chatbubbleOutline} />
            <div>
              <span className="stat-value">{stats.comments}</span>
              <span className="stat-label">Comentários</span>
            </div>
          </div>
          <div className="stat-item">
            <IonIcon icon={earthOutline} />
            <div>
              <span className="stat-value">{stats.countries}</span>
              <span className="stat-label">Países</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <IonSegment
            value={filterType}
            onIonChange={(e) => setFilterType(e.detail.value as any)}
          >
            <IonSegmentButton value="recent">Recentes</IonSegmentButton>
            <IonSegmentButton value="popular">Populares</IonSegmentButton>
          </IonSegment>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="country-filter"
          >
            <option value="">Todos os países</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 && !loading && (
          <div className="no-posts">
            <IonIcon icon={peopleOutline} />
            <p>Nenhuma publicação encontrada</p>
          </div>
        )}

        <div className="community-grid">
          {posts.map((post) => (
            <div key={post._id} className="community-card">
              {post.image && (
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="card-badges">
                    <span className="badge">{post.country}</span>
                  </div>
                </div>
              )}
              <div className="card-content">
                <div className="card-header">
                  <div className="card-avatar">
                    {post.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4>{post.userName}</h4>
                    <p className="card-time">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <h3 className="card-title">{post.title}</h3>
                <p className="card-description">{post.description}</p>
                <div className="card-location">
                  <IonIcon icon={locationOutline} />
                  {post.location}, {post.region}
                </div>
                <div className="card-stats">
                  <span>
                    <IonIcon icon={heartOutline} />
                    {post.likes.length}
                  </span>
                  <span>
                    <IonIcon icon={chatbubbleOutline} />
                    {post.comments.length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </IonContent>
      <BottomNav />
    </IonPage>
  );
};

export default Community;
