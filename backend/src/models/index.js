const { sequelize } = require('../config/db');
const User = require('./User');
const Event = require('./Event');
const Category = require('./Category');
const Comment = require('./Comment');
const Like = require('./Like');
const Bookmark = require('./Bookmark');
const Announcement = require('./Announcement');
const Notification = require('./Notification');
const Barangay = require('./Barangay');
const BarangayOfficial = require('./BarangayOfficial');

// --- Associations ---

// User & Barangay
Barangay.hasMany(User, { foreignKey: 'barangay_id', as: 'residents' });
User.belongsTo(Barangay, { foreignKey: 'barangay_id', as: 'barangay' });

// Barangay Officials
Barangay.hasMany(BarangayOfficial, { foreignKey: 'barangay_id', as: 'officials' });
BarangayOfficial.belongsTo(Barangay, { foreignKey: 'barangay_id', as: 'barangay' });

// Events
User.hasMany(Event, { foreignKey: 'user_id', as: 'events' });
Event.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

Category.hasMany(Event, { foreignKey: 'category_id', as: 'events' });
Event.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Barangay.hasMany(Event, { foreignKey: 'barangay_id', as: 'events' });
Event.belongsTo(Barangay, { foreignKey: 'barangay_id', as: 'barangay' });

// Comments
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Event.hasMany(Comment, { foreignKey: 'event_id', as: 'comments' });
Comment.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Likes/Bookmarks
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Event.hasMany(Like, { foreignKey: 'event_id', as: 'likes' });
Like.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(Bookmark, { foreignKey: 'user_id', as: 'bookmarks' });
Bookmark.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Event.hasMany(Bookmark, { foreignKey: 'event_id', as: 'bookmarks' });
Bookmark.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Announcements
Barangay.hasMany(Announcement, { foreignKey: 'barangay_id', as: 'announcements' });
Announcement.belongsTo(Barangay, { foreignKey: 'barangay_id', as: 'barangay' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const syncMode = true;

const seedData = async () => {
  try {
    // Seed 13 Barangays of Cordova
    const brgyNames = [
      'Alegria', 'Bangbang', 'Buagsong', 'Catarman', 'Cogon', 
      'Dapitan', 'Day-as', 'Gabi', 'Gilutongan', 'Ibabao', 
      'Pilipog', 'Poblacion', 'San Miguel'
    ];
    for (const name of brgyNames) {
      await Barangay.findOrCreate({ where: { name } });
    }

    // Seed Categories
    const categories = ['Festivals', 'Sports', 'School', 'Church', 'Tourism', 'Health', 'LGU'];
    for (const catName of categories) {
      await Category.findOrCreate({ where: { name: catName } });
    }

    // Seed Default Admin (Mayor)
    const bcrypt = require('bcryptjs');
    const mayorPassword = await bcrypt.hash('mayor123', 10);
    await User.findOrCreate({
      where: { email: 'mayor@cordova.gov.ph' },
      defaults: {
        name: 'Mayor Cesar Suan',
        password: mayorPassword,
        role: 'SuperAdmin'
      }
    });

    // Seed Default Brgy Captain (Poblacion)
    const captainPassword = await bcrypt.hash('captain123', 10);
    const poblacion = await Barangay.findOne({ where: { name: 'Poblacion' } });
    if (poblacion) {
      await User.findOrCreate({
        where: { email: 'captain.pob@cordova.gov.ph' },
        defaults: {
          name: 'Poblacion Captain',
          password: captainPassword,
          role: 'BarangayAdmin',
          barangay_id: poblacion.id
        }
      });
    }
  } catch (err) {
    console.error('Seeding Error:', err);
  }
};

if (syncMode) {
  sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully');
    seedData();
  }).catch((err) => {
    console.error('Error syncing database:', err);
  });
}

module.exports = {
  sequelize,
  User,
  Event,
  Category,
  Comment,
  Like,
  Bookmark,
  Announcement,
  Notification,
  Barangay,
  BarangayOfficial
};
