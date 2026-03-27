const { Like, Comment, User, Event } = require('../models');

const likeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [like, created] = await Like.findOrCreate({
      where: { user_id: req.user.id, event_id: id }
    });
    if (!created) {
      return res.status(400).json({ message: 'Event already liked' });
    }
    res.status(201).json({ message: 'Event liked' });
  } catch (error) {
    res.status(500).json({ message: 'Error liking event' });
  }
};

const unlikeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Like.destroy({
      where: { user_id: req.user.id, event_id: id }
    });
    res.json({ message: 'Event unliked' });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking event' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await Comment.create({
      content,
      user_id: req.user.id,
      event_id: id
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.findAll({
      where: { event_id: id },
      include: [{ model: User, as: 'author', attributes: ['name', 'profile_photo'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

module.exports = { likeEvent, unlikeEvent, addComment, getComments };
