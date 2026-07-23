import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Copy, Check, Link2, MousePointerClick, ShoppingBag, Wallet, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SEO from '../components/SEO';
import { CURRENCY, CurrencySymbol, formatPrice } from '../utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Joker Perfumes';
const STATUS_LABEL = {
  pending: { text: 'Pending review', cls: 'bg-amber-100 text-amber-700' },
  approved: { text: 'Approved', cls: 'bg-emerald-100 text-emerald-700' },
  suspended: { text: 'Suspended', cls: 'bg-rose-100 text-rose-700' },
  rejected: { text: 'Not approved', cls: 'bg-rose-100 text-rose-700' },
};

function Money({ v }) { return <><CurrencySymbol />{formatPrice(v || 0)}</>; }

function StatCard({ icon: Icon, label, children, sub }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="size-4" /></span>
      <p className="mt-3 text-2xl font-extrabold text-foreground">{children}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [payForm, setPayForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [campLabel, setCampLabel] = useState('');

  useEffect(() => {
    if (user && user.role !== 'influencer') { navigate('/', { replace: true }); return; }
    if (user === null) { navigate('/influencer/apply', { replace: true }); return; }
  }, [user, navigate]);

  useEffect(() => {
    api.get('/influencers/me')
      .then((res) => { setMe(res.data); setPayForm({ bankName: res.data.bankName || '', accountName: res.data.accountName || '', iban: res.data.iban || '' }); })
      .catch(() => navigate('/influencer/apply', { replace: true }))
      .finally(() => setLoading(false));
    api.get('/influencers/me/orders').then((r) => setOrders(r.data)).catch(() => {});
    api.get('/influencers/me/payouts').then((r) => setPayouts(r.data)).catch(() => {});
    api.get('/influencers/me/campaigns').then((r) => setCampaigns(r.data)).catch(() => {});
  }, [navigate]);

  if (loading || !me) return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading…</div>;

  const link = `${window.location.origin}/?ref=${me.referralCode}`;
  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); toast.success('Link copied'); setTimeout(() => setCopied(false), 1800); };
  const copyText = (text, label = 'Copied') => { navigator.clipboard.writeText(text); toast.success(label); };
  const campSlug = campLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const campLink = `${window.location.origin}/?ref=${me.referralCode}${campSlug ? `&c=${campSlug}` : ''}`;
  const s = me.stats || {};
  const status = STATUS_LABEL[me.status] || STATUS_LABEL.pending;
  const pendingRequest = payouts.find((p) => p.status === 'requested');

  const requestPayout = async () => {
    setRequesting(true);
    try {
      await api.post('/influencers/me/payout-request');
      toast.success('Payout requested 🎉');
      const [m, p] = await Promise.all([api.get('/influencers/me'), api.get('/influencers/me/payouts')]);
      setMe(m.data); setPayouts(p.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Could not request payout'); }
    finally { setRequesting(false); }
  };

  const savePayout = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put('/influencers/me', payForm); toast.success('Payout details saved'); }
    catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SEO title={`Partner Dashboard — ${STORE_NAME}`} description="Your referral link, orders and earnings." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">Hi {me.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="text-sm text-muted-foreground">Your {STORE_NAME} partner dashboard{s.rank ? ` · Rank #${s.rank} of ${s.totalPartners}` : ''}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${status.cls}`}>{status.text}</span>
      </div>

      {me.status !== 'approved' ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-lg font-bold text-foreground">
            {me.status === 'pending' ? 'Your application is under review' : me.status === 'suspended' ? 'Your account is suspended' : 'Your application was not approved'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {me.status === 'pending' ? "We'll email you once you're approved — then your referral link and earnings appear here." : 'Please contact us if you think this is a mistake.'}
          </p>
        </div>
      ) : (
        <>
          {/* Referral link */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary"><Link2 className="size-4" /> Your referral link</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={link} className="min-w-0 flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm text-foreground" />
              <Button type="button" onClick={copy} className="gap-2 rounded-full">{copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy link'}</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Code <span className="font-bold text-foreground">{me.referralCode}</span>
              {me.discountCoupon && <> · your audience gets {me.discountCoupon.type === 'percentage' ? `${me.discountCoupon.value}% off` : <><Money v={me.discountCoupon.value} /> off</>} with this link</>}
              {' '}· you earn {me.commissionType === 'fixed' ? <><Money v={me.commissionRate} /> per order</> : `${me.commissionRate}% per order`}
            </p>
          </div>

          {/* Campaign link builder */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-bold text-foreground">Build a campaign link</div>
            <p className="mt-1 text-xs text-muted-foreground">Add a label (e.g. instagram-reel, youtube-bio) to track which post drives sales.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input value={campLabel} onChange={(e) => setCampLabel(e.target.value)} placeholder="campaign label" className="sm:w-52" />
              <input readOnly value={campLink} className="min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground" />
              <Button type="button" variant="outline" className="gap-2" onClick={() => copyText(campLink, 'Campaign link copied')}><Copy className="size-4" /> Copy</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={MousePointerClick} label="Clicks">{s.clicks || 0}</StatCard>
            <StatCard icon={ShoppingBag} label="Orders" sub={`${s.conversion || 0}% conversion`}>{s.orders || 0}</StatCard>
            <StatCard icon={TrendingUp} label="Sales driven"><Money v={s.totalSales} /></StatCard>
            <StatCard icon={Wallet} label="Payable now" sub={`Lifetime paid: ${CURRENCY}${formatPrice(s.commissionPaid)}`}><Money v={s.payableBalance} /></StatCard>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> Pending: <Money v={s.commissionPending} /></span>
            <span>Approved: <Money v={s.commissionApproved} /></span>
            <span>Paid out: <Money v={s.paidOut} /></span>
            {pendingRequest ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">Payout of <Money v={pendingRequest.amount} /> requested — pending</span>
            ) : s.payableBalance > 0 ? (
              <Button type="button" size="sm" className="rounded-full" onClick={requestPayout} disabled={requesting}>{requesting ? 'Requesting…' : <>Request payout (<Money v={s.payableBalance} />)</>}</Button>
            ) : null}
          </div>

          {/* Channels */}
          {campaigns.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-bold text-foreground">By channel</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="px-4 py-2.5">Campaign</th><th className="px-4 py-2.5">Clicks</th><th className="px-4 py-2.5">Orders</th><th className="px-4 py-2.5">Conv.</th><th className="px-4 py-2.5">Sales</th><th className="px-4 py-2.5">Commission</th></tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.campaign} className="border-t border-border">
                        <td className="px-4 py-2.5 font-medium capitalize">{c.campaign}</td>
                        <td className="px-4 py-2.5">{c.clicks}</td>
                        <td className="px-4 py-2.5">{c.orders}</td>
                        <td className="px-4 py-2.5">{c.conversion}%</td>
                        <td className="px-4 py-2.5"><Money v={c.sales} /></td>
                        <td className="px-4 py-2.5 font-semibold text-primary"><Money v={c.commission} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Orders */}
          <h2 className="mt-10 text-lg font-bold text-foreground">Your orders</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-2.5">Order</th><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Value</th><th className="px-4 py-2.5">Commission</th><th className="px-4 py-2.5">Status</th></tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders yet — share your link to get started.</td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5"><Money v={o.totalAmount} /></td>
                    <td className="px-4 py-2.5 font-semibold text-primary"><Money v={o.commissionAmount} /></td>
                    <td className="px-4 py-2.5"><span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">{o.commissionStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payouts */}
          {payouts.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-bold text-foreground">Payouts</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Amount</th><th className="px-4 py-2.5">Method</th><th className="px-4 py-2.5">Reference</th><th className="px-4 py-2.5">Status</th></tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-4 py-2.5 text-muted-foreground">{new Date(p.paidAt || p.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5 font-semibold"><Money v={p.amount} /></td>
                        <td className="px-4 py-2.5 capitalize">{p.method || '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.reference || '—'}</td>
                        <td className="px-4 py-2.5"><span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Payout settings */}
          <h2 className="mt-10 text-lg font-bold text-foreground">Payout details</h2>
          <form onSubmit={savePayout} className="mt-3 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">We pay partners by bank transfer. Add your account details so we can send your earnings.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Account holder name</Label><Input value={payForm.accountName} onChange={(e) => setPayForm((f) => ({ ...f, accountName: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Bank name</Label><Input value={payForm.bankName} onChange={(e) => setPayForm((f) => ({ ...f, bankName: e.target.value }))} /></div>
              <div className="grid gap-2 sm:col-span-2"><Label htmlFor="iban">IBAN</Label><Input id="iban" value={payForm.iban} onChange={(e) => setPayForm((f) => ({ ...f, iban: e.target.value }))} placeholder="SA…" /></div>
            </div>
            <Button type="submit" className="mt-4" disabled={saving}>{saving ? 'Saving…' : 'Save details'}</Button>
          </form>
        </>
      )}
    </div>
  );
}
