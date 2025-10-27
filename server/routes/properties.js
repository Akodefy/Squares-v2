const express = require('express');
const Property = require('../models/Property');
const { asyncHandler, validateRequest } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
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

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }

    const property = await Property.findById(id)
      .populate('owner', 'profile.firstName profile.lastName email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: { property }
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property'
    });
  }
}));

// @desc    Create property
// @route   POST /api/properties
// @access  Private
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user.id,
      status: 'pending', // Vendor properties start as pending approval
      verified: false, // Requires admin verification
      createdAt: new Date()
    };

    const property = await Property.create(propertyData);
    await property.populate('owner', 'profile.firstName profile.lastName email');

    res.status(201).json({
      success: true,
      data: { property },
      message: 'Property submitted for approval. You will be notified once approved.'
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property'
    });
  }
}));

module.exports = router;