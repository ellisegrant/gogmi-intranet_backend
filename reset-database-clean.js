const { sequelize } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
  console.log('WARNING: This will DELETE all existing data!');
  console.log('Resetting database in 3 seconds...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset successful');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@gogmi.com',
      password: hashedPassword,
      department: 'corporate-affairs',
      position: 'Administrator',
      location: 'Accra',
      employeeId: 'GoGMI2010F001',
      employeeType: 'Full-time'
    });

    console.log('\nTest user created:');
    console.log('   Email: admin@gogmi.com');
    console.log('   Password: admin123');
    console.log('   Employee ID: GoGMI2010F001');
    console.log('   Department: Corporate Affairs');
    
    console.log('\nDatabase is ready!');
    
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();

