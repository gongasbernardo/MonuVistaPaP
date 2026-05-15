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
  IonCard,
  IonCardContent,
} from "@ionic/react";
import {
  cameraOutline,
  locationOutline,
  timeOutline,
  informationCircleOutline,
  sparklesOutline,
  closeCircleOutline,
  addCircleOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import albumService, { Folder } from "../services/albumService";
import challengeService from "../services/challengeService";
import visionService from "../services/visionService";
import "./VisitPlace.css";

interface Monument {
  name: string;
  location: string;
  country: string;
  region: string;
  century: string;
  style: string;
  description: string;
  history: string;
  funFacts: string[];
  confidence: number;
}


const VisitPlace = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<Monument | null>(null);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("default");
  const [isVisited, setIsVisited] = useState(true);
  const [alreadyInAlbum, setAlreadyInAlbum] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [pendingVisited, setPendingVisited] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    albumService.getFolders().then(setFolders).catch(console.error);
  }, []);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImage(result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const openCamera = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      if (photo && photo.dataUrl) {
        setImage(photo.dataUrl);
        setResult(null);
      }
    } catch (error) {
      console.warn("Camera error:", error);
    }
  };

  const openGallery = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
      if (photo && photo.dataUrl) {
        setImage(photo.dataUrl);
        setResult(null);
      }
    } catch (error) {
      console.warn("Gallery error:", error);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setErrorMessage(null);
    setAnalyzing(true);
    setLoading(true);

    try {
      const monument = await visionService.recognizeMonument(image);
      setResult({
        ...monument,
        confidence: Math.min(100, Math.max(60, Math.round(monument.confidence))),
      });

      const inAlbum = await albumService.isInAlbum(monument.name);
      setAlreadyInAlbum(inAlbum);
    } catch (error: any) {
      console.error('Vision error:', error);
      setErrorMessage(
        error?.message || 'Não foi possível reconhecer o monumento. Tente outra imagem.'
      );
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setAnalyzing(false);
    setAlreadyInAlbum(false);
    setSelectedFolder("default");
    setIsVisited(true);
  };

  const handleAddToAlbum = async (folderIdOverride?: string, visitedOverride?: boolean) => {
    if (!result || !image) return;

    const folder = folderIdOverride || selectedFolder;
    const visited = visitedOverride !== undefined ? visitedOverride : isVisited;

    await albumService.addMonument(
      {
        name: result.name,
        location: result.location,
        country: result.country,
        region: result.region,
        century: result.century,
        style: result.style,
        description: result.description,
        history: result.history,
        funFacts: result.funFacts,
        image: image,
        folderId: folder,
      },
      visited
    );

    // Sync challenge progress (discoveries challenge)
    if (visited) {
      challengeService.syncProgress().catch(() => {});
    }

    setAlreadyInAlbum(true);
    setShowAddAlert(false);
  };

  return (
    <IonPage>
      <IonHeader className="visit-header">
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={sparklesOutline} style={{ marginRight: "8px" }} />
            Identificar Monumento
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="visit-content">
        <IonLoading
          isOpen={loading}
          message={analyzing ? "A analisar imagem com IA..." : "A processar..."}
        />

        {!result ? (
          <div className="upload-section">
            <div className="ai-banner">
              <IonIcon icon={sparklesOutline} className="ai-icon" />
              <h2>Inteligência Artificial</h2>
              <p>
                Tire uma foto ou carregue uma imagem de um monumento e a nossa
                IA irá identificá-lo e mostrar informações detalhadas
              </p>
            </div>

            {!image ? (
              <div className="camera-prompt">
                <IonIcon icon={cameraOutline} className="camera-icon" />
                <h3>Capture um Monumento</h3>
                <p>Tire uma foto ou selecione uma imagem da galeria</p>
                <IonButton
                  expand="block"
                  className="camera-button"
                  onClick={openCamera}
                >
                  <IonIcon icon={cameraOutline} slot="start" />
                  Tirar Foto
                </IonButton>
                <IonButton
                  expand="block"
                  className="camera-button"
                  onClick={openGallery}
                >
                  Selecionar da Galeria
                </IonButton>
              </div>
            ) : (
              <div className="preview-section">
                <div className="image-preview-container">
                  <img src={image} alt="Preview" className="preview-image" />
                  <button className="remove-image" onClick={reset}>
                    <IonIcon icon={closeCircleOutline} />
                  </button>
                </div>
                {errorMessage && (
                  <div className="error-message">
                    {errorMessage}
                  </div>
                )}
                <IonButton
                  expand="block"
                  className="analyze-button"
                  onClick={analyzeImage}
                  disabled={analyzing}
                >
                  <IonIcon icon={sparklesOutline} slot="start" />
                  {analyzing ? "A Analisar..." : "Analisar com IA"}
                </IonButton>
                <IonButton
                  expand="block"
                  fill="outline"
                  className="retake-button"
                  onClick={openGallery}
                >
                  Escolher Outra Imagem
                </IonButton>
              </div>
            )}
          </div>
        ) : (
          <div className="result-section">
            {/* Image Result */}
            <div className="result-image">
              <img src={image!} alt={result.name} />
            </div>

            {/* Monument Info */}
            <div className="monument-info">
              <h1 className="monument-name">{result.name}</h1>
              
              <div className="info-tags">
                <span className="tag location-tag">
                  <IonIcon icon={locationOutline} />
                  {result.location}
                </span>
                <span className="tag time-tag">
                  <IonIcon icon={timeOutline} />
                  Século {result.century}
                </span>
                <span className="tag style-tag">
                  {result.style}
                </span>
              </div>

              <IonCard className="info-card">
                <IonCardContent>
                  <div className="info-section">
                    <h3>
                      <IonIcon icon={informationCircleOutline} />
                      Descrição
                    </h3>
                    <p>{result.description}</p>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonCard className="info-card">
                <IonCardContent>
                  <div className="info-section">
                    <h3>
                      <IonIcon icon={timeOutline} />
                      História
                    </h3>
                    <p>{result.history}</p>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonCard className="info-card">
                <IonCardContent>
                  <div className="info-section">
                    <h3>
                      <IonIcon icon={sparklesOutline} />
                      Curiosidades
                    </h3>
                    <ul className="fun-facts">
                      {result.funFacts.map((fact, index) => (
                        <li key={index}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonButton
                expand="block"
                className="new-search-button"
                onClick={reset}
              >
                <IonIcon icon={cameraOutline} slot="start" />
                Analisar Outro Monumento
              </IonButton>

              {!alreadyInAlbum && (
                <IonButton
                  expand="block"
                  color="success"
                  className="add-album-button"
                  onClick={() => setShowAddAlert(true)}
                >
                  <IonIcon icon={addCircleOutline} slot="start" />
                  Adicionar ao Álbum
                </IonButton>
              )}

              {alreadyInAlbum && (
                <div className="already-added">
                  <IonIcon icon={checkmarkCircleOutline} />
                  <span>Já está no seu álbum</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom overlay para adicionar ao álbum */}
        {showAddAlert && (
          <div className="custom-alert-overlay" onClick={() => setShowAddAlert(false)}>
            <div className="custom-alert" onClick={e => e.stopPropagation()}>
              <h3>Adicionar ao Álbum</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Escolha o estado da visita</p>
              <label className="custom-radio">
                <input type="radio" name="visitState" value="visited" checked={pendingVisited} onChange={() => setPendingVisited(true)} />
                Visitado (guarda data automaticamente)
              </label>
              <label className="custom-radio">
                <input type="radio" name="visitState" value="tovisit" checked={!pendingVisited} onChange={() => setPendingVisited(false)} />
                Por Visitar
              </label>
              <div className="custom-alert-buttons">
                <button onClick={() => setShowAddAlert(false)}>Cancelar</button>
                <button className="primary" onClick={() => {
                  setShowAddAlert(false);
                  setShowFolderPicker(true);
                }}>Seguinte</button>
              </div>
            </div>
          </div>
        )}

        {/* Custom overlay para escolher pasta */}
        {showFolderPicker && (
          <div className="custom-alert-overlay" onClick={() => setShowFolderPicker(false)}>
            <div className="custom-alert" onClick={e => e.stopPropagation()}>
              <h3>Escolher Pasta</h3>
              {folders.map(f => (
                <label key={f.id} className="custom-radio">
                  <input
                    type="radio"
                    name="folderPick"
                    value={f.id}
                    checked={selectedFolder === f.id}
                    onChange={() => setSelectedFolder(f.id)}
                  />
                  {f.name}
                </label>
              ))}
              <div className="custom-alert-buttons">
                <button onClick={() => setShowFolderPicker(false)}>Cancelar</button>
                <button className="primary" onClick={() => {
                  setShowFolderPicker(false);
                  handleAddToAlbum(selectedFolder, pendingVisited);
                }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </IonContent>

    </IonPage>
  );
};

export default VisitPlace;
