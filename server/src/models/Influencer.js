import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// An influencer is a User (role='influencer') with a referral profile.
const Influencer = sequelize.define('Influencer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

  referralCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'suspended', 'rejected'),
    defaultValue: 'pending',
  },

  // Commission earned by the influencer (per-influencer, admin-set).
  commissionType: { type: DataTypes.ENUM('percentage', 'fixed'), defaultValue: 'percentage' },
  commissionRate: { type: DataTypes.DECIMAL(8, 2), defaultValue: 10 }, // % when percentage, SAR when fixed

  // Optional discount the customer gets via this influencer's link/code.
  // Reuses the Coupon engine — points to a Coupon whose influencerId === this.id.
  discountCouponId: { type: DataTypes.INTEGER, allowNull: true },

  // Profile
  instagram: { type: DataTypes.STRING, allowNull: true },
  youtube: { type: DataTypes.STRING, allowNull: true },
  audienceSize: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },

  // Payout details (Saudi bank transfer)
  bankName: { type: DataTypes.STRING, allowNull: true },
  accountName: { type: DataTypes.STRING, allowNull: true },
  iban: { type: DataTypes.STRING, allowNull: true },

  // Admin-only note
  adminNote: { type: DataTypes.TEXT, allowNull: true },
});

export default Influencer;
