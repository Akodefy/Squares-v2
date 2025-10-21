const express = require('express');
const Property = require('../models/Property');
const { asyncHandler, validateRequest } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      listingType
    } = req.query;

    const skip = (page - 1) * limit;
    let queryFilter = { status: 'available' };

    // Apply filters
    if (location) {
      queryFilter.$or = [
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.locality': { $regex: location, $options: 'i' } }
      ];
    }

    if (minPrice) {
      queryFilter.price = { $gte: parseInt(minPrice) };
    }

    if (maxPrice) {
      queryFilter.price = { ...queryFilter.price, $lte: parseInt(maxPrice) };
    }

    if (propertyType) {
      queryFilter.type = propertyType;
    }

    if (bedrooms) {
      queryFilter.bedrooms = parseInt(bedrooms);
    }

    if (listingType) {
      queryFilter.listingType = listingType;
    }

    const totalProperties = await Property.countDocuments(queryFilter);
    const properties = await Property.find(queryFilter)
      .populate('owner', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProperties / limit),
          totalProperties
        }
      }
    });
  } catch (error) {
    throw error;
  }
}));

module.exports = router;