const express = require('express');
const AddonService = require('../models/AddonService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all addon services
// @route   GET /api/addons
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category, isActive = 'true' } = req.query;
  
  const filter = {};
  if (category) filter.category = category;
  if (isActive !== 'all') filter.isActive = isActive === 'true';

  const addons = await AddonService.find(filter).sort({ sortOrder: 1, createdAt: 1 });

  res.json({
    success: true,
    data: {
      addons,
      total: addons.length
    }
  });
}));

// @desc    Get addon service by ID
// @route   GET /api/addons/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const addon = await AddonService.findById(req.params.id);

  if (!addon) {
    return res.status(404).json({
      success: false,
      message: 'Addon service not found'
    });
  }

  res.json({
    success: true,
    data: addon
  });
}));

module.exports = router;
