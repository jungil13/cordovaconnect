const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('SuperAdmin', 'BarangayAdmin', 'Resident', 'Visitor'), defaultValue: 'Visitor' },
  barangay_id: { type: DataTypes.INTEGER, allowNull: true },
  profile_photo: { type: DataTypes.STRING, allowNull: true },
  google_id: { type: DataTypes.STRING, unique: true },
  birthdate: { type: DataTypes.DATEONLY, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  emergency_contact: { type: DataTypes.STRING, allowNull: true },
  id_number: { type: DataTypes.STRING, allowNull: true, unique: true },
  is_banned: { type: DataTypes.BOOLEAN, defaultValue: false },
  digital_id_status: { 
    type: DataTypes.ENUM('None', 'Pending', 'Generated'), 
    defaultValue: 'None' 
  }
}, {
  tableName: 'users',
  getterMethods: {
    age() {
      if (!this.birthdate) return null;
      const today = new Date();
      const birthDate = new Date(this.birthdate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  }
});

module.exports = User;
