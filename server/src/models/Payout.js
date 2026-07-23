import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// A settlement paid to an influencer for approved commissions.
const Payout = sequelize.define('Payout', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  influencerId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.STRING, allowNull: true }, // bank (snapshot)
  reference: { type: DataTypes.STRING, allowNull: true }, // bank transfer reference
  status: { type: DataTypes.ENUM('requested', 'paid', 'rejected'), defaultValue: 'paid' },
  note: { type: DataTypes.TEXT, allowNull: true },
  paidAt: { type: DataTypes.DATE, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true }, // admin user id
});

export default Payout;
