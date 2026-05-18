import { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonLoading,
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/react';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        history.push('/home');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content">
        <div className="login-container">
          <div className="login-header">
            <div className="logo-circle">
              <IonIcon icon={lockClosedOutline} className="logo-icon" />
            </div>
            <h1 className="app-title">MonuVista</h1>
            <p className="app-subtitle">Welcome back! Please login to continue</p>
          </div>

          <IonCard className="login-card">
            <IonCardContent>
              <form onSubmit={handleLogin}>
                <IonItem lines="none" className="input-item">
                  <IonIcon icon={mailOutline} slot="start" className="input-icon" />
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value!)}
                    required
                    className="custom-input"
                  />
                </IonItem>

                <IonItem lines="none" className="input-item">
                  <IonIcon icon={lockClosedOutline} slot="start" className="input-icon" />
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value!)}
                    required
                    className="custom-input"
                  />
                  <IonIcon
                    icon={showPassword ? eyeOffOutline : eyeOutline}
                    slot="end"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  />
                </IonItem>

                {error && (
                  <IonText color="danger" className="error-text">
                    <p>{error}</p>
                  </IonText>
                )}

                <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                  <IonButton 
                    fill="clear" 
                    size="small"
                    onClick={() => history.push('/forgot-password')}
                    style={{ margin: 0, padding: 0 }}
                  >
                    Forgot Password?
                  </IonButton>
                </div>

                <IonButton 
                  expand="block" 
                  type="submit" 
                  disabled={loading} 
                  className="login-button"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </IonButton>

                <div className="divider">
                  <span>or</span>
                </div>

                <IonButton 
                  expand="block" 
                  fill="outline" 
                  onClick={() => history.push('/register')}
                  className="register-button"
                >
                  Create New Account
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
        
        <IonLoading isOpen={loading} message="Logging in..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
