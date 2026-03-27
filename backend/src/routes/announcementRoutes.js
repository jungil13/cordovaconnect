const express = require('express');
const router = express.Router();
const { getAnnouncements, getAnnouncementById, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, barangayAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAnnouncements)
  .post(protect, barangayAdmin, createAnnouncement);

router.route('/:id')
  .get(getAnnouncementById)
  .delete(protect, barangayAdmin, deleteAnnouncement);

module.exports = router;
