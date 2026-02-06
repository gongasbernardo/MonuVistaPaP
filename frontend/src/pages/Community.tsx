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
  IonInput,
  IonButton,
  IonModal,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import {
  peopleOutline,
  locationOutline,
  heartOutline,
  heartSharp,
  chatbubbleOutline,
  earthOutline,
  sendOutline,
  chevronDownOutline,
  chevronUpOutline,
  addOutline,
  closeOutline,
  imageOutline,
} from "ionicons/icons";
import axios from "axios";
import { API_URL } from "../config";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "../constants/locations";
import authService from "../services/authService";
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

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"recent" | "popular">("recent");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<string[]>([]);

  // Create Post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const createModalRef = useRef<HTMLIonModalElement>(null);

  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewImage(result);
        setNewImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewLocation("");
    setNewCountry("");
    setNewRegion("");
    setNewImage(null);
    setNewImagePreview(null);
    setCreateError("");
  };

  const handleCreatePost = async () => {
    setCreateError("");
    if (!newTitle || !newDescription || !newLocation || !newCountry || !newRegion || !newImage) {
      setCreateError("Por favor preencha todos os campos");
      return;
    }
    if (newTitle.length > 100) {
      setCreateError("Título não pode ter mais de 100 caracteres");
      return;
    }
    if (newDescription.length > 1000) {
      setCreateError("Descrição não pode ter mais de 1000 caracteres");
      return;
    }
    try {
      setCreateLoading(true);
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/api/posts`,
        { title: newTitle, description: newDescription, location: newLocation, country: newCountry, region: newRegion, image: newImage },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        resetCreateForm();
        setShowCreateModal(false);
        createModalRef.current?.dismiss();
        loadPosts();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Erro ao criar publicação");
    } finally {
      setCreateLoading(false);
    }
  };

  const availableNewRegions = newCountry ? (REGIONS_BY_COUNTRY[newCountry] || []) : [];

  useEffect(() => {
    loadPosts();
  }, [filterType, selectedCountry]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/posts`;

      if (selectedCountry) {
        url = `${API_URL}/api/posts/country/${selectedCountry}`;
      }

      const response = await axios.get(url, {
        params: { limit: 50 },
      });

      if (response.data.success) {
        let postsData = response.data.data;

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
        // Set liked posts based on current user
        const userData = authService.getUser();
        if (userData) {
          const liked = postsData
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

  const handleLikePost = async (postId: string) => {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `${API_URL}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        if (likedPosts.includes(postId)) {
          setLikedPosts(likedPosts.filter((id) => id !== postId));
        } else {
          setLikedPosts([...likedPosts, postId]);
        }
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
                  <button
                    onClick={() => handleLikePost(post._id)}
                    className={`action-btn ${likedPosts.includes(post._id) ? "liked" : ""}`}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <IonIcon icon={likedPosts.includes(post._id) ? heartSharp : heartOutline} />
                    {post.likes.length}
                  </button>
                  <button
                    onClick={() => toggleComments(post._id)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <IonIcon icon={chatbubbleOutline} />
                    {post.comments.length}
                    <IonIcon
                      icon={expandedComments.includes(post._id) ? chevronUpOutline : chevronDownOutline}
                      style={{ fontSize: 12 }}
                    />
                  </button>
                </div>

                {/* Comments section */}
                {expandedComments.includes(post._id) && (
                  <div className="comments-section" style={{ marginTop: 8 }}>
                    {post.comments.length > 0 && (
                      <div className="comments-list">
                        {post.comments.map((c: any, idx: number) => (
                          <div key={idx} className="comment-item" style={{ padding: "4px 0", borderBottom: "1px solid #eee" }}>
                            <strong style={{ fontSize: 12 }}>{c.userName}</strong>{" "}
                            <span style={{ fontSize: 12 }}>{c.text}</span>
                            <small style={{ display: "block", color: "#999", fontSize: 10 }}>{formatDate(c.createdAt)}</small>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <IonInput
                        placeholder="Comentar..."
                        value={commentText[post._id] || ""}
                        onIonChange={(e) =>
                          setCommentText({ ...commentText, [post._id]: e.detail.value || "" })
                        }
                        style={{ fontSize: 12 }}
                      />
                      <IonButton fill="clear" size="small" onClick={() => handleAddComment(post._id)}>
                        <IonIcon icon={sendOutline} />
                      </IonButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAB - Create Post Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: 56 }}>
          <IonFabButton onClick={() => { resetCreateForm(); setShowCreateModal(true); createModalRef.current?.present(); }}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Create Post Modal */}
        <IonModal ref={createModalRef} isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nova Publicação</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => { setShowCreateModal(false); createModalRef.current?.dismiss(); }}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="create-post-content">
            <div className="create-post-form" style={{ padding: 16 }}>
              {/* Image Upload */}
              <div className="image-upload-section" style={{ marginBottom: 16 }}>
                {newImagePreview ? (
                  <div
                    style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => createFileInputRef.current?.click()}
                  >
                    <img src={newImagePreview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <IonIcon icon={imageOutline} style={{ fontSize: 32 }} />
                      <p style={{ margin: 4 }}>Alterar Foto</p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => createFileInputRef.current?.click()}
                    style={{ border: '2px dashed #ccc', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', color: '#999' }}
                  >
                    <IonIcon icon={imageOutline} style={{ fontSize: 48 }} />
                    <p>Seleccionar Foto</p>
                  </div>
                )}
                <input
                  ref={createFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCreateImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Title */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>Título da Estrutura</label>
                <IonInput value={newTitle} onIonChange={(e) => setNewTitle(e.detail.value || "")} placeholder="Ex: Torre de Belém" maxlength={100} />
                <p style={{ fontSize: 11, color: '#999', textAlign: 'right', margin: 0 }}>{newTitle.length}/100</p>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>Descrição</label>
                <IonTextarea value={newDescription} onIonChange={(e) => setNewDescription(e.detail.value || "")} placeholder="Descreva a estrutura..." maxlength={1000} rows={4} />
                <p style={{ fontSize: 11, color: '#999', textAlign: 'right', margin: 0 }}>{newDescription.length}/1000</p>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>Localização</label>
                <IonInput value={newLocation} onIonChange={(e) => setNewLocation(e.detail.value || "")} placeholder="Ex: Lisbon, Belém" />
              </div>

              {/* Country */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>País</label>
                <IonSelect value={newCountry} onIonChange={(e) => { setNewCountry(e.detail.value); setNewRegion(""); }} placeholder="Seleccione um país">
                  {COUNTRIES.map((c) => (
                    <IonSelectOption key={c} value={c}>{c}</IonSelectOption>
                  ))}
                </IonSelect>
              </div>

              {/* Region */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>Região</label>
                <IonSelect value={newRegion} onIonChange={(e) => setNewRegion(e.detail.value)} placeholder={newCountry ? "Seleccione uma região" : "Seleccione um país primeiro"} disabled={!newCountry}>
                  {availableNewRegions.map((r) => (
                    <IonSelectOption key={r} value={r}>{r}</IonSelectOption>
                  ))}
                </IonSelect>
              </div>

              {/* Error */}
              {createError && <div style={{ color: '#eb445a', textAlign: 'center', marginBottom: 12, fontSize: 14 }}>{createError}</div>}

              {/* Submit */}
              <IonButton expand="block" onClick={handleCreatePost} disabled={createLoading}>
                {createLoading ? "A publicar..." : "Publicar"}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
      <BottomNav />
    </IonPage>
  );
};

export default Community;
