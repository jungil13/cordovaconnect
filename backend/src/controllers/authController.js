const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }
    const { name, email, password, barangay_id, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      barangay_id: barangay_id || null, // Optional for Visitors
      profile_photo: req.file ? `/uploads/profiles/${req.file.filename}` : null,
    };

    // Only allow role assignment if admin? For now, allow for easier testing or handle separately
    if (role) {
      userData.role = role;
    }

    const user = await User.create(userData);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        barangay_id: user.barangay_id, 
        profile_photo: user.profile_photo,
        birthdate: user.birthdate,
        address: user.address,
        emergency_contact: user.emergency_contact,
        id_number: user.id_number,
        age: user.age
      } 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.is_banned) {
      return res.status(403).json({ message: 'Your account has been banned. Please contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        barangay_id: user.barangay_id, 
        profile_photo: user.profile_photo,
        birthdate: user.birthdate,
        address: user.address,
        emergency_contact: user.emergency_contact,
        id_number: user.id_number,
        age: user.age
      } 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    const userJson = user.toJSON();
    userJson.age = user.age;
    res.json(userJson);
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
