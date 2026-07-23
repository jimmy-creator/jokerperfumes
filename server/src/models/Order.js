import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  guestEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  orderStatus: {
    type: DataTypes.ENUM('processing', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'processing',
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  refundStatus: {
    // null = no refund, pending, processed, failed
    type: DataTypes.ENUM('pending', 'processed', 'failed'),
    allowNull: true,
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  shippingCharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  shippingMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Region the order was placed in ('sa' | 'in') and its ISO currency, so
  // amounts are interpreted in the right currency across admin/invoices.
  // null for legacy/POS orders placed before dual-region (treated as Saudi).
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currencyCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // ── Influencer referral attribution ──────────────────────────────
  // Set when the order is attributed to an approved influencer (via
  // referral link cookie or their discount coupon). commissionStatus
  // is driven by commissionJob: pending → approved → paid, or reversed.
  influencerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referralCampaign: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  commissionRate: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  commissionStatus: {
    type: DataTypes.ENUM('none', 'pending', 'approved', 'reversed', 'paid'),
    defaultValue: 'none',
  },
  // Timestamp the order reached 'delivered' — starts the commission
  // return-window clock (see services/commissionJob.js).
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Per-tender breakdown for split-payment POS sales.
  // null = single tender (use paymentMethod as before). When set,
  // paymentMethod is 'pos_split' and this is an array like
  //   [{ method: 'cash', amount: 20.000 },
  //    { method: 'card', amount: 30.000, reference: 'tap-tx-id' }]
  // Each entry's amount is the retained amount (no cash-back/change).
  paymentBreakdown: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  taxBreakdown: {
    // e.g. { totalTax: 5, inclusive: true } — single flat VAT
    type: DataTypes.JSON,
    defaultValue: null,
  },
  shippingMeta: {
    // Shiprocket Shipping integration. Populated after auto-create or
    // admin "Ship via Shiprocket" action. Shape:
    //   { srOrderId, shipmentId, awb, courierName, courierId,
    //     pickupScheduledDate, etd,
    //     currentStatus, currentStatusId, lastWebhookAt,
    //     labelUrl, invoiceUrl, manifestUrl,
    //     scans: [{date, status, activity, location, srStatus, srStatusLabel}],
    //     lastError? }
    type: DataTypes.JSON,
    defaultValue: null,
  },
  locationId: {
    // Which physical location fulfilled (online: the isOnlineDefault
    // location; POS: the store where the cashier rang it up).
    // null for legacy orders placed before multi-location was introduced.
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cashierSessionId: {
    // Set when the order was rung up through the POS during a shift.
    // null for online orders.
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

export default Order;
