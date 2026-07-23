import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// One row per visit landing through a referral link (for conversion stats).
const ReferralClick = sequelize.define('ReferralClick', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  influencerId: { type: DataTypes.INTEGER, allowNull: false },
  referralCode: { type: DataTypes.STRING, allowNull: true },
  campaign: { type: DataTypes.STRING, allowNull: true },
  ip: { type: DataTypes.STRING, allowNull: true },
  userAgent: { type: DataTypes.TEXT, allowNull: true },
  landingPath: { type: DataTypes.STRING, allowNull: true },
});

export default ReferralClick;
