// Import Sequelize (helps us talk to database)
const { Sequelize } = require('sequelize');

// Import dotenv (reads our .env file)
require('dotenv').config();

// Create connection to PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Database name: intranet_db
  process.env.DB_USER,      // User: postgres
  process.env.DB_PASSWORD,  
  {
    host: process.env.DB_HOST,     // localhost
    port: process.env.DB_PORT,     // 5432
    dialect: 'postgres',           // We're using PostgreSQL
    logging: false                 // Don't show SQL in console (cleaner)
  }
);

// Test if connection works
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
  }
};

// Export so other files can use it
module.exports = { sequelize, testConnection };