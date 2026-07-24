import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
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

export default function Register() {
  const { user, register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  // Already signed in — never show the register page to authenticated users
  // (back button, manual URL, etc.); send them home instead.
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success(t('auth.accountCreatedToast'));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">{t('auth.registerTitle')}</CardTitle>
          <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t('auth.fullNameLabel')}</Label>
              <Input id="name" autoComplete="name" value={form.name} onChange={set('name')} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t('auth.emailLabel')}</Label>
              <Input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPasswordLabel')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.creating') : t('auth.createAccountButton')}
            </Button>
          </form>
          <GoogleLoginButton />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t('auth.loginLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
