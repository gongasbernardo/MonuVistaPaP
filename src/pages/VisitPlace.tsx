import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonLoading,
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
import authService from "../services/authService";
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
      const language = authService.getLanguage();
      const monument = await visionService.recognizeMonument(image, language);
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
            <IonIcon icon={sparklesOutline} style={{ marginRight: '8px' }} />
            Identificar Monumento
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="visit-content">
        <IonLoading
          isOpen={loading}
          message={analyzing ? 'A analisar imagem com IA...' : 'A processar...'}
        />

        <div className="container py-4">
          {!result ? (
            <div className="visit-card overflow-hidden">
              <div className="visit-banner text-center">
                <IonIcon icon={sparklesOutline} className="ai-icon" />
                <h2>Inteligência Artificial</h2>
                <p>Tire uma foto ou carregue uma imagem de um monumento e a nossa IA irá identificá-lo.</p>
              </div>

              <div className="card-body p-4">
                {!image ? (
                  <div className="text-center">
                    <IonIcon icon={cameraOutline} className="camera-icon" />
                    <h3 className="mb-2">Capture um Monumento</h3>
                    <p className="text-muted mb-4">Tire uma foto ou selecione uma imagem da galeria.</p>
                    <div className="d-grid gap-3">
                      <button type="button" className="btn btn-brand" onClick={openCamera}>
                        <IonIcon icon={cameraOutline} slot="start" />
                        Tirar Foto
                      </button>
                      <button type="button" className="btn btn-outline-brand" onClick={openGallery}>
                        Selecionar da Galeria
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="image-preview-container mb-4">
                      <img src={image} alt="Preview" className="preview-image" />
                      <button className="remove-image" onClick={reset}>
                        <IonIcon icon={closeCircleOutline} />
                      </button>
                    </div>

                    {errorMessage && (
                      <div className="alert alert-warning auth-alert">{errorMessage}</div>
                    )}

                    <div className="d-grid gap-3">
                      <button type="button" className="btn btn-brand" onClick={analyzeImage} disabled={analyzing}>
                        <IonIcon icon={sparklesOutline} slot="start" />
                        {analyzing ? 'A Analisar...' : 'Analisar com IA'}
                      </button>
                      <button type="button" className="btn btn-outline-brand" onClick={openGallery}>
                        Escolher Outra Imagem
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="result-section">
              <div className="visit-card mb-4 overflow-hidden">
                <img src={image!} alt={result.name} className="img-fluid" />
                <div className="card-body">
                  <h1 className="monument-name">{result.name}</h1>
                  <div className="visit-meta">
                    <span className="tag-pill">
                      <IonIcon icon={locationOutline} />
                      {result.location}
                    </span>
                    <span className="tag-pill">
                      <IonIcon icon={timeOutline} />
                      Século {result.century}
                    </span>
                    <span className="tag-pill">
                      {result.style}
                    </span>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="card info-card">
                    <div className="card-body info-section">
                      <h3>
                        <IonIcon icon={informationCircleOutline} />
                        Descrição
                      </h3>
                      <p>{result.description}</p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="card info-card">
                    <div className="card-body info-section">
                      <h3>
                        <IonIcon icon={timeOutline} />
                        História
                      </h3>
                      <p>{result.history}</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card info-card">
                    <div className="card-body info-section">
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
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3 mt-4">
                <button type="button" className="btn btn-brand" onClick={reset}>
                  <IonIcon icon={cameraOutline} slot="start" />
                  Analisar Outro Monumento
                </button>
                {!alreadyInAlbum ? (
                  <button type="button" className="btn btn-secondary-brand" onClick={() => setShowAddAlert(true)}>
                    <IonIcon icon={addCircleOutline} slot="start" />
                    Adicionar ao Álbum
                  </button>
                ) : (
                  <div className="alert alert-success rounded-4 d-flex align-items-center gap-2 p-3">
                    <IonIcon icon={checkmarkCircleOutline} />
                    Já está no seu álbum
                  </div>
                )}
              </div>
            </div>
          )}

          {showAddAlert && (
            <div className="custom-alert-overlay" onClick={() => setShowAddAlert(false)}>
              <div className="custom-alert" onClick={(e) => e.stopPropagation()}>
                <h3>Adicionar ao Álbum</h3>
                <p className="text-muted small mb-3">Escolha o estado da visita</p>
                <label className="custom-radio">
                  <input type="radio" name="visitState" value="visited" checked={pendingVisited} onChange={() => setPendingVisited(true)} />
                  Visitado (guarda data automaticamente)
                </label>
                <label className="custom-radio">
                  <input type="radio" name="visitState" value="tovisit" checked={!pendingVisited} onChange={() => setPendingVisited(false)} />
                  Por Visitar
                </label>
                <div className="custom-alert-buttons">
                  <button type="button" className="btn btn-outline-brand" onClick={() => setShowAddAlert(false)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-brand"
                    onClick={() => {
                      setShowAddAlert(false);
                      setShowFolderPicker(true);
                    }}
                  >
                    Seguinte
                  </button>
                </div>
              </div>
            </div>
          )}

          {showFolderPicker && (
            <div className="custom-alert-overlay" onClick={() => setShowFolderPicker(false)}>
              <div className="custom-alert" onClick={(e) => e.stopPropagation()}>
                <h3>Escolher Pasta</h3>
                {folders.map((f) => (
                  <label key={f.id} className="custom-radio" style={{ marginBottom: '0.75rem' }}>
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
                  <button type="button" className="btn btn-outline-brand" onClick={() => setShowFolderPicker(false)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-brand"
                    onClick={() => {
                      setShowFolderPicker(false);
                      handleAddToAlbum(selectedFolder, pendingVisited);
                    }}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VisitPlace;
