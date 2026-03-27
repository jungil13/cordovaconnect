const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const userRoutes = require('./routes/userRoutes');
const socialRoutes = require('./routes/socialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const barangayRoutes = require('./routes/barangayRoutes');
const barangayOfficialRoutes = require('./routes/barangayOfficialRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config();

const app = express();
const passport = require('./config/passport');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', socialRoutes); // Part of event interaction
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/barangays', barangayRoutes);
app.use('/api/barangay-officials', barangayOfficialRoutes);
app.use('/api/categories', categoryRoutes);

// Temporary Health Route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Welcome to CordovaConnect API' });
});

module.exports = app;
