const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('Alert', 'Info', 'Emergency'), defaultValue: 'Info' },
  urgency: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Low' },
  barangay_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
}, { timestamps: true });

module.exports = Announcement;
