const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assetId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currentValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assignedToId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Under Maintenance', 'Disposed'),
    defaultValue: 'Active'
  },
  condition: {
    type: DataTypes.ENUM('Excellent', 'Good', 'Fair', 'Poor'),
    defaultValue: 'Good'
  },
  warranty: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'assets',
  timestamps: true
});

// Static method to generate next asset ID
Asset.generateNextAssetId = async function() {
  try {
    // Find the last asset ordered by assetId descending
    const lastAsset = await Asset.findOne({
      order: [['assetId', 'DESC']]
    });

    if (!lastAsset) {
      // First asset
      return 'AST-001';
    }

    // Extract number from last asset ID (e.g., "AST-005" -> 5)
    const lastNumber = parseInt(lastAsset.assetId.split('-')[1]);
    const nextNumber = lastNumber + 1;

    // Format with leading zeros (e.g., 6 -> "006")
    const formattedNumber = String(nextNumber).padStart(3, '0');

    return `AST-${formattedNumber}`;
  } catch (error) {
    console.error('Error generating asset ID:', error);
    // Fallback to timestamp-based ID if there's an error
    return `AST-${Date.now()}`;
  }
};

module.exports = Asset;