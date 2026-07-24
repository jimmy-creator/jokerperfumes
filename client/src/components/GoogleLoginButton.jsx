import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';

export default function GoogleLoginButton() {
  const { login: setAuthState } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) return null;

  const handleSuccess = async (credentialResponse) => {
    try {
      const { data } = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      // Cookie is set by server — just store user info and redirect
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (error) {
      showToast(error.response?.data?.message || t('auth.googleLoginFailed'), 'error');
    }
  };

  return (
    <div className="google-login-wrapper">
      <div className="auth-divider">
        <span>{t('auth.orDivider')}</span>
      </div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => showToast(t('auth.googleLoginFailed'), 'error')}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}
