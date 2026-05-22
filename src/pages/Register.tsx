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
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const translations = {
    pt: {
      title: 'Criar Conta',
      subtitle: 'Junte-se ao MonuVista hoje',
      fullNameLabel: 'Nome completo',
      fullNamePlaceholder: 'Seu nome completo',
      emailLabel: 'Email',
      emailPlaceholder: 'voce@exemplo.com',
      passwordLabel: 'Senha',
      passwordPlaceholder: 'Crie uma senha',
      confirmPasswordLabel: 'Confirmar senha',
      confirmPasswordPlaceholder: 'Repita sua senha',
      languageLabel: 'Idioma',
      registerButton: 'Registar',
      creatingAccount: 'Criando conta...',
      alreadyHaveAccount: 'Já tem uma conta?',
      loginLink: 'Entrar',
      errorPasswordMismatch: 'As senhas não correspondem',
      errorPasswordLength: 'A senha deve ter pelo menos 6 caracteres',
      errorSubmit: 'Ocorreu um erro ao registar',
    },
    en: {
      title: 'Create Account',
      subtitle: 'Join MonuVista today',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Repeat your password',
      languageLabel: 'Language',
      registerButton: 'Register',
      creatingAccount: 'Creating account...',
      alreadyHaveAccount: 'Already have an account?',
      loginLink: 'Login',
      errorPasswordMismatch: 'Passwords do not match',
      errorPasswordLength: 'Password must be at least 6 characters',
      errorSubmit: 'An error occurred while registering',
    },
    es: {
      title: 'Crear Cuenta',
      subtitle: 'Únete a MonuVista hoy',
      fullNameLabel: 'Nombre completo',
      fullNamePlaceholder: 'Tu nombre completo',
      emailLabel: 'Correo',
      emailPlaceholder: 'tu@ejemplo.com',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Crea una contraseña',
      confirmPasswordLabel: 'Confirmar contraseña',
      confirmPasswordPlaceholder: 'Repite tu contraseña',
      languageLabel: 'Idioma',
      registerButton: 'Registrar',
      creatingAccount: 'Creando cuenta...',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      loginLink: 'Iniciar sesión',
      errorPasswordMismatch: 'Las contraseñas no coinciden',
      errorPasswordLength: 'La contraseña debe tener al menos 6 caracteres',
      errorSubmit: 'Ocurrió un error al registrar',
    },
  };

  const t = translations[language];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.errorPasswordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.errorPasswordLength);
      return;
    }

    setLoading(true);

    try {
      console.log('[Register] Starting registration with:', { email, name, language });
      const response = await authService.register({ name, email, password, language });
      console.log('[Register] Response received:', response);
      console.log('[Register] Response structure:', {
        hasSuccess: 'success' in response,
        hasToken: 'token' in response,
        hasUser: 'user' in response,
        successValue: response?.success,
        tokenValue: !!response?.token,
        userValue: !!response?.user,
      });

      // Check if registration was successful
      if (response && (response.success || response.token || response.user)) {
        console.log('[Register] ✅ Registration successful!');
        authService.setLanguage(language);
        
        // If we have a token, go to home; otherwise go to login
        setTimeout(() => {
          if (response.token) {
            console.log('[Register] Navigating to /home with token');
            history.push('/home');
          } else {
            console.log('[Register] Navigating to /login (no token)');
            history.push('/login');
          }
        }, 500);
      } else {
        console.error('[Register] ❌ Unexpected response format:', response);
        const errorMessage = response?.message || t.errorSubmit;
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('[Register] ❌ Error caught:', err);
      console.error('[Register] Error details:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        message: err?.message,
        responseData: err?.response?.data,
      });
      const errorMsg = err?.response?.data?.message || err?.message || t.errorSubmit;
      setError(errorMsg);
    } finally {
      console.log('[Register] Finally block - setting loading to false');
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
                  <h1 className="auth-title">{t.title}</h1>
                  <p className="auth-subtitle">{t.subtitle}</p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">{t.fullNameLabel}</label>
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
                        placeholder={t.fullNamePlaceholder}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">{t.emailLabel}</label>
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
                        placeholder={t.emailPlaceholder}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">{t.languageLabel}</label>
                    <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'pt' | 'en' | 'es')}
                        className="form-control form-control-lg form-control-brand border-start-0"
                      >
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-uppercase text-muted fw-bold small">{t.passwordLabel}</label>
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
                        placeholder={t.passwordPlaceholder}
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
                    <label className="form-label text-uppercase text-muted fw-bold small">{t.confirmPasswordLabel}</label>
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
                        placeholder={t.confirmPasswordPlaceholder}
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
                      {loading ? t.creatingAccount : t.registerButton}
                    </button>
                  </div>

                  <div className="text-center auth-footer">
                    <span>{t.alreadyHaveAccount} </span>
                    <button
                      type="button"
                      className="btn btn-link p-0 auth-link"
                      onClick={() => history.push('/login')}
                    >
                      {t.loginLink}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <IonLoading isOpen={loading} message={t.creatingAccount} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
