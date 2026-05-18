import { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonLoading } from '@ionic/react';
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
                  <p className="auth-subtitle">Welcome back! Please login to continue</p>
                </div>

                <form onSubmit={handleLogin} className="mb-0">
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

                  <div className="mb-3">
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
                        placeholder="Enter your password"
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

                  {error && (
                    <div className="alert alert-danger auth-alert" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="d-flex justify-content-end mb-4">
                    <button
                      type="button"
                      className="btn btn-link p-0 auth-link"
                      onClick={() => history.push('/forgot-password')}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="d-grid gap-3">
                    <button type="submit" className="btn btn-brand" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-brand"
                      onClick={() => history.push('/register')}
                    >
                      Create New Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <IonLoading isOpen={loading} message="Logging in..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
