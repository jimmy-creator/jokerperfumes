import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success(t('auth.resetLinkSentToast'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <Card>
        {sent ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">{t('auth.checkEmailTitle')}</CardTitle>
              <CardDescription>
                {t('auth.checkEmailDescPrefix')} <strong className="text-foreground">{email}</strong>.
                {' '}{t('auth.checkEmailDescSuffix')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              {t('auth.didntReceive')}{' '}
              <button onClick={() => setSent(false)} className="font-medium text-primary hover:underline">
                {t('auth.tryAgain')}
              </button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">{t('auth.forgotPasswordTitle')}</CardTitle>
              <CardDescription>{t('auth.forgotPasswordSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t('auth.emailAddressLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.sending') : t('auth.sendResetLink')}
                </Button>
              </form>
            </CardContent>
          </>
        )}
        <CardFooter className="justify-center">
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">{t('auth.backToLogin')}</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
