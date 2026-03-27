const express = require('express');
const router = express.Router();
const { getUsers, toggleBan, generateDigitalID, requestDigitalID, updateProfile, adminUpdateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};




router.get('/', protect, checkRole(['SuperAdmin']), getUsers);
router.patch('/:id/ban', protect, checkRole(['SuperAdmin']), toggleBan);
router.post('/:id/generate-id', protect, checkRole(['SuperAdmin']), generateDigitalID);
router.post('/request-id', protect, requestDigitalID);
router.put('/profile', protect, require('../middleware/upload').single('profile_photo'), updateProfile);
router.put('/:id', protect, checkRole(['SuperAdmin']), adminUpdateUser);

module.exports = router;
