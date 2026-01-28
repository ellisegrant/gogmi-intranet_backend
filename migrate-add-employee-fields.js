const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function addFields() {
  try {
    console.log('Adding new fields to users table...');
    
    await sequelize.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(255);
    `, { type: QueryTypes.RAW });
    
    await sequelize.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "lineManager" VARCHAR(255);
    `, { type: QueryTypes.RAW });
    
    await sequelize.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "costCentre" VARCHAR(255);
    `, { type: QueryTypes.RAW });
    
    console.log('Fields added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addFields();
