const express = require('express');
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get total count for pagination
  const totalCount = await Favorite.countDocuments({ user: req.user._id });

  // Get favorites with populated property data
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({
      path: 'property',
      populate: {
        path: 'owner',
        select: 'email profile.firstName profile.lastName profile.phone'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      favorites: favorites.map(fav => ({
        _id: fav._id,
        addedAt: fav.createdAt,
        property: fav.property
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    }
  });
}));

// @desc    Add property to favorites
// @route   POST /api/favorites/:propertyId
// @access  Private
router.post('/:propertyId', asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if already in favorites
  const existingFavorite = await Favorite.findOne({
    user: req.user._id,
    property: propertyId
  });

  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: 'Property already in favorites'
    });
  }

  // Add to favorites
  const favorite = await Favorite.create({
    user: req.user._id,
    property: propertyId
  });

  await favorite.populate('property');

  res.status(201).json({
    success: true,
    message: 'Property added to favorites',
    data: { favorite }
  });
}));

// @desc    Remove property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private
router.delete('/:propertyId', asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const result = await Favorite.deleteOne({
    user: req.user._id,
    property: propertyId
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Favorite not found'
    });
  }

  res.json({
    success: true,
    message: 'Property removed from favorites'
  });
}));

// @desc    Check if property is in favorites
// @route   GET /api/favorites/check/:propertyId
// @access  Private
router.get('/check/:propertyId', asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const favorite = await Favorite.findOne({
    user: req.user._id,
    property: propertyId
  });

  res.json({
    success: true,
    data: {
      isFavorite: !!favorite
    }
  });
}));

// @desc    Bulk remove favorites
// @route   DELETE /api/favorites/bulk
// @access  Private
router.delete('/bulk', asyncHandler(async (req, res) => {
  const { propertyIds } = req.body;

  if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Property IDs array is required'
    });
  }

  const result = await Favorite.deleteMany({
    user: req.user._id,
    property: { $in: propertyIds }
  });

  res.json({
    success: true,
    message: `${result.deletedCount} properties removed from favorites`
  });
}));

module.exports = router;