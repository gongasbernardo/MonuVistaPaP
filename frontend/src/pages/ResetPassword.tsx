import { useState, useEffect } from 'react';
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
  IonIcon,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/react';
import { lockClosedOutline, eyeOutline, eyeOffOutline, arrowBack } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import authService from '../services/authService';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
  const history = useHistory();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset token');
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

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
      const response = await authService.resetPassword(token, password);

      if (response.success) {
        setSuccess('Password reset successfully! You can now log in with your new password.');
        setTimeout(() => {
          history.push('/login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="reset-header">
        <IonToolbar color="transparent">
          <IonButtons slot="start">
            <IonButton onClick={() => history.push('/login')} className="back-button">
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Reset Password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="reset-content">
        <div className="reset-container">
          <div className="reset-header-content">
            <div className="logo-circle">
              <IonIcon icon={lockClosedOutline} className="logo-icon" />
            </div>
            <h1 className="app-title">Reset Password</h1>
            <p className="app-subtitle">Enter your new password</p>
          </div>

          <IonCard className="reset-card">
            <IonCardContent>
              <form onSubmit={handleResetPassword}>
                <IonItem lines="none" className="input-item">
                  <IonIcon icon={lockClosedOutline} slot="start" className="input-icon" />
                  <IonLabel position="floating">New Password</IonLabel>
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
                  <IonLabel position="floating">Confirm New Password</IonLabel>
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
                  <IonText color="danger" className="error-message">
                    <p>{error}</p>
                  </IonText>
                )}

                {success && (
                  <IonText color="success" className="success-message">
                    <p>{success}</p>
                  </IonText>
                )}

                <IonButton
                  expand="block"
                  type="submit"
                  className="reset-button"
                  disabled={loading || !token}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
      <IonLoading isOpen={loading} message="Resetting password..." />
    </IonPage>
  );
};

export default ResetPassword;