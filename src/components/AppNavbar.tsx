import { useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
} from "@ionic/react";
import {
  menuOutline,
  closeOutline,
  homeOutline,
  albumsOutline,
  peopleOutline,
  chatbubbleOutline,
  sparklesOutline,
  personOutline,
  searchOutline,
} from "ionicons/icons";
import { Link, useLocation } from "react-router-dom";
import SearchModal from "./SearchModal";
import NotificationBell from "./NotificationBell";
import "./AppNavbar.css";

const NAV_LINKS = [
  { path: "/home", label: "Início", icon: homeOutline },
  { path: "/album", label: "Álbum", icon: albumsOutline },
  { path: "/community", label: "Comunidade", icon: peopleOutline },
  { path: "/users", label: "Utilizadores", icon: searchOutline },
  { path: "/chats", label: "Chats", icon: chatbubbleOutline },
  { path: "/groups", label: "Grupos", icon: chatbubbleOutline },
  { path: "/visit", label: "Visitar", icon: sparklesOutline },
  { path: "/profile", label: "Perfil", icon: personOutline },
];

const AppNavbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  if (isAuthRoute) {
    return null;
  }

  return (
    <>
      <IonHeader className="app-navbar-header">
        <IonToolbar>
          <IonButton
            fill="clear"
            slot="start"
            onClick={() => setMenuOpen(!menuOpen)}
            className="menu-toggle-button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <IonIcon icon={menuOpen ? closeOutline : menuOutline} />
          </IonButton>
          <IonTitle className="navbar-title">
            <span className="title-main">MonuVista</span>
          </IonTitle>
          <div className="navbar-actions">
            <NotificationBell />
            <IonButton
              fill="clear"
              onClick={() => setSearchOpen(true)}
              className="search-button"
              aria-label="Buscar"
            >
              <IonIcon icon={searchOutline} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      {menuOpen && (
        <div className="app-navbar-overlay" onClick={() => setMenuOpen(false)}>
          <div className="app-navbar-menu" onClick={(event) => event.stopPropagation()}>
            <div className="app-navbar-menu-header">
              <h3>Navegação</h3>
              <IonButton
                fill="clear"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>
            <div className="app-navbar-links">
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`app-navbar-link ${location.pathname === link.path ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <IonIcon icon={link.icon} />
                  <span>{link.label}</span>
                  {location.pathname === link.path && (
                    <IonIcon icon="✓" className="active-indicator" />
                  )}
                </Link>
              ))}
            </div>

            <div className="menu-footer">
              <p className="menu-footer-text">
                Explore monumentos portugueses
              </p>
            </div>
          </div>
        </div>
      )}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default AppNavbar;
