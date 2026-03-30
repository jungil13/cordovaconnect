const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent } = require('../controllers/eventController');
const { protect, superAdmin, barangayAdmin } = require('../middleware/authMiddleware');
const { uploadEvent, uploadEventToCloudinary } = require('../middleware/uploadEvent');

router.route('/')
  .get(getEvents)
  .post(protect, uploadEvent.single('image'), uploadEventToCloudinary('events'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.patch('/:id/approve', protect, superAdmin, approveEvent);

module.exports = router;
