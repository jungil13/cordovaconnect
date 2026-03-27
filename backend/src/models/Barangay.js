const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Barangay = sequelize.define('Barangay', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  location_desc: { type: DataTypes.TEXT },
  captain_name: { type: DataTypes.STRING },
}, { timestamps: true });

module.exports = Barangay;
