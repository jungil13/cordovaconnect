const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BarangayOfficial = sequelize.define('BarangayOfficial', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.STRING, allowNull: false }, // e.g., 'Captain', 'Councilor'
  term_start: { type: DataTypes.DATEONLY },
}, { timestamps: true });

module.exports = BarangayOfficial;
