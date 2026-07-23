import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { CURRENCY, formatPrice } from '../../utils/currency';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'suspended', 'rejected'];
const money = (v) => `${CURRENCY}${formatPrice(v)}`;
const badge = (status) => {
  const map = { approved: ['#1f8a3c', 'rgba(43,168,74,0.12)'], pending: ['#b06a00', 'rgba(245,166,9,0.15)'], suspended: ['#c0392b', 'rgba(229,72,77,0.12)'], rejected: ['#c0392b', 'rgba(229,72,77,0.12)'] };
  const [c, bg] = map[status] || ['#777', 'rgba(0,0,0,0.06)'];
  return { color: c, background: bg, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999 };
};

const PayoutField = ({ label, value, mono }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: 600, fontFamily: mono ? 'ui-monospace, monospace' : undefined }}>{value || '—'}</span>
  </div>
);

export default function InfluencersAdmin() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [coupons, setCoupons] = useState([]);
  const [editing, setEditing] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payout, setPayout] = useState({ amount: '', reference: '' });
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('list');
  const [board, setBoard] = useState([]);

  const load = () => api.get('/influencers' + (filter !== 'all' ? `?status=${filter}` : '')).then((r) => setList(r.data)).catch(() => {});
  const loadRequests = () => api.get('/influencers/payout-requests').then((r) => setRequests(r.data)).catch(() => {});
  const loadBoard = () => api.get('/influencers/leaderboard').then((r) => setBoard(r.data)).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);
  useEffect(() => { api.get('/coupons').then((r) => setCoupons(r.data)).catch(() => {}); loadRequests(); }, []);

  const actRequest = async (id, action) => {
    try {
      await api.put(`/influencers/payouts/${id}`, { action });
      toast.success(action === 'pay' ? 'Payout marked paid' : 'Request rejected');
      loadRequests(); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const openManage = async (inf) => {
    setEditing({ ...inf });
    const r = await api.get(`/influencers/${inf.id}/orders`).catch(() => ({ data: [] }));
    setOrders(r.data);
  };

  const patch = (p) => setEditing((e) => ({ ...e, ...p }));

  const save = async () => {
    try {
      const body = {
        status: editing.status,
        commissionType: editing.commissionType,
        commissionRate: editing.commissionRate,
        referralCode: editing.referralCode,
        discountCouponId: editing.discountCoupon?.id || editing.discountCouponId || null,
      };
      const { data } = await api.put(`/influencers/${editing.id}`, body);
      setEditing((e) => ({ ...e, ...data }));
      toast.success('Saved');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
  };

  const quickApprove = async (inf) => {
    try { await api.put(`/influencers/${inf.id}`, { status: 'approved' }); toast.success('Approved'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const recordPayout = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/influencers/${editing.id}/payouts`, payout);
      toast.success('Payout recorded');
      setPayout({ amount: '', reference: '' });
      openManage(editing); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  /* ── Manage view ── */
  if (editing) {
    const s = editing.stats || {};
    return (
      <div className="admin-section">
        <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{editing.name} · <span style={{ fontWeight: 400 }}>{editing.email}</span> · <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{editing.referralCode}</span></span>
          <button className="btn btn-secondary" onClick={() => setEditing(null)}>← Back</button>
        </div>

        <div className="dash-cards" style={{ marginBottom: 16 }}>
          <div className="dash-card"><div className="dash-card-label">Clicks</div><div className="dash-card-value">{s.clicks || 0}</div></div>
          <div className="dash-card"><div className="dash-card-label">Orders</div><div className="dash-card-value">{s.orders || 0}</div></div>
          <div className="dash-card"><div className="dash-card-label">Sales</div><div className="dash-card-value">{money(s.totalSales)}</div></div>
          <div className="dash-card"><div className="dash-card-label">Payable now</div><div className="dash-card-value">{money(s.payableBalance)}</div></div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Pending {money(s.commissionPending)} · Approved {money(s.commissionApproved)} · Paid out {money(s.paidOut)}
        </p>

        <div className="form-row">
          <div className="form-group"><label>Status</label>
            <select value={editing.status} onChange={(e) => patch({ status: e.target.value })}>
              {['pending', 'approved', 'suspended', 'rejected'].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Referral code</label>
            <input value={editing.referralCode} onChange={(e) => patch({ referralCode: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Commission type</label>
            <select value={editing.commissionType} onChange={(e) => patch({ commissionType: e.target.value })}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed ({CURRENCY})</option>
            </select>
          </div>
          <div className="form-group"><label>Commission {editing.commissionType === 'fixed' ? `(${CURRENCY}/order)` : '(%)'}</label>
            <input type="number" step="0.01" value={editing.commissionRate} onChange={(e) => patch({ commissionRate: e.target.value })} />
          </div>
          <div className="form-group"><label>Customer discount coupon</label>
            <select value={editing.discountCoupon?.id || editing.discountCouponId || ''} onChange={(e) => patch({ discountCouponId: e.target.value || null, discountCoupon: null })}>
              <option value="">— none —</option>
              {coupons.map((c) => <option key={c.id} value={c.id}>{c.code} ({c.type === 'percentage' ? `${c.value}%` : money(c.value)})</option>)}
            </select>
          </div>
        </div>
        <div className="form-actions"><button className="btn btn-primary" onClick={save}>Save changes</button></div>

        {/* Record payout */}
        <h3 style={{ marginTop: 24, fontSize: '0.95rem', fontWeight: 600 }}>Record a payout</h3>
        <form onSubmit={recordPayout} className="report-filters" style={{ marginTop: 8 }}>
          <div className="form-group" style={{ minWidth: 120 }}><label>Amount</label><input type="number" step="0.01" value={payout.amount} onChange={(e) => setPayout((p) => ({ ...p, amount: e.target.value }))} required /></div>
          <div className="form-group" style={{ minWidth: 160 }}><label>Reference</label><input value={payout.reference} onChange={(e) => setPayout((p) => ({ ...p, reference: e.target.value }))} placeholder="Bank transfer ref" /></div>
          <button type="submit" className="btn btn-primary">Mark paid</button>
        </form>
        <div style={{ marginTop: 10, padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-secondary, rgba(0,0,0,0.02))' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: 8 }}>
            Payout details · Bank transfer
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', fontSize: '0.9rem' }}>
            <PayoutField label="Account name" value={editing.accountName} />
            <PayoutField label="Bank" value={editing.bankName} />
            <PayoutField label="IBAN" value={editing.iban} mono />
          </div>
        </div>

        {/* Orders */}
        <h3 style={{ marginTop: 24, fontSize: '0.95rem', fontWeight: 600 }}>Attributed orders</h3>
        <div className="admin-table-wrap" style={{ marginTop: 8 }}>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Date</th><th>Value</th><th>Commission</th><th>Status</th></tr></thead>
            <tbody>
              {orders.length === 0 ? <tr><td colSpan={5}>No orders yet.</td></tr> : orders.map((o) => (
                <tr key={o.id}><td>{o.orderNumber}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td><td>{money(o.totalAmount)}</td><td>{money(o.commissionAmount)}</td><td style={{ textTransform: 'capitalize' }}>{o.commissionStatus}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="admin-section">
      <div className="report-filters" style={{ marginBottom: 12 }}>
        <button type="button" className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>Influencers</button>
        <button type="button" className={`btn ${view === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setView('leaderboard'); loadBoard(); }}>🏆 Leaderboard</button>
      </div>

      {view === 'leaderboard' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Influencer</th><th>Code</th><th>Orders</th><th>Sales</th><th>Commission</th></tr></thead>
            <tbody>
              {board.length === 0 ? <tr><td colSpan={6}>No data yet.</td></tr> : board.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, fontSize: r.rank <= 3 ? '1.1rem' : undefined }}>{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</td>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td>{r.referralCode}</td>
                  <td>{r.orders}</td>
                  <td>{money(r.sales)}</td>
                  <td style={{ fontWeight: 600 }}>{money(r.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'list' && <>
      {requests.length > 0 && (
        <div style={{ marginBottom: 20, padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'rgba(245,166,9,0.06)' }}>
          <div className="admin-section-header" style={{ marginBottom: 8 }}>⏳ Pending payout requests ({requests.length})</div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Influencer</th><th>Amount</th><th>Method</th><th>Requested</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.influencer?.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>({r.influencer?.referralCode})</span></td>
                    <td style={{ fontWeight: 600 }}>{money(r.amount)}</td>
                    <td style={{ textTransform: 'uppercase' }}>{r.method || '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="invoice-btn" style={{ marginRight: 6, color: '#1f8a3c' }} onClick={() => actRequest(r.id, 'pay')}>Mark paid</button>
                      <button className="invoice-btn" style={{ color: 'var(--danger)' }} onClick={() => actRequest(r.id, 'reject')}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-section-header">Influencers</div>
      <div className="report-filters" style={{ marginBottom: 12 }}>
        {STATUS_FILTERS.map((f) => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Code</th><th>Status</th><th>Sales</th><th>Payable</th><th>Rate</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={7}>No influencers.</td></tr> : list.map((inf) => (
              <tr key={inf.id}>
                <td style={{ fontWeight: 500 }}>{inf.name}<div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{inf.email}</div></td>
                <td>{inf.referralCode}</td>
                <td><span style={badge(inf.status)}>{inf.status}</span></td>
                <td>{money(inf.stats?.totalSales)}</td>
                <td>{money(inf.stats?.payableBalance)}</td>
                <td>{inf.commissionType === 'fixed' ? money(inf.commissionRate) : `${inf.commissionRate}%`}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {inf.status === 'pending' && <button className="invoice-btn" onClick={() => quickApprove(inf)} style={{ marginRight: 6, color: '#1f8a3c' }}>Approve</button>}
                  <button className="invoice-btn" onClick={() => openManage(inf)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>}
    </div>
  );
}
