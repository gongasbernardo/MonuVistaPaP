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
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css';

const ForgotPassword: React.FC = () => {
  const history = useHistory();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccessMessage('Reset token sent! Enter it below to reset your password.');
        setStep('reset');
      } else {
        setError(response.message || 'Failed to request password reset');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(resetToken, newPassword);
      
      if (response.success) {
        setSuccessMessage(response.message);
        setTimeout(() => {
          history.push('/login');
        }, 2000);
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
      <IonContent className="login-content">
        <div className="login-container">
          <div className="login-header">
            <div className="logo-circle">
              <IonIcon icon={lockClosedOutline} className="logo-icon" />
            </div>
            <h1 className="app-title">MonuVista</h1>
            <p className="app-subtitle">
              {step === 'email' 
                ? 'Enter your email to reset your password'
                : 'Enter the reset token and new password'
              }
            </p>
          </div>

          <IonCard className="login-card">
            <IonCardContent>
              {step === 'email' ? (
                <form onSubmit={handleRequestReset}>
                  <IonItem lines="none" className="input-item">
                    <IonIcon icon={mailOutline} slot="start" className="input-icon" />
                    <IonLabel position="floating">Email Address</IonLabel>
                    <IonInput
                      type="email"
                      value={email}
                      onIonChange={(e) => setEmail(e.detail.value!)}
                      required
                      className="custom-input"
                    />
                  </IonItem>

                  {error && (
                    <IonText color="danger" className="error-text">
                      <p>{error}</p>
                    </IonText>
                  )}

                  {successMessage && (
                    <IonText color="success" className="error-text">
                      <p>{successMessage}</p>
                    </IonText>
                  )}

                  <IonButton 
                    expand="block" 
                    type="submit" 
                    disabled={loading} 
                    className="login-button"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </IonButton>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <IonItem lines="none" className="input-item">
                    <IonLabel position="floating">Reset Token</IonLabel>
                    <IonInput
                      type="text"
                      value={resetToken}
                      onIonChange={(e) => setResetToken(e.detail.value!)}
                      required
                      className="custom-input"
                      placeholder="Paste token from email"
                    />
                  </IonItem>

                  <IonItem lines="none" className="input-item">
                    <IonIcon icon={lockClosedOutline} slot="start" className="input-icon" />
                    <IonLabel position="floating">New Password</IonLabel>
                    <IonInput
                      type="password"
                      value={newPassword}
                      onIonChange={(e) => setNewPassword(e.detail.value!)}
                      required
                      className="custom-input"
                    />
                  </IonItem>

                  <IonItem lines="none" className="input-item">
                    <IonIcon icon={lockClosedOutline} slot="start" className="input-icon" />
                    <IonLabel position="floating">Confirm Password</IonLabel>
                    <IonInput
                      type="password"
                      value={confirmPassword}
                      onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                      required
                      className="custom-input"
                    />
                  </IonItem>

                  {error && (
                    <IonText color="danger" className="error-text">
                      <p>{error}</p>
                    </IonText>
                  )}

                  {successMessage && (
                    <IonText color="success" className="error-text">
                      <p>{successMessage}</p>
                    </IonText>
                  )}

                  <IonButton 
                    expand="block" 
                    type="submit" 
                    disabled={loading} 
                    className="login-button"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </IonButton>

                  <IonButton 
                    expand="block" 
                    fill="outline"
                    onClick={() => {
                      setStep('email');
                      setResetToken('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="register-button"
                  >
                    Back to Email
                  </IonButton>
                </form>
              )}
            </IonCardContent>
          </IonCard>
        </div>
        
        <IonLoading isOpen={loading} />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
