import { Op } from 'sequelize';
import { Order } from '../models/index.js';

// Influencer commissions go: pending → approved (order delivered + return
// window elapsed) → paid (via a Payout). Cancelled/refunded orders reverse.
const RETURN_WINDOW_DAYS = 14;
const INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours

async function runCommissionSync() {
  const cutoff = new Date(Date.now() - RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // Approve commissions for orders delivered before the return window closed.
  await Order.update(
    { commissionStatus: 'approved' },
    {
      where: {
        commissionStatus: 'pending',
        orderStatus: 'delivered',
        paymentStatus: { [Op.notIn]: ['refunded', 'failed'] },
        deliveredAt: { [Op.ne]: null, [Op.lte]: cutoff },
      },
    },
  );

  // Reverse not-yet-paid commissions on cancellation or refund.
  await Order.update(
    { commissionStatus: 'reversed' },
    {
      where: {
        commissionStatus: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [{ orderStatus: 'cancelled' }, { paymentStatus: 'refunded' }],
      },
    },
  );
}

export function startCommissionJob() {
  setInterval(
    () => runCommissionSync().catch((e) => console.error('[commission] sync error:', e.message)),
    INTERVAL_MS,
  );
  setTimeout(() => runCommissionSync().catch(() => {}), 30000); // once shortly after boot
  console.log(`[commission] job started — approves after ${RETURN_WINDOW_DAYS}-day window, reverses on cancel/refund`);
}
