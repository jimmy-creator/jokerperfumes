import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// One row per (user, puzzle level) recording that the user beat that level
// and the coupon minted for it. The unique index prevents a level from being
// claimed twice by the same user.
const PuzzleReward = sequelize.define('PuzzleReward', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  indexes: [
    { unique: true, fields: ['userId', 'level'] },
  ],
});

export default PuzzleReward;
