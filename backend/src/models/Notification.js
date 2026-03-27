const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: true },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = Notification;
