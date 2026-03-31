const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

require('dotenv').config();

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing Google credentials in .env file');
}

const callbackURL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;

console.log('Using callbackURL:', callbackURL);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing Google credentials in .env file');
}

console.log('Using callbackURL:', callbackURL);



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ where: { google_id: profile.id } });
      if (!user) {
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        if (user) {
          user.google_id = profile.id;
          await user.save();
        } else {
          // New user from Google
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            google_id: profile.id,
            password: Math.random().toString(36).slice(-10), // Required field
            role: 'Resident',
            profile_photo: profile.photos[0].value || null
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

module.exports = passport;
