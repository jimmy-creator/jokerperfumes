import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

function AuthShell({ title, description, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter className="justify-center">{footer}</CardFooter>}
      </Card>
    </div>
  );
}

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token || !email) {
    return (
      <AuthShell title={t('auth.invalidLinkTitle')} description={t('auth.invalidLinkDesc')}>
        <Button asChild className="w-full">
          <Link to="/forgot-password">{t('auth.requestNewLink')}</Link>
        </Button>
      </AuthShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, password });
      setDone(true);
      toast.success(t('auth.passwordResetSuccessToast'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthShell title={t('auth.passwordResetDoneTitle')} description={t('auth.passwordResetDoneDesc')}>
        <Button asChild className="w-full">
          <Link to="/login">{t('auth.loginNow')}</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('auth.setNewPasswordTitle')}
      description={t('auth.setNewPasswordDesc')}
      footer={<Link to="/login" className="text-sm font-medium text-primary hover:underline">{t('auth.backToLogin')}</Link>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t('auth.newPasswordLabel')}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder={t('auth.newPasswordPlaceholder')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">{t('auth.confirmPasswordLabel')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('auth.resetting') : t('auth.resetPasswordButton')}
        </Button>
      </form>
    </AuthShell>
  );
}
