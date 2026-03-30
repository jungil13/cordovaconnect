const { Event, User, Category, Barangay, Like, Comment } = require('../models');

const getEvents = async (req, res) => {
  try {
    const { category_id, status } = req.query;
    let whereClause = { status: status || 'approved' };
    
    if (category_id) whereClause.category_id = category_id;

    const events = await Event.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'profile_photo'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Barangay, as: 'barangay', attributes: ['id', 'name'] },
        { model: Like, as: 'likes', attributes: ['id', 'user_id'] },
        { model: Comment, as: 'comments', attributes: ['id'] }
      ],
      order: [['start_datetime', 'ASC']]
    });

    // Add has_liked field for the current user
    const userId = req.user?.id;
    const formattedEvents = events.map(event => {
      const eventJson = event.toJSON();
      eventJson.like_count = eventJson.likes?.length || 0;
      eventJson.comment_count = eventJson.comments?.length || 0;
      eventJson.has_liked = eventJson.likes?.some(l => l.user_id === userId) || false;
      return eventJson;
    });

    res.json(formattedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'profile_photo'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Barangay, as: 'barangay', attributes: ['id', 'name'] },
        { model: Like, as: 'likes', attributes: ['id', 'user_id'] }
      ]
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const eventJson = event.toJSON();
    eventJson.like_count = eventJson.likes?.length || 0;
    eventJson.has_liked = eventJson.likes?.some(l => l.user_id === req.user?.id) || false;
    
    res.json(eventJson);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, start_datetime, end_datetime, location_name, location, lat, lng, image_url, category_id, is_alert, urgency, live_url } = req.body;
    
    // Fallback for location if frontend still sends 'location'
    const finalLocationName = location_name || location;

    if (!finalLocationName) {
      return res.status(400).json({ message: 'Location name is required' });
    }

    const eventImageUrl = req.file ? req.file.path : (image_url || null); // Cloudinary secure URL

    const eventData = {
      title, 
      description, 
      start_datetime, 
      end_datetime, 
      location_name: finalLocationName, 
      lat, 
      lng, 
      image_url: eventImageUrl, 
      live_url,
      category_id,
      user_id: req.user.id
    };

    if (req.user.role === 'SuperAdmin') {
      eventData.status = 'approved';
      eventData.barangay_id = req.body.barangay_id || null;
    } else if (req.user.role === 'BarangayAdmin') {
      eventData.status = 'approved';
      eventData.barangay_id = req.user.barangay_id;
    } else {
      eventData.status = 'pending';
      eventData.barangay_id = req.body.barangay_id || req.user.barangay_id;
    }

    const event = await Event.create(eventData);

    const app = req.app;
    const io = app.get('io');
    if (io) {
      if (req.user.role === 'SuperAdmin' || req.user.role === 'BarangayAdmin') {
        io.emit('event:approved', event);
      } else {
        io.emit('event:new', event);
      }
    }

    // If it's an alert, also create an announcement and notifications
    if (is_alert === 'true' || is_alert === true) {
      const { Announcement, User, Notification } = require('../models');
      const announcement = await Announcement.create({
        title: `🚨 ALERT: ${title}`,
        content: description,
        urgency: urgency || 'High',
        barangay_id: eventData.barangay_id,
        user_id: req.user.id
      });

      // Create persistent notifications
      const whereClause = {};
      if (eventData.barangay_id) whereClause.barangay_id = eventData.barangay_id;
      const users = await User.findAll({ where: whereClause });
      
      const notifications = users.map(u => ({
        user_id: u.id,
        type: (urgency || 'High') === 'High' ? 'Emergency' : 'Announcement',
        title: `🚨 ALERT: ${title}`,
        message: description,
        link: `/announcements/${announcement.id}`
      }));
      await Notification.bulkCreate(notifications);

      if (io) io.emit('announcement:new', { title, urgency: urgency || 'High' });
    }

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.user_id !== req.user.id && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.update(req.body);
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.user_id !== req.user.id && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.destroy();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const approveEvent = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = status;
    await event.save();

    const app = req.app;
    const io = app.get('io');
    if (io && status === 'approved') {
      io.emit('event:approved', event);
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent };
