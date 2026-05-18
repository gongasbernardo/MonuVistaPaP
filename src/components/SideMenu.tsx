import { IonBackdrop, IonIcon } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import {
  homeOutline,
  albumsOutline,
  peopleOutline,
  chatbubbleOutline,
  sparklesOutline,
  personOutline,
  closeOutline,
} from "ionicons/icons";
import "./SideMenu.css";

const NAV_LINKS = [
  { path: "/home", label: "Início", icon: homeOutline },
  { path: "/album", label: "Álbum", icon: albumsOutline },
  { path: "/community", label: "Comunidade", icon: peopleOutline },
  { path: "/groups", label: "Grupos", icon: chatbubbleOutline },
  { path: "/visit", label: "Visitar", icon: sparklesOutline },
  { path: "/profile", label: "Perfil", icon: personOutline },
];

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const history = useHistory();
  const location = useLocation();

  const navigateTo = (path: string) => {
    if (location.pathname !== path) {
      history.push(path);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <IonBackdrop visible={true} onIonBackdropTap={onClose} />
      <div className="side-menu">
        <div className="side-menu-header">
          <h3>Navegação</h3>
          <button className="close-button" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </button>
        </div>
        <div className="side-menu-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              className={`side-menu-link ${location.pathname === link.path ? "active" : ""}`}
              onClick={() => navigateTo(link.path)}
            >
              <IonIcon icon={link.icon} />
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideMenu;