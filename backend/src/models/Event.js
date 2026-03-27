const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  start_datetime: { type: DataTypes.DATE, allowNull: false },
  end_datetime: { type: DataTypes.DATE },
  location_name: { type: DataTypes.STRING, allowNull: false },
  lat: { type: DataTypes.FLOAT },
  lng: { type: DataTypes.FLOAT },
  image_url: { type: DataTypes.STRING },
  live_url: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  barangay_id: { type: DataTypes.INTEGER },
}, { timestamps: true });

module.exports = Event;
