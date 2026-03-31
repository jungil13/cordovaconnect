const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dbUrl = (process.env.DATABASE_URL || '').trim();
console.log('DEBUG: DATABASE_URL exists?', !!dbUrl, 'Length:', dbUrl.length);

if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log('Connecting to database host:', url.hostname);
  } catch (e) {
    console.log('DEBUG: Failed to parse dbUrl as URL');
    console.log('Connecting to database host:', process.env.DB_HOST || 'localhost');
  }
} else {
  console.log('Connecting to database host:', process.env.DB_HOST || 'localhost');
}

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectOptions: (process.env.NODE_ENV === 'production' || (process.env.DB_HOST && process.env.DB_HOST.includes('render.com')) || (dbUrl && dbUrl.includes('render.com'))) ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'cordovaconnect',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
