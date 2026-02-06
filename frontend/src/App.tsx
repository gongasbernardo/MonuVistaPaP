import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Album from './pages/Album';
import Community from './pages/Community';
import VisitPlace from './pages/VisitPlace';
import Groups from './pages/Groups';
import Profile from './pages/Profile';
import authService from './services/authService';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const ProtectedRoute: React.FC<{ path: string; exact?: boolean; children: React.ReactNode }> = ({
  path,
  exact,
  children,
}) => (
  <Route exact={exact} path={path}>
    {authService.isAuthenticated() ? children : <Redirect to="/login" />}
  </Route>
);

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>
        <ProtectedRoute exact path="/home">
          <Home />
        </ProtectedRoute>
        <ProtectedRoute exact path="/album">
          <Album />
        </ProtectedRoute>
        <ProtectedRoute exact path="/community">
          <Community />
        </ProtectedRoute>
        <ProtectedRoute exact path="/groups">
          <Groups />
        </ProtectedRoute>
        <ProtectedRoute exact path="/visit">
          <VisitPlace />
        </ProtectedRoute>
        <ProtectedRoute exact path="/profile">
          <Profile />
        </ProtectedRoute>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
