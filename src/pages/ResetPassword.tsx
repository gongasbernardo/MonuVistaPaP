import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonIcon, IonLoading } from '@ionic/react';
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
      <IonContent className="auth-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="auth-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <button
                    type="button"
                    className="btn btn-link text-brand p-0"
                    onClick={() => history.push('/login')}
                  >
                    <IonIcon icon={arrowBack} /> Back
                  </button>
                </div>

                <div className="auth-header">
                  <div className="brand-badge">
                    <IonIcon icon={lockClosedOutline} />
                  </div>
                  <h1 className="auth-title">Reset Password</h1>
                  <p className="auth-subtitle">Enter your new password below to continue.</p>
                </div>

                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">New Password</label>
                    <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                      <span className="input-group-text bg-white border-end-0">
                        <IonIcon icon={lockClosedOutline} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-control form-control-lg form-control-brand border-start-0"
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        className="btn btn-link text-secondary px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">Confirm Password</label>
                    <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                      <span className="input-group-text bg-white border-end-0">
                        <IonIcon icon={lockClosedOutline} />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="form-control form-control-lg form-control-brand border-start-0"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="btn btn-link text-secondary px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger auth-alert" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success auth-alert" role="alert">
                      {success}
                    </div>
                  )}

                  <div className="d-grid gap-3">
                    <button type="submit" className="btn btn-brand" disabled={loading || !token}>
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
      <IonLoading isOpen={loading} message="Resetting password..." />
    </IonPage>
  );
};

export default ResetPassword;