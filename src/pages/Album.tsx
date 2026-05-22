import { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonActionSheet,
  IonModal,
  IonButton,
} from "@ionic/react";
import {
  folderOutline,
  checkmarkCircleOutline,
  timeOutline,
  addOutline,
  trashOutline,
  createOutline,
  locationOutline,
  calendarOutline,
  closeCircleOutline,
} from "ionicons/icons";
import albumService, { AlbumMonument, Folder } from "../services/albumService";
import "./Album.css";

const Album = () => {
  const modalRef = useRef<any>(null);
  const [monuments, setMonuments] = useState<AlbumMonument[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "visited" | "tovisit">("all");
  const [showNewFolderAlert, setShowNewFolderAlert] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6B7280");
  const [showMonumentModal, setShowMonumentModal] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState<AlbumMonument | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [stats, setStats] = useState({ total: 0, visited: 0, toVisit: 0, countries: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log('[Album] showMonumentModal changed:', showMonumentModal);
    console.log('[Album] selectedMonument:', selectedMonument);
    
    // Se modal deve abrir e temos um monumento selecionado, apresentar o modal
    if (showMonumentModal && selectedMonument && modalRef.current) {
      console.log('[Album] Calling modal.present()');
      modalRef.current?.present?.();
    }
  }, [showMonumentModal, selectedMonument]);


  const loadData = async () => {
    try {
      const [m, f, s] = await Promise.all([
        albumService.getMonuments(),
        albumService.getFolders(),
        albumService.getStats(),
      ]);
      setMonuments(m);
      setFolders(f);
      setStats(s);
    } catch (e) {
      console.error('Error loading album data:', e);
    }
  };

  const getFilteredMonuments = () => {
    let filtered = monuments;

    // Filtrar por pasta
    if (selectedFolder !== "all") {
      filtered = filtered.filter(m => m.folderId === selectedFolder);
    }

    // Filtrar por estado
    if (filterType === "visited") {
      filtered = filtered.filter(m => m.visitInfo.visited);
    } else if (filterType === "tovisit") {
      filtered = filtered.filter(m => !m.visitInfo.visited);
    }

    return filtered;
  };

  const handleCreateFolder = async (name: string, color: string) => {
    await albumService.createFolder(name, color || "#6B7280");
    loadData();
  };

  const handleToggleVisited = async (monumentId: string, currentStatus: boolean) => {
    if (currentStatus) {
      await albumService.markAsToVisit(monumentId);
    } else {
      await albumService.markAsVisited(monumentId);
    }
    loadData();
  };

  const handleMoveToFolder = async (monumentId: string, folderId: string) => {
    await albumService.moveToFolder(monumentId, folderId);
    loadData();
  };

  const handleDeleteMonument = async (monumentId: string) => {
    await albumService.deleteMonument(monumentId);
    loadData();
    setShowMonumentModal(false);
  };

  const formatVisitDate = (monument: AlbumMonument) => {
    if (!monument.visitInfo.visited || !monument.visitInfo.date) {
      return "Por visitar";
    }
    const date = new Date(monument.visitInfo.date);
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredMonuments = getFilteredMonuments();

  return (
    <IonPage>
      <IonHeader className="album-header">
        <IonToolbar>
          <IonTitle>Meu Álbum</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="album-content">
        {/* Stats */}
        <div className="album-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Monumentos</span>
          </div>
          <div className="stat-card visited">
            <span className="stat-number">{stats.visited}</span>
            <span className="stat-label">Visitados</span>
          </div>
          <div className="stat-card tovisit">
            <span className="stat-number">{stats.toVisit}</span>
            <span className="stat-label">Por Visitar</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.countries}</span>
            <span className="stat-label">Países</span>
          </div>
        </div>

        {/* DEBUG BUTTON */}
        {filteredMonuments.length > 0 && (
          <div style={{ padding: '10px', marginBottom: '10px' }}>
            <IonButton 
              expand="block" 
              color="warning"
              onClick={() => {
                console.log('[DEBUG] Opening test modal with first monument');
                setSelectedMonument(filteredMonuments[0]);
                setShowMonumentModal(true);
              }}
            >
              🧪 Testar Modal (Primeiro Monumento)
            </IonButton>
          </div>
        )}

        {/* Folder Tabs */}
        <div className="folder-tabs">
          <div className="tabs-scroll">
            <button
              className={`folder-tab ${selectedFolder === "all" ? "active" : ""}`}
              onClick={() => setSelectedFolder("all")}
            >
              <IonIcon icon={folderOutline} />
              Todos
            </button>
            {folders.map(folder => (
              <button
                key={folder.id}
                className={`folder-tab ${selectedFolder === folder.id ? "active" : ""}`}
                style={{ borderBottomColor: folder.color }}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <IonIcon icon={folderOutline} style={{ color: folder.color }} />
                {folder.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Segment */}
        <div className="filter-segment">
          <IonSegment
            value={filterType}
            onIonChange={(e) => setFilterType(e.detail.value as any)}
          >
            <IonSegmentButton value="all">
              <IonIcon icon={folderOutline} />
              Todos
            </IonSegmentButton>
            <IonSegmentButton value="visited">
              <IonIcon icon={checkmarkCircleOutline} />
              Visitados
            </IonSegmentButton>
            <IonSegmentButton value="tovisit">
              <IonIcon icon={timeOutline} />
              Por Visitar
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Monuments Grid */}
        {filteredMonuments.length === 0 && (
          <div className="no-monuments">
            <IonIcon icon={folderOutline} />
            <p>Nenhum monumento nesta categoria</p>
            <p className="no-monuments-subtitle">
              Use a funcionalidade "Visitar" para adicionar monumentos ao álbum
            </p>
          </div>
        )}

        <div className="monuments-grid">
          {filteredMonuments.map((monument) => (
            <div
              key={monument.id}
              className="monument-card"
              onClick={() => {
                console.log('[Album] Clicked monument:', monument);
                setSelectedMonument(monument);
                setShowMonumentModal(true);
                console.log('[Album] Modal state updated');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="monument-image">
                <img src={monument.image} alt={monument.name} />
                {monument.visitInfo.visited ? (
                  <div className="status-badge visited">
                    <IonIcon icon={checkmarkCircleOutline} />
                    Visitado
                  </div>
                ) : (
                  <div className="status-badge tovisit">
                    <IonIcon icon={timeOutline} />
                    Por Visitar
                  </div>
                )}
              </div>
              <div className="monument-info">
                <h3>{monument.name}</h3>
                <p className="monument-location">
                  <IonIcon icon={locationOutline} />
                  {monument.location}
                </p>
                {monument.visitInfo.visited && (
                  <p className="visit-date">
                    <IonIcon icon={calendarOutline} />
                    {formatVisitDate(monument)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAB para criar pasta */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowNewFolderAlert(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Custom overlay para nova pasta */}
        {showNewFolderAlert && (
          <div className="custom-alert-overlay" onClick={() => setShowNewFolderAlert(false)}>
            <div className="custom-alert" onClick={e => e.stopPropagation()}>
              <h3>Nova Pasta</h3>
              <input
                type="text"
                placeholder="Nome da pasta"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="custom-alert-input"
              />
              <input
                type="text"
                placeholder="Cor (ex: #FF5733)"
                value={newFolderColor}
                onChange={e => setNewFolderColor(e.target.value)}
                className="custom-alert-input"
              />
              <div className="custom-alert-buttons">
                <button onClick={() => { setShowNewFolderAlert(false); setNewFolderName(""); setNewFolderColor("#6B7280"); }}>Cancelar</button>
                <button className="primary" onClick={() => {
                  if (newFolderName.trim()) {
                    handleCreateFolder(newFolderName.trim(), newFolderColor);
                    setNewFolderName("");
                    setNewFolderColor("#6B7280");
                    setShowNewFolderAlert(false);
                  }
                }}>Criar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes - Custom Overlay */}
        {showMonumentModal && selectedMonument && (
          <div className="monument-modal-overlay" onClick={() => setShowMonumentModal(false)}>
            <div className="monument-modal-content" onClick={e => e.stopPropagation()}>
              <button className="monument-modal-close" onClick={() => setShowMonumentModal(false)}>
                ✕
              </button>
              
              <img src={selectedMonument.image} alt={selectedMonument.name} className="monument-modal-image" />
              
              <div className="monument-modal-body">
                <h1>{selectedMonument.name}</h1>
                
                <div className="monument-modal-tags">
                  <span className="tag">
                    <IonIcon icon={locationOutline} />
                    {selectedMonument.location}
                  </span>
                  <span className="tag">
                    {selectedMonument.country}
                  </span>
                  {selectedMonument.region && (
                    <span className="tag">
                      {selectedMonument.region}
                    </span>
                  )}
                  <span className="tag">
                    Século {selectedMonument.century}
                  </span>
                  <span className="tag">
                    {selectedMonument.style}
                  </span>
                </div>

                {selectedMonument.visitInfo.visited && (
                  <div className="monument-visit-info-card">
                    <IonIcon icon={checkmarkCircleOutline} />
                    <div>
                      <strong>Visitado</strong>
                      <p>{formatVisitDate(selectedMonument)}</p>
                    </div>
                  </div>
                )}

                {selectedMonument.confidence !== undefined && (
                  <div className="monument-info-section">
                    <h3>Confiança da IA</h3>
                    <p>{selectedMonument.confidence}%</p>
                  </div>
                )}

                <div className="monument-info-section">
                  <h3>Descrição</h3>
                  <p>{selectedMonument.description}</p>
                </div>

                <div className="monument-info-section">
                  <h3>História</h3>
                  <p>{selectedMonument.history}</p>
                </div>

                {selectedMonument.funFacts && selectedMonument.funFacts.length > 0 && (
                  <div className="monument-info-section">
                    <h3>Curiosidades</h3>
                    <ul className="monument-fun-facts-list">
                      {selectedMonument.funFacts.map((fact, index) => (
                        <li key={index}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="monument-modal-actions">
                  <IonButton
                    expand="block"
                    color={selectedMonument.visitInfo.visited ? "warning" : "success"}
                    onClick={() => {
                      handleToggleVisited(selectedMonument.id, selectedMonument.visitInfo.visited);
                      setSelectedMonument({
                        ...selectedMonument,
                        visitInfo: {
                          ...selectedMonument.visitInfo,
                          visited: !selectedMonument.visitInfo.visited,
                        },
                      });
                    }}
                  >
                    <IonIcon
                      icon={selectedMonument.visitInfo.visited ? timeOutline : checkmarkCircleOutline}
                      slot="start"
                    />
                    {selectedMonument.visitInfo.visited ? "Marcar como Por Visitar" : "Marcar como Visitado"}
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={() => setShowActionSheet(true)}
                  >
                    <IonIcon icon={createOutline} slot="start" />
                    Mover para Pasta
                  </IonButton>

                  <IonButton
                    expand="block"
                    color="danger"
                    fill="outline"
                    onClick={() => handleDeleteMonument(selectedMonument.id)}
                  >
                    <IonIcon icon={trashOutline} slot="start" />
                    Eliminar
                  </IonButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ionic - Remover ou manter como fallback */}
        <IonModal
          ref={modalRef}
          isOpen={showMonumentModal}
          onDidDismiss={() => {
            console.log('[Album] Modal dismissed');
            setShowMonumentModal(false);
          }}
          className="monument-modal"
          swipeToClose={true}
        >
          {selectedMonument && (
            <IonPage>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>{selectedMonument.name}</IonTitle>
                  <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() => setShowMonumentModal(false)}
                  >
                    <IonIcon icon={closeCircleOutline} />
                  </IonButton>
                </IonToolbar>
              </IonHeader>
              <IonContent className="modal-content">
                <img src={selectedMonument.image} alt={selectedMonument.name} className="modal-image" />
                
                <div className="modal-body">
                  <h1>{selectedMonument.name}</h1>
                  
                  <div className="modal-tags">
                    <span className="tag">
                      <IonIcon icon={locationOutline} />
                      {selectedMonument.location}
                    </span>
                    <span className="tag">
                      {selectedMonument.country}
                    </span>
                    {selectedMonument.region && (
                      <span className="tag">
                        {selectedMonument.region}
                      </span>
                    )}
                    <span className="tag">
                      Século {selectedMonument.century}
                    </span>
                    <span className="tag">
                      {selectedMonument.style}
                    </span>
                  </div>

                  {selectedMonument.visitInfo.visited && (
                    <div className="visit-info-card">
                      <IonIcon icon={checkmarkCircleOutline} />
                      <div>
                        <strong>Visitado</strong>
                        <p>{formatVisitDate(selectedMonument)}</p>
                      </div>
                    </div>
                  )}

                  {selectedMonument.confidence !== undefined && (
                    <div className="info-section">
                      <h3>Confiança da IA</h3>
                      <p>{selectedMonument.confidence}%</p>
                    </div>
                  )}

                  <div className="info-section">
                    <h3>Descrição</h3>
                    <p>{selectedMonument.description}</p>
                  </div>

                  <div className="info-section">
                    <h3>História</h3>
                    <p>{selectedMonument.history}</p>
                  </div>

                  {selectedMonument.funFacts && selectedMonument.funFacts.length > 0 && (
                    <div className="info-section">
                      <h3>Curiosidades</h3>
                      <ul className="fun-facts-list">
                        {selectedMonument.funFacts.map((fact, index) => (
                          <li key={index}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="modal-actions">
                    <IonButton
                      expand="block"
                      color={selectedMonument.visitInfo.visited ? "warning" : "success"}
                      onClick={() => {
                        handleToggleVisited(selectedMonument.id, selectedMonument.visitInfo.visited);
                        setSelectedMonument({
                          ...selectedMonument,
                          visitInfo: {
                            ...selectedMonument.visitInfo,
                            visited: !selectedMonument.visitInfo.visited,
                          },
                        });
                      }}
                    >
                      <IonIcon
                        icon={selectedMonument.visitInfo.visited ? timeOutline : checkmarkCircleOutline}
                        slot="start"
                      />
                      {selectedMonument.visitInfo.visited ? "Marcar como Por Visitar" : "Marcar como Visitado"}
                    </IonButton>

                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => setShowActionSheet(true)}
                    >
                      <IonIcon icon={createOutline} slot="start" />
                      Mover para Pasta
                    </IonButton>

                    <IonButton
                      expand="block"
                      color="danger"
                      fill="outline"
                      onClick={() => handleDeleteMonument(selectedMonument.id)}
                    >
                      <IonIcon icon={trashOutline} slot="start" />
                      Eliminar
                    </IonButton>
                  </div>
                </div>
              </IonContent>
            </IonPage>
          )}
        </IonModal>

        {/* Action Sheet para mover pasta */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Mover para Pasta"
          buttons={[
            ...folders.map(folder => ({
              text: folder.name,
              handler: () => {
                if (selectedMonument) {
                  handleMoveToFolder(selectedMonument.id, folder.id);
                  setShowMonumentModal(false);
                }
              },
            })),
            {
              text: "Cancelar",
              role: "cancel" as const,
              handler: () => {},
            },
          ]}
        />
      </IonContent>

    </IonPage>
  );
};

export default Album;
