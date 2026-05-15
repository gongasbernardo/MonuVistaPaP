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
import { personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import authService from '../services/authService';
import './Register.css';

const Register: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({ name, email, password });
      
      if (response.success) {
        history.push('/home');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="register-content">
        <div className="register-container">
          <div className="register-header-content">
            <div className="logo-circle">
              <IonIcon icon={personOutline} className="logo-icon" />
            </div>
            <h1 className="app-title">Create Account</h1>
            <p className="app-subtitle">Join MonuVista today</p>
          </div>

          <IonCard className="register-card">
            <IonCardContent>
              <form onSubmit={handleRegister}>
                <IonItem lines="none" className="input-item">
                  <IonIcon icon={personOutline} slot="start" className="input-icon" />
                  <IonLabel position="floating">Full Name</IonLabel>
                  <IonInput
                    type="text"
                    value={name}
                    onIonChange={(e) => setName(e.detail.value!)}
                    required
                    className="custom-input"
                  />
                </IonItem>

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

                <IonItem lines="none" className="input-item">
                  <IonIcon icon={lockClosedOutline} slot="start" className="input-icon" />
                  <IonLabel position="floating">Confirm Password</IonLabel>
                  <IonInput
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                    required
                    className="custom-input"
                  />
                  <IonIcon
                    icon={showConfirmPassword ? eyeOffOutline : eyeOutline}
                    slot="end"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  />
                </IonItem>

                {error && (
                  <IonText color="danger" className="error-text">
                    <p>{error}</p>
                  </IonText>
                )}

                <IonButton 
                  expand="block" 
                  type="submit" 
                  disabled={loading} 
                  className="register-button-submit"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </IonButton>

                <div className="login-link">
                  <span>Already have an account? </span>
                  <IonButton fill="clear" onClick={() => history.push('/login')} className="login-link-button">
                    Login
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
        
        <IonLoading isOpen={loading} message="Creating account..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;
