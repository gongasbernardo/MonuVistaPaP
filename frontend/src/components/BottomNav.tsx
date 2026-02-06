import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import {
  homeOutline,
  addCircleOutline,
  albumsOutline,
  peopleOutline,
  sparklesOutline,
  chatbubbleOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import "./BottomNav.css";

const BottomNav = () => {
  const history = useHistory();
  const location = useLocation();

  const navigateTo = (path: string) => {
    if (location.pathname !== path) {
      history.push(path);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <IonTabBar slot="bottom" className="bottom-nav">
      <IonTabButton
        tab="home"
        className={isActive("/home") ? "nav-active" : ""}
        onClick={() => navigateTo("/home")}
      >
        <IonIcon icon={homeOutline} />
        <IonLabel>Início</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="create"
        className={isActive("/create-post") ? "nav-active" : ""}
        onClick={() => navigateTo("/create-post")}
      >
        <IonIcon icon={addCircleOutline} />
        <IonLabel>Criar</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="album"
        className={isActive("/album") ? "nav-active" : ""}
        onClick={() => navigateTo("/album")}
      >
        <IonIcon icon={albumsOutline} />
        <IonLabel>Álbum</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="community"
        className={isActive("/community") ? "nav-active" : ""}
        onClick={() => navigateTo("/community")}
      >
        <IonIcon icon={peopleOutline} />
        <IonLabel>Comunidade</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="groups"
        className={isActive("/groups") ? "nav-active" : ""}
        onClick={() => navigateTo("/groups")}
      >
        <IonIcon icon={chatbubbleOutline} />
        <IonLabel>Grupos</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="visit"
        className={isActive("/visit") ? "nav-active" : ""}
        onClick={() => navigateTo("/visit")}
      >
        <IonIcon icon={sparklesOutline} />
        <IonLabel>Visitar</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default BottomNav;
