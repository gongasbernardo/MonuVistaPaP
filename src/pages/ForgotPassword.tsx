import { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonLoading } from '@ionic/react';
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
      <IonContent className="auth-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="auth-card">
                <div className="auth-header">
                  <div className="brand-badge">
                    <IonIcon icon={lockClosedOutline} />
                  </div>
                  <h1 className="auth-title">MonuVista</h1>
                  <p className="auth-subtitle">
                    {step === 'email'
                      ? 'Enter your email to reset your password'
                      : 'Enter the reset token and create a new password'}
                  </p>
                </div>

                <form onSubmit={step === 'email' ? handleRequestReset : handleResetPassword}>
                  {step === 'email' ? (
                    <div className="mb-4">
                      <label className="form-label text-uppercase text-muted fw-bold small">Email Address</label>
                      <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-end-0">
                          <IonIcon icon={mailOutline} />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="form-control form-control-lg form-control-brand border-start-0"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="form-label text-uppercase text-muted fw-bold small">Reset Token</label>
                        <input
                          type="text"
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          required
                          className="form-control form-control-lg form-control-brand"
                          placeholder="Paste token from email"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-uppercase text-muted fw-bold small">New Password</label>
                        <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                          <span className="input-group-text bg-white border-end-0">
                            <IonIcon icon={lockClosedOutline} />
                          </span>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="form-control form-control-lg form-control-brand border-start-0"
                            placeholder="New password"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-uppercase text-muted fw-bold small">Confirm Password</label>
                        <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                          <span className="input-group-text bg-white border-end-0">
                            <IonIcon icon={lockClosedOutline} />
                          </span>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="form-control form-control-lg form-control-brand border-start-0"
                            placeholder="Confirm password"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="alert alert-danger auth-alert" role="alert">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="alert alert-success auth-alert" role="alert">
                      {successMessage}
                    </div>
                  )}

                  <div className="d-grid gap-3">
                    <button type="submit" className="btn btn-brand" disabled={loading}>
                      {step === 'email'
                        ? loading ? 'Sending...' : 'Send Reset Link'
                        : loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    {step === 'reset' && (
                      <button
                        type="button"
                        className="btn btn-outline-brand"
                        onClick={() => {
                          setStep('email');
                          setResetToken('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setError('');
                          setSuccessMessage('');
                        }}
                      >
                        Back to Email
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <IonLoading isOpen={loading} />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
