import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  pending: { textKey: 'partner.statusPending', cls: 'bg-amber-100 text-amber-700' },
  approved: { textKey: 'partner.statusApproved', cls: 'bg-emerald-100 text-emerald-700' },
  suspended: { textKey: 'partner.statusSuspended', cls: 'bg-rose-100 text-rose-700' },
  rejected: { textKey: 'partner.statusRejected', cls: 'bg-rose-100 text-rose-700' },
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
  const { t } = useTranslation();
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

  if (loading || !me) return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">{t('partner.loading')}</div>;

  const link = `${window.location.origin}/?ref=${me.referralCode}`;
  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); toast.success(t('partner.linkCopied')); setTimeout(() => setCopied(false), 1800); };
  const copyText = (text, label) => { navigator.clipboard.writeText(text); toast.success(label); };
  const campSlug = campLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const campLink = `${window.location.origin}/?ref=${me.referralCode}${campSlug ? `&c=${campSlug}` : ''}`;
  const s = me.stats || {};
  const status = STATUS_LABEL[me.status] || STATUS_LABEL.pending;
  const pendingRequest = payouts.find((p) => p.status === 'requested');

  const requestPayout = async () => {
    setRequesting(true);
    try {
      await api.post('/influencers/me/payout-request');
      toast.success(t('partner.payoutRequested'));
      const [m, p] = await Promise.all([api.get('/influencers/me'), api.get('/influencers/me/payouts')]);
      setMe(m.data); setPayouts(p.data);
    } catch (e) { toast.error(e.response?.data?.message || t('partner.errCouldNotRequestPayout')); }
    finally { setRequesting(false); }
  };

  const savePayout = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put('/influencers/me', payForm); toast.success(t('partner.payoutDetailsSaved')); }
    catch (err) { toast.error(err.response?.data?.message || t('partner.errSaveFailed')); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SEO title={t('partner.seoDashboardTitle', { store: STORE_NAME })} description={t('partner.seoDashboardDescription')} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{t('partner.greeting', { name: me.name?.split(' ')[0] || t('partner.greetingFallbackName') })}</h1>
          <p className="text-sm text-muted-foreground">{t('partner.dashboardSubtitle', { store: STORE_NAME })}{s.rank ? t('partner.rankSuffix', { rank: s.rank, total: s.totalPartners }) : ''}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${status.cls}`}>{t(status.textKey)}</span>
      </div>

      {me.status !== 'approved' ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-lg font-bold text-foreground">
            {me.status === 'pending' ? t('partner.applicationUnderReview') : me.status === 'suspended' ? t('partner.accountSuspended') : t('partner.applicationNotApproved')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {me.status === 'pending' ? t('partner.pendingEmailNote') : t('partner.contactIfMistake')}
          </p>
        </div>
      ) : (
        <>
          {/* Referral link */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary"><Link2 className="size-4" /> {t('partner.yourReferralLink')}</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={link} className="min-w-0 flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm text-foreground" />
              <Button type="button" onClick={copy} className="gap-2 rounded-full">{copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? t('partner.copied') : t('partner.copyLink')}</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('partner.codeLabel')} <span className="font-bold text-foreground">{me.referralCode}</span>
              {me.discountCoupon && (me.discountCoupon.type === 'percentage'
                ? <> · {t('partner.audienceGetsPercent', { value: me.discountCoupon.value })}</>
                : <> · {t('partner.audienceGetsPrefix')} <Money v={me.discountCoupon.value} /> {t('partner.audienceGetsFixedSuffix')}</>)}
              {' '}· {t('partner.youEarn')} {me.commissionType === 'fixed' ? <><Money v={me.commissionRate} /> {t('partner.perOrder')}</> : t('partner.percentPerOrder', { rate: me.commissionRate })}
            </p>
          </div>

          {/* Campaign link builder */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-bold text-foreground">{t('partner.buildCampaignLink')}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t('partner.campaignLinkHelp')}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input value={campLabel} onChange={(e) => setCampLabel(e.target.value)} placeholder={t('partner.campaignLabelPlaceholder')} className="sm:w-52" />
              <input readOnly value={campLink} className="min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground" />
              <Button type="button" variant="outline" className="gap-2" onClick={() => copyText(campLink, t('partner.campaignLinkCopied'))}><Copy className="size-4" /> {t('partner.copy')}</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={MousePointerClick} label={t('partner.statClicks')}>{s.clicks || 0}</StatCard>
            <StatCard icon={ShoppingBag} label={t('partner.statOrders')} sub={t('partner.conversionSub', { value: s.conversion || 0 })}>{s.orders || 0}</StatCard>
            <StatCard icon={TrendingUp} label={t('partner.statSalesDriven')}><Money v={s.totalSales} /></StatCard>
            <StatCard icon={Wallet} label={t('partner.statPayableNow')} sub={t('partner.lifetimePaid', { amount: `${CURRENCY}${formatPrice(s.commissionPaid)}` })}><Money v={s.payableBalance} /></StatCard>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {t('partner.pendingLabel')} <Money v={s.commissionPending} /></span>
            <span>{t('partner.approvedLabel')} <Money v={s.commissionApproved} /></span>
            <span>{t('partner.paidOutLabel')} <Money v={s.paidOut} /></span>
            {pendingRequest ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">{t('partner.payoutOf')} <Money v={pendingRequest.amount} /> {t('partner.requestedPending')}</span>
            ) : s.payableBalance > 0 ? (
              <Button type="button" size="sm" className="rounded-full" onClick={requestPayout} disabled={requesting}>{requesting ? t('partner.requesting') : <>{t('partner.requestPayout')} (<Money v={s.payableBalance} />)</>}</Button>
            ) : null}
          </div>

          {/* Channels */}
          {campaigns.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-bold text-foreground">{t('partner.byChannel')}</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="px-4 py-2.5">{t('partner.thCampaign')}</th><th className="px-4 py-2.5">{t('partner.thClicks')}</th><th className="px-4 py-2.5">{t('partner.thOrders')}</th><th className="px-4 py-2.5">{t('partner.thConv')}</th><th className="px-4 py-2.5">{t('partner.thSales')}</th><th className="px-4 py-2.5">{t('partner.thCommission')}</th></tr>
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
          <h2 className="mt-10 text-lg font-bold text-foreground">{t('partner.yourOrders')}</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-2.5">{t('partner.thOrder')}</th><th className="px-4 py-2.5">{t('partner.thDate')}</th><th className="px-4 py-2.5">{t('partner.thValue')}</th><th className="px-4 py-2.5">{t('partner.thCommission')}</th><th className="px-4 py-2.5">{t('partner.thStatus')}</th></tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t('partner.noOrdersYet')}</td></tr>
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
              <h2 className="mt-10 text-lg font-bold text-foreground">{t('partner.payoutsHeading')}</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="px-4 py-2.5">{t('partner.thDate')}</th><th className="px-4 py-2.5">{t('partner.thAmount')}</th><th className="px-4 py-2.5">{t('partner.thMethod')}</th><th className="px-4 py-2.5">{t('partner.thReference')}</th><th className="px-4 py-2.5">{t('partner.thStatus')}</th></tr>
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
          <h2 className="mt-10 text-lg font-bold text-foreground">{t('partner.payoutDetailsHeading')}</h2>
          <form onSubmit={savePayout} className="mt-3 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{t('partner.payoutDetailsNote')}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2"><Label>{t('partner.labelAccountName')}</Label><Input value={payForm.accountName} onChange={(e) => setPayForm((f) => ({ ...f, accountName: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>{t('partner.labelBankName')}</Label><Input value={payForm.bankName} onChange={(e) => setPayForm((f) => ({ ...f, bankName: e.target.value }))} /></div>
              <div className="grid gap-2 sm:col-span-2"><Label htmlFor="iban">{t('partner.labelIban')}</Label><Input id="iban" value={payForm.iban} onChange={(e) => setPayForm((f) => ({ ...f, iban: e.target.value }))} placeholder={t('partner.ibanPlaceholder')} /></div>
            </div>
            <Button type="submit" className="mt-4" disabled={saving}>{saving ? t('partner.saving') : t('partner.saveDetails')}</Button>
          </form>
        </>
      )}
    </div>
  );
}
