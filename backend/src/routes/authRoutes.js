const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const jwt = require('jsonwebtoken');
const passport = require('../config/passport');

router.post('/register', upload.single('profile_photo'), register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, role: req.user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    const userData = JSON.stringify({ 
      id: req.user.id, 
      name: req.user.name, 
      email: req.user.email, 
      role: req.user.role, 
      barangay_id: req.user.barangay_id, 
      profile_photo: req.user.profile_photo 
    });
    
    // Redirect to frontend with token and user data
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-success?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);

module.exports = router;
