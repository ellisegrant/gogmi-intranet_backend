const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Accra'
  },
  employeeType: {
    type: DataTypes.ENUM('Full-time', 'Contract'),
    allowNull: false,
    defaultValue: 'Full-time'
  },
  contractEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
 
  lineManagerId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'users',
      key: 'employeeId'
    }
  },
 

  costCentre: {
    type: DataTypes.STRING,
    allowNull: true
  },


profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  joinDate: {
    type: DataTypes.DATE,
    allowNull: true
  },

  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

User.generateEmployeeId = async function(employeeType) {
  try {
    const typeCode = employeeType === 'Full-time' ? 'F' : 'C';
    
    const lastEmployee = await User.findOne({
      where: {
        employeeType: employeeType,
        employeeId: {
          [sequelize.Sequelize.Op.like]: `GoGMI2010${typeCode}%`
        }
      },
      order: [['employeeId', 'DESC']]
    });

    if (!lastEmployee) {
      return `GoGMI2010${typeCode}001`;
    }

    const lastNumber = parseInt(lastEmployee.employeeId.slice(-3));
    const nextNumber = lastNumber + 1;
    const formattedNumber = String(nextNumber).padStart(3, '0');

    return `GoGMI2010${typeCode}${formattedNumber}`;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    throw error;
  }
};

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
