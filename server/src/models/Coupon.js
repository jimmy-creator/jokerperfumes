import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    // 'percentage' or 'fixed'
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
  },
  value: {
    // Discount amount: percentage (e.g. 10 = 10%) or fixed (e.g. 100 = ₹100 off)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  maxDiscount: {
    // Cap for percentage discounts (e.g. max ₹500 off)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  usageLimit: {
    // Total times this coupon can be used (null = unlimited)
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  perUserLimit: {
    // Times a single user can use it (null = unlimited)
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  applicableCategories: {
    // null = all categories, or ["Electronics", "Clothing"]
    type: DataTypes.JSON,
    defaultValue: null,
  },
  applicableProducts: {
    // null = all products, or [1, 5, 12] (product IDs)
    type: DataTypes.JSON,
    defaultValue: null,
  },
  applicablePaymentMethods: {
    // null = all methods, or ["cod", "stripe", "nomod"]
    type: DataTypes.JSON,
    defaultValue: null,
  },
  assignedUserId: {
    // When set, only this user may redeem the coupon (used for
    // per-player game rewards). null = public coupon, anyone may use.
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  influencerId: {
    // When set, this is an influencer's customer-facing discount coupon.
    // Redeeming it attributes commission to that influencer even without
    // a referral-link cookie. null = not tied to any influencer.
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
});

export default Coupon;
