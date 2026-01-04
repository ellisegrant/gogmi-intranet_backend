const Asset = require('../models/Asset');
const { Op } = require('sequelize');

// Create Asset
exports.create = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      serialNumber,
      purchaseDate,
      purchasePrice,
      currentValue,
      assignedTo,
      assignedToId,
      location,
      status,
      condition,
      warranty,
      notes
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required'
      });
    }

    // Auto-generate sequential asset ID
    const assetId = await Asset.generateNextAssetId();

    const asset = await Asset.create({
      assetId,
      name,
      category,
      description,
      serialNumber,
      purchaseDate,
      purchasePrice,
      currentValue,
      assignedTo,
      assignedToId,
      location,
      status: status || 'Active',
      condition: condition || 'Good',
      warranty,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
};

// Get All Assets
exports.getAll = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { assetId: { [Op.like]: `%${search}%` } },
        { serialNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    // Order by assetId ascending for sequential display
    const assets = await Asset.findAll({
      where: whereClause,
      order: [['assetId', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
};

// Get Single Asset
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      asset
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
};

// Get Asset by Asset ID (unique identifier)
exports.getByAssetId = async (req, res) => {
  try {
    const { assetId } = req.params;

    const asset = await Asset.findOne({
      where: { assetId }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      asset
    });
  } catch (error) {
    console.error('Get asset by assetId error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
};

// Update Asset
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      serialNumber,
      purchaseDate,
      purchasePrice,
      currentValue,
      assignedTo,
      assignedToId,
      location,
      status,
      condition,
      warranty,
      notes
    } = req.body;

    const asset = await Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Update asset (assetId CANNOT be changed to maintain uniqueness)
    await asset.update({
      name: name || asset.name,
      category: category || asset.category,
      description: description !== undefined ? description : asset.description,
      serialNumber: serialNumber !== undefined ? serialNumber : asset.serialNumber,
      purchaseDate: purchaseDate !== undefined ? purchaseDate : asset.purchaseDate,
      purchasePrice: purchasePrice !== undefined ? purchasePrice : asset.purchasePrice,
      currentValue: currentValue !== undefined ? currentValue : asset.currentValue,
      assignedTo: assignedTo !== undefined ? assignedTo : asset.assignedTo,
      assignedToId: assignedToId !== undefined ? assignedToId : asset.assignedToId,
      location: location !== undefined ? location : asset.location,
      status: status || asset.status,
      condition: condition || asset.condition,
      warranty: warranty !== undefined ? warranty : asset.warranty,
      notes: notes !== undefined ? notes : asset.notes
    });

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      asset
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating asset',
      error: error.message
    });
  }
};

// Delete Asset
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    await asset.destroy();

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
};

// Get Assets by Employee
exports.getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const assets = await Asset.findAll({
      where: { assignedToId: employeeId },
      order: [['assetId', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (error) {
    console.error('Get employee assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee assets',
      error: error.message
    });
  }
};

// Get Asset Statistics
exports.getStats = async (req, res) => {
  try {
    const totalAssets = await Asset.count();
    const activeAssets = await Asset.count({ where: { status: 'Active' } });
    const inactiveAssets = await Asset.count({ where: { status: 'Inactive' } });
    const maintenanceAssets = await Asset.count({ where: { status: 'Under Maintenance' } });
    const disposedAssets = await Asset.count({ where: { status: 'Disposed' } });

    // Get total value
    const assets = await Asset.findAll({
      attributes: ['currentValue']
    });
    const totalValue = assets.reduce((sum, asset) => sum + (parseFloat(asset.currentValue) || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        total: totalAssets,
        active: activeAssets,
        inactive: inactiveAssets,
        maintenance: maintenanceAssets,
        disposed: disposedAssets,
        totalValue: totalValue.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get asset stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset statistics',
      error: error.message
    });
  }
};