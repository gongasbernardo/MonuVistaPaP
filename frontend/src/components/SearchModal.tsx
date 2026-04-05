import { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonChip,
  IonSpinner,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  locationOutline,
  documentTextOutline,
  closeOutline,
  filterOutline,
  funnelOutline,
  heartOutline,
  heart,
  checkmarkCircleOutline,
  checkmarkCircle,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import monumentService, { UserMonuments } from "../services/monumentService";
import "./SearchModal.css";

interface Monument {
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  century: string;
  style: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "monuments" | "posts">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCentury, setSelectedCentury] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [userMonuments, setUserMonuments] = useState<UserMonuments | null>(null);
  const history = useHistory();

  // Mock data for monuments (same as in Home.tsx)
  const allMonuments: Monument[] = [
    { name: "Torre de Belém", location: "Lisboa", country: "Portugal", lat: 38.6916, lng: -9.2160, century: "XVI", style: "Manuelino" },
    { name: "Mosteiro dos Jerónimos", location: "Lisboa", country: "Portugal", lat: 38.6979, lng: -9.2057, century: "XVI", style: "Manuelino" },
    { name: "Castelo de São Jorge", location: "Lisboa", country: "Portugal", lat: 38.7139, lng: -9.1334, century: "XI", style: "Medieval" },
    // Add more monuments as needed
  ];

  const regions = ["Lisboa", "Porto", "Algarve", "Alentejo", "Centro", "Norte", "Açores", "Madeira"];
  const centuries = ["I", "II", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
  const styles = ["Manuelino", "Gótico", "Barroco", "Rococó", "Neoclássico", "Romântico", "Medieval", "Mourisco", "Religioso", "Militar"];

  // Mock posts data
  const allPosts: Post[] = [
    { _id: "1", title: "Visita ao Castelo de São Jorge", content: "Uma experiência incrível...", author: "João Silva", createdAt: "2024-01-15" },
    { _id: "2", title: "Monumentos de Lisboa", content: "Descobri tantos lugares...", author: "Maria Santos", createdAt: "2024-01-10" },
  ];

  // Computed monuments based on search and filters
  const monuments = allMonuments.filter(monument => {
    const matchesSearch = !searchText || searchText.length <= 2 ||
      monument.name.toLowerCase().includes(searchText.toLowerCase()) ||
      monument.location.toLowerCase().includes(searchText.toLowerCase()) ||
      monument.style.toLowerCase().includes(searchText.toLowerCase());

    const matchesRegion = !selectedRegion || monument.location.toLowerCase().includes(selectedRegion.toLowerCase());
    const matchesCentury = !selectedCentury || monument.century === selectedCentury;
    const matchesStyle = !selectedStyle || monument.style.toLowerCase().includes(selectedStyle.toLowerCase());

    return matchesSearch && matchesRegion && matchesCentury && matchesStyle;
  }).slice(0, 10);

  // Computed posts based on search
  const posts = allPosts.filter(post => {
    const matchesSearch = !searchText || searchText.length <= 2 ||
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.content.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    if (isOpen) {
      loadUserMonuments();
    }
  }, [isOpen]);

  const loadUserMonuments = async () => {
    try {
      const data = await monumentService.getUserMonuments();
      setUserMonuments(data);
    } catch (error) {
      console.error("Erro ao carregar monumentos do usuário:", error);
    }
  };

  const handleMonumentClick = (monument: Monument) => {
    // Navigate to visit page with monument data
    history.push(`/visit?monument=${encodeURIComponent(monument.name)}`);
    onClose();
  };

  const handlePostClick = () => {
    // Navigate to community or post detail
    history.push(`/community`);
    onClose();
  };

  const handleFavoriteToggle = async (monument: Monument) => {
    if (!userMonuments) return;

    try {
      const isFav = monumentService.isFavorite(monument.name, userMonuments.favorites);
      if (isFav) {
        await monumentService.removeFavorite(monument.name);
      } else {
        await monumentService.addFavorite({ name: monument.name, location: monument.location });
      }
      // Reload user monuments
      loadUserMonuments();
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
    }
  };

  const handleVisitedToggle = async (monument: Monument) => {
    if (!userMonuments) return;

    try {
      const isVisited = monumentService.isVisited(monument.name, userMonuments.visited);
      if (!isVisited) {
        await monumentService.markVisited({ name: monument.name, location: monument.location });
        // Reload user monuments
        loadUserMonuments();
      }
    } catch (error) {
      console.error("Erro ao marcar como visitado:", error);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Buscar</IonTitle>
          <IonButton fill="clear" slot="end" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="search-container">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Buscar monumentos, posts..."
            className="search-bar"
          />

          <div className="filter-chips">
            <IonChip
              outline={activeFilter !== "all"}
              color={activeFilter === "all" ? "primary" : "medium"}
              onClick={() => setActiveFilter("all")}
            >
              <IonIcon icon={filterOutline} />
              <IonLabel>Tudo</IonLabel>
            </IonChip>
            <IonChip
              outline={activeFilter !== "monuments"}
              color={activeFilter === "monuments" ? "primary" : "medium"}
              onClick={() => setActiveFilter("monuments")}
            >
              <IonIcon icon={locationOutline} />
              <IonLabel>Monumentos</IonLabel>
            </IonChip>
            <IonChip
              outline={activeFilter !== "posts"}
              color={activeFilter === "posts" ? "primary" : "medium"}
              onClick={() => setActiveFilter("posts")}
            >
              <IonIcon icon={documentTextOutline} />
              <IonLabel>Posts</IonLabel>
            </IonChip>
            <IonChip
              outline={!showFilters}
              color={showFilters ? "primary" : "medium"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <IonIcon icon={funnelOutline} />
              <IonLabel>Filtros</IonLabel>
            </IonChip>
          </div>

          {showFilters && (
            <div className="filters-section">
              <div className="filter-row">
                <IonSelect
                  value={selectedRegion}
                  placeholder="Região"
                  onIonChange={(e) => setSelectedRegion(e.detail.value)}
                  className="filter-select"
                >
                  {regions.map(region => (
                    <IonSelectOption key={region} value={region}>{region}</IonSelectOption>
                  ))}
                </IonSelect>
                <IonSelect
                  value={selectedCentury}
                  placeholder="Século"
                  onIonChange={(e) => setSelectedCentury(e.detail.value)}
                  className="filter-select"
                >
                  {centuries.map(century => (
                    <IonSelectOption key={century} value={century}>Séc. {century}</IonSelectOption>
                  ))}
                </IonSelect>
                <IonSelect
                  value={selectedStyle}
                  placeholder="Estilo"
                  onIonChange={(e) => setSelectedStyle(e.detail.value)}
                  className="filter-select"
                >
                  {styles.map(style => (
                    <IonSelectOption key={style} value={style}>{style}</IonSelectOption>
                  ))}
                </IonSelect>
              </div>
              {(selectedRegion || selectedCentury || selectedStyle) && (
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => {
                    setSelectedRegion("");
                    setSelectedCentury("");
                    setSelectedStyle("");
                  }}
                  className="clear-filters"
                >
                  Limpar Filtros
                </IonButton>
              )}
            </div>
          )}

          {false && (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Buscando...</p>
            </div>
          )}

          {!false && searchText.length > 2 && (
            <IonList>
              {(activeFilter === "all" || activeFilter === "monuments") && monuments.length > 0 && (
                <>
                  <div className="search-section-header">
                    <IonIcon icon={locationOutline} />
                    <span>Monumentos</span>
                  </div>
                  {monuments.map((monument, index) => (
                    <IonItem key={index} button onClick={() => handleMonumentClick(monument)}>
                      <IonIcon icon={locationOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h3>{monument.name}</h3>
                        <p>{monument.location}, {monument.country} • {monument.century} • {monument.style}</p>
                      </IonLabel>
                      <div slot="end" className="monument-actions">
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(monument);
                          }}
                          className={userMonuments && monumentService.isFavorite(monument.name, userMonuments.favorites) ? "favorite-active" : ""}
                        >
                          <IonIcon
                            icon={userMonuments && monumentService.isFavorite(monument.name, userMonuments.favorites) ? heart : heartOutline}
                            color={userMonuments && monumentService.isFavorite(monument.name, userMonuments.favorites) ? "danger" : "medium"}
                          />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisitedToggle(monument);
                          }}
                          disabled={!!(userMonuments && monumentService.isVisited(monument.name, userMonuments.visited))}
                        >
                          <IonIcon
                            icon={userMonuments && monumentService.isVisited(monument.name, userMonuments.visited) ? checkmarkCircle : checkmarkCircleOutline}
                            color={userMonuments && monumentService.isVisited(monument.name, userMonuments.visited) ? "success" : "medium"}
                          />
                        </IonButton>
                      </div>
                    </IonItem>
                  ))}
                </>
              )}

              {(activeFilter === "all" || activeFilter === "posts") && posts.length > 0 && (
                <>
                  <div className="search-section-header">
                    <IonIcon icon={documentTextOutline} />
                    <span>Posts</span>
                  </div>
                  {posts.map((post) => (
                    <IonItem key={post._id} button onClick={() => handlePostClick()}>
                      <IonIcon icon={documentTextOutline} slot="start" color="secondary" />
                      <IonLabel>
                        <h3>{post.title}</h3>
                        <p>{post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </>
              )}

              {monuments.length === 0 && posts.length === 0 && searchText.length > 2 && (
                <div className="no-results">
                  <p>Nenhum resultado encontrado para "{searchText}"</p>
                </div>
              )}
            </IonList>
          )}

          {searchText.length <= 2 && !selectedRegion && !selectedCentury && !selectedStyle && (
            <div className="search-placeholder">
              <p>Digite pelo menos 3 caracteres ou use filtros para buscar</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default SearchModal;