const express = require('express');
const router = express.Router();
const { likeEvent, unlikeEvent, addComment, getComments } = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:id/like', protect, likeEvent);
router.delete('/:id/like', protect, unlikeEvent);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
