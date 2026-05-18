import { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonLoading } from '@ionic/react';
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
      <IonContent className="auth-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="auth-card">
                <div className="auth-header">
                  <div className="brand-badge">
                    <IonIcon icon={personOutline} />
                  </div>
                  <h1 className="auth-title">Create Account</h1>
                  <p className="auth-subtitle">Join MonuVista today</p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">Full Name</label>
                    <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                      <span className="input-group-text bg-white border-end-0">
                        <IonIcon icon={personOutline} />
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="form-control form-control-lg form-control-brand border-start-0"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">Email</label>
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

                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">Password</label>
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
                        placeholder="Create a password"
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
                        placeholder="Repeat your password"
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

                  <div className="d-grid gap-3 mb-3">
                    <button type="submit" className="btn btn-brand" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>

                  <div className="text-center auth-footer">
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      className="btn btn-link p-0 auth-link"
                      onClick={() => history.push('/login')}
                    >
                      Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <IonLoading isOpen={loading} message="Creating account..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;
