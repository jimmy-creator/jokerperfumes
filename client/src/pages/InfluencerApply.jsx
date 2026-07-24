import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SEO from '../components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Joker Perfumes';

export default function InfluencerApply() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', instagram: '', youtube: '', audienceSize: '', bio: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'influencer') navigate('/influencer/dashboard', { replace: true });
  }, [user, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error(t('partner.errRequiredFields'));
    setLoading(true);
    try {
      const { data } = await api.post('/influencers/apply', form);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(t('partner.applicationSubmitted'));
      navigate('/influencer/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('partner.errGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <SEO title={t('partner.seoApplyTitle', { store: STORE_NAME })} description={t('partner.seoApplyDescription', { store: STORE_NAME })} />
      <section className="rounded-b-[40px] bg-gradient-to-b from-primary/10 via-primary/5 to-background px-4 py-14 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{t('partner.programBadge')}</span>
        <h1 className="mt-4 font-serif text-[clamp(2rem,6vw,3.4rem)] uppercase text-foreground">{t('partner.heroTitle', { store: STORE_NAME })}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">{t('partner.heroSubtitle')}</p>
      </section>

      <div className="mx-auto max-w-lg px-4 py-12">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-foreground">{t('partner.applyHeading')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('partner.applySubheading')}</p>

          <div className="mt-6 space-y-4">
            <div className="grid gap-2"><Label htmlFor="name">{t('partner.labelFullName')}</Label><Input id="name" value={form.name} onChange={set('name')} required /></div>
            <div className="grid gap-2"><Label htmlFor="email">{t('partner.labelEmail')}</Label><Input id="email" type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="grid gap-2"><Label htmlFor="password">{t('partner.labelPassword')}</Label><Input id="password" type="password" value={form.password} onChange={set('password')} minLength={6} required /></div>
            <div className="grid gap-2"><Label htmlFor="phone">{t('partner.labelPhone')}</Label><Input id="phone" value={form.phone} onChange={set('phone')} placeholder={t('partner.phonePlaceholder')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label htmlFor="instagram">{t('partner.labelInstagram')}</Label><Input id="instagram" value={form.instagram} onChange={set('instagram')} placeholder={t('partner.instagramPlaceholder')} /></div>
              <div className="grid gap-2"><Label htmlFor="youtube">{t('partner.labelYoutube')}</Label><Input id="youtube" value={form.youtube} onChange={set('youtube')} placeholder={t('partner.youtubePlaceholder')} /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="audienceSize">{t('partner.labelAudienceSize')}</Label><Input id="audienceSize" value={form.audienceSize} onChange={set('audienceSize')} placeholder={t('partner.audienceSizePlaceholder')} /></div>
            <div className="grid gap-2"><Label htmlFor="bio">{t('partner.labelBio')}</Label>
              <textarea id="bio" value={form.bio} onChange={set('bio')} rows={3} placeholder={t('partner.bioPlaceholder', { store: STORE_NAME })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40" />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? t('partner.submitting') : t('partner.submitApplication')}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('partner.alreadyPartner')} <Link to="/login" className="font-semibold text-primary hover:underline">{t('partner.logIn')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
