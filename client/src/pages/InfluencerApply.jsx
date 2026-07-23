import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SEO from '../components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Joker Perfumes';

export default function InfluencerApply() {
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
    if (!form.name || !form.email || !form.password) return toast.error('Name, email and password are required');
    setLoading(true);
    try {
      const { data } = await api.post('/influencers/apply', form);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Application submitted! 🎉');
      navigate('/influencer/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <SEO title={`Become a ${STORE_NAME} Partner`} description={`Join the ${STORE_NAME} influencer program — share your link and earn commission on every order.`} />
      <section className="rounded-b-[40px] bg-gradient-to-b from-primary/10 via-primary/5 to-background px-4 py-14 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Partner Program</span>
        <h1 className="mt-4 font-serif text-[clamp(2rem,6vw,3.4rem)] uppercase text-foreground">Earn With {STORE_NAME}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">Share your link, your audience gets a discount, and you earn commission on every order. It's that simple.</p>
      </section>

      <div className="mx-auto max-w-lg px-4 py-12">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-foreground">Apply to the program</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tell us a bit about you — we'll review and approve your account.</p>

          <div className="mt-6 space-y-4">
            <div className="grid gap-2"><Label htmlFor="name">Full name *</Label><Input id="name" value={form.name} onChange={set('name')} required /></div>
            <div className="grid gap-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="grid gap-2"><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={form.password} onChange={set('password')} minLength={6} required /></div>
            <div className="grid gap-2"><Label htmlFor="phone">Phone (WhatsApp)</Label><Input id="phone" value={form.phone} onChange={set('phone')} placeholder="+966…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label htmlFor="instagram">Instagram</Label><Input id="instagram" value={form.instagram} onChange={set('instagram')} placeholder="@handle" /></div>
              <div className="grid gap-2"><Label htmlFor="youtube">YouTube</Label><Input id="youtube" value={form.youtube} onChange={set('youtube')} placeholder="channel" /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="audienceSize">Audience size</Label><Input id="audienceSize" value={form.audienceSize} onChange={set('audienceSize')} placeholder="e.g. 25K followers" /></div>
            <div className="grid gap-2"><Label htmlFor="bio">About you</Label>
              <textarea id="bio" value={form.bio} onChange={set('bio')} rows={3} placeholder={`Your niche, content style, why you love ${STORE_NAME}…`} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40" />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit application'}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already a partner? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
