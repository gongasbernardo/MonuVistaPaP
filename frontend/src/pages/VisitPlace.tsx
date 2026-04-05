import React, { useState, useRef, useEffect } from "react";
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
import albumService, { Folder } from "../services/albumService";
import challengeService from "../services/challengeService";
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

// Simulação de base de dados de monumentos
const MONUMENTS_DATABASE: Monument[] = [
  {
    name: "Torre de Belém",
    location: "Belém, Lisboa",
    country: "Portugal",
    region: "Lisboa",
    century: "XVI",
    style: "Manuelino",
    description: "Fortificação construída no século XVI para defesa da barra do Tejo.",
    history: "Construída entre 1514 e 1519 por ordem de D. Manuel I, a torre serviu como sistema defensivo da entrada do rio Tejo e como ponto de partida para os navegadores portugueses. É considerada um dos exemplos mais emblemáticos da arquitetura manuelina.",
    funFacts: [
      "É Património Mundial da UNESCO desde 1983",
      "Foi prisão política durante o regime absolutista",
      "Possui elementos decorativos únicos como cordas esculpidas em pedra",
      "A torre tem 30 metros de altura"
    ],
    confidence: 95,
  },
  {
    name: "Castelo de São Jorge",
    location: "Lisboa",
    country: "Portugal",
    region: "Lisboa",
    century: "XI",
    style: "Medieval",
    description: "Castelo medieval que domina a colina mais alta de Lisboa.",
    history: "Construído pelos mouros no século XI, o castelo foi conquistado por D. Afonso Henriques em 1147. Serviu como residência real até ao século XVI e sofreu grandes danos no terramoto de 1755. Foi restaurado no século XX.",
    funFacts: [
      "Oferece vistas panorâmicas de 360° sobre Lisboa",
      "Abriga ruínas que datam do século VII a.C.",
      "Os jardins têm pavões selvagens",
      "Foi palácio real durante 400 anos"
    ],
    confidence: 92,
  },
  {
    name: "Mosteiro dos Jerónimos",
    location: "Belém, Lisboa",
    country: "Portugal",
    region: "Lisboa",
    century: "XVI",
    style: "Manuelino",
    description: "Magnífico mosteiro que representa o auge da arte manuelina.",
    history: "Mandado construir por D. Manuel I em 1501, financiado com ouro do comércio de especiarias. Demorou 100 anos a construir e é um dos mais importantes exemplos da arquitetura manuelina. Alberga os túmulos de Vasco da Gama e Luís de Camões.",
    funFacts: [
      "Património Mundial da UNESCO",
      "Sobreviveu ao terramoto de 1755 quase intacto",
      "A igreja tem 25 metros de altura",
      "Foi convento da Ordem de São Jerónimo durante 400 anos"
    ],
    confidence: 94,
  },
  {
    name: "Torre dos Clérigos",
    location: "Porto",
    country: "Portugal",
    region: "Porto",
    century: "XVIII",
    style: "Barroco",
    description: "Icónica torre barroca e um dos símbolos da cidade do Porto.",
    history: "Construída entre 1754 e 1763 pelo arquiteto Nicolau Nasoni, a Torre dos Clérigos é o ponto mais alto do Porto. Com 76 metros de altura, foi durante muito tempo o edifício mais alto de Portugal.",
    funFacts: [
      "Tem 240 degraus até ao topo",
      "Os sinos tocam de hora a hora",
      "Foi o primeiro edifício barroco oval em Portugal",
      "Nasoni está enterrado na igreja dos Clérigos"
    ],
    confidence: 91,
  },
  {
    name: "Palácio da Pena",
    location: "Sintra",
    country: "Portugal",
    region: "Lisboa",
    century: "XIX",
    style: "Romântico",
    description: "Palácio colorido no topo da Serra de Sintra, obra-prima do Romantismo.",
    history: "Construído em 1854 por ordem do rei D. Fernando II sobre as ruínas de um antigo mosteiro. Combina diversos estilos arquitetónicos como gótico, manuelino, mourisco e renascentista. As suas cores vibrantes e localização única fazem dele um dos monumentos mais fotografados de Portugal.",
    funFacts: [
      "Foi escolhido como uma das Sete Maravilhas de Portugal",
      "As cores originais eram ocre e vermelho",
      "Está a 500 metros de altitude",
      "Foi a última residência da família real portuguesa"
    ],
    confidence: 93,
  },
  {
    name: "Aqueduto das Águas Livres",
    location: "Lisboa",
    country: "Portugal",
    region: "Lisboa",
    century: "XVIII",
    style: "Barroco",
    description: "Impressionante aqueduto com 58 km de extensão total.",
    history: "Construído entre 1731 e 1799 para levar água potável a Lisboa. A sua arcada monumental sobre o Vale de Alcântara tem 35 arcos, sendo o maior com 65 metros de altura. Sobreviveu ao terramoto de 1755.",
    funFacts: [
      "O arco maior tem 65 metros de altura",
      "Transportou água para Lisboa até 1967",
      "Ficou conhecido pelos crimes do 'Diogo Alves'",
      "É possível caminhar sobre o aqueduto em visitas guiadas"
    ],
    confidence: 89,
  },
];

const VisitPlace = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Monument | null>(null);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("default");
  const [isVisited, setIsVisited] = useState(true);
  const [alreadyInAlbum, setAlreadyInAlbum] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [pendingVisited, setPendingVisited] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    albumService.getFolders().then(setFolders).catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setAnalyzing(true);
    setLoading(true);

    // Simular processamento de IA (2-3 segundos)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Selecionar um monumento aleatório da base de dados
    const randomIndex = Math.floor(Math.random() * MONUMENTS_DATABASE.length);
    const monument = MONUMENTS_DATABASE[randomIndex];

    // Adicionar pequena variação na confiança
    const confidence = monument.confidence + (Math.random() * 5 - 2.5);
    
    setResult({
      ...monument,
      confidence: Math.min(99, Math.max(85, Math.round(confidence))),
    });
    
    // Verificar se já está no álbum
    const inAlbum = await albumService.isInAlbum(monument.name);
    setAlreadyInAlbum(inAlbum);
    
    setAnalyzing(false);
    setLoading(false);
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

  const takePhoto = () => {
    fileInputRef.current?.click();
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
                  onClick={takePhoto}
                >
                  <IonIcon icon={cameraOutline} slot="start" />
                  Tirar Foto / Selecionar Imagem
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
                  onClick={takePhoto}
                >
                  Escolher Outra Imagem
                </IonButton>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div className="result-section">
            {/* Image Result */}
            <div className="result-image">
              <img src={image!} alt={result.name} />
              <div className="confidence-badge">
                <IonIcon icon={sparklesOutline} />
                {result.confidence}% confiança
              </div>
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
