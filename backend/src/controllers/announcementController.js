const { Announcement } = require('../models');

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, urgency, barangay_id } = req.body;
    const targetBrgyId = (req.user.role === 'SuperAdmin' ? barangay_id : req.user.barangay_id) || null;
    
    const announcement = await Announcement.create({
      title, content, type, urgency,
      user_id: req.user.id,
      barangay_id: targetBrgyId
    });

    // Create persistent notifications for relevant users
    const { User, Notification } = require('../models');
    const whereClause = {};
    if (targetBrgyId) whereClause.barangay_id = targetBrgyId;

    const users = await User.findAll({ where: whereClause });
    const notifications = users.map(u => ({
      user_id: u.id,
      type: urgency === 'High' ? 'Emergency' : 'Announcement',
      title: title,
      message: content,
      link: `/announcements/${announcement.id}`
    }));

    await Notification.bulkCreate(notifications);

    const io = req.app.get('io');
    if (io) {
      io.emit('announcement:new', announcement);
    }

    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    await announcement.destroy();
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getAnnouncements, getAnnouncementById, createAnnouncement, deleteAnnouncement };
