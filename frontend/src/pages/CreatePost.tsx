import React, { useState, useRef } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonLoading,
} from "@ionic/react";
import { arrowBackOutline, imageOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService";
import challengeService from "../services/challengeService";
import { API_URL } from "../config";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "../constants/locations";
import "./CreatePost.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !location || !country || !region || !image) {
      setError("Por favor preencha todos os campos");
      return;
    }

    if (title.length > 100) {
      setError("Título não pode ter mais de 100 caracteres");
      return;
    }

    if (description.length > 1000) {
      setError("Descrição não pode ter mais de 1000 caracteres");
      return;
    }

    try {
      setLoading(true);
      const token = authService.getToken();

      const response = await axios.post(
        `${API_URL}/api/posts`,
        {
          title,
          description,
          location,
          country,
          region,
          image,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Sync challenge progress (posts challenge)
        await challengeService.syncProgress().catch(() => {});
        // Redirect to community or home
        history.push("/home");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar publicação");
    } finally {
      setLoading(false);
    }
  };

  const availableRegions = country
    ? REGIONS_BY_COUNTRY[country] || []
    : [];

  return (
    <IonPage>
      <IonHeader className="create-post-header">
        <IonToolbar>
          <IonButton fill="clear" slot="start" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle>Nova Publicação</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="create-post-content">
        <form onSubmit={handleSubmit} className="create-post-form">
          {/* IMAGE UPLOAD */}
          <div className="image-upload-section">
            {imagePreview ? (
              <div
                className="image-preview"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={imagePreview} alt="Preview" />
                <div className="image-overlay">
                  <IonIcon icon={imageOutline} />
                  <p>Alterar Foto</p>
                </div>
              </div>
            ) : (
              <div
                className="image-upload-box"
                onClick={() => fileInputRef.current?.click()}
              >
                <IonIcon icon={imageOutline} />
                <p>Seleccionar Foto</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          {/* TITLE */}
          <div className="form-group">
            <label>Título da Estrutura</label>
            <IonInput
              value={title}
              onIonChange={(e) => setTitle(e.detail.value || "")}
              placeholder="Ex: Torre de Belém"
              maxlength={100}
              className="form-input"
            />
            <p className="char-count">{title.length}/100</p>
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Descrição</label>
            <IonTextarea
              value={description}
              onIonChange={(e) => setDescription(e.detail.value || "")}
              placeholder="Descreva a estrutura, sua história e importância..."
              maxlength={1000}
              rows={5}
              className="form-textarea"
            />
            <p className="char-count">{description.length}/1000</p>
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>Localização (Local Específico)</label>
            <IonInput
              value={location}
              onIonChange={(e) => setLocation(e.detail.value || "")}
              placeholder="Ex: Lisbon, Belém"
              className="form-input"
            />
          </div>

          {/* COUNTRY */}
          <div className="form-group">
            <label>País</label>
            <IonSelect
              value={country}
              onIonChange={(e) => {
                setCountry(e.detail.value);
                setRegion(""); // Reset region when country changes
              }}
              placeholder="Seleccione um país"
              className="form-select"
            >
              {COUNTRIES.map((c) => (
                <IonSelectOption key={c} value={c}>
                  {c}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* REGION */}
          <div className="form-group">
            <label>Região</label>
            <IonSelect
              value={region}
              onIonChange={(e) => setRegion(e.detail.value)}
              placeholder={
                country
                  ? "Seleccione uma região"
                  : "Seleccione um país primeiro"
              }
              disabled={!country}
              className="form-select"
            >
              {availableRegions.map((r) => (
                <IonSelectOption key={r} value={r}>
                  {r}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* ERROR MESSAGE */}
          {error && <div className="error-message">{error}</div>}

          {/* SUBMIT BUTTON */}
          <div className="button-group">
            <IonButton
              expand="block"
              className="submit-button"
              type="submit"
              disabled={loading}
            >
              Publicar
            </IonButton>
          </div>
        </form>
      </IonContent>

      <IonLoading isOpen={loading} message="A publicar..." />
    </IonPage>
  );
};

export default CreatePost;
