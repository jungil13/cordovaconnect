const express = require('express');
const router = express.Router();
const { getAllOfficials, createOfficial, updateOfficial, deleteOfficial } = require('../controllers/barangayOfficialController');
const { protect } = require('../middleware/authMiddleware');

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.get('/', getAllOfficials);
router.post('/', protect, checkRole(['SuperAdmin']), createOfficial);
router.put('/:id', protect, checkRole(['SuperAdmin']), updateOfficial);
router.delete('/:id', protect, checkRole(['SuperAdmin']), deleteOfficial);

module.exports = router;
