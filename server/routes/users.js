const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const Message = require('../models/Message');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// @desc    Get all users (Admin/Vendor - Vendors can only fetch customers)
// @route   GET /api/users
// @access  Private/Admin/Vendor
router.get('/', authorizeRoles('admin', 'subadmin', 'superadmin', 'agent'), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    role, 
    status 
  } = req.query;

  console.log(`[Users API] User role: ${req.user.role}, Requested role filter: ${role}`);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build filter object
  const filter = {};
  
  // Always exclude superadmin users from the list
  filter.role = { $ne: 'superadmin' };
  
  // Vendors (agents) can only fetch customers with allowMessages enabled
  if (req.user.role === 'agent') {
    filter.role = 'customer';
    filter.status = 'active'; // Only active customers
    filter['profile.preferences.privacy.allowMessages'] = { $ne: false }; // Only customers who allow messages
  } else if (role && role !== 'superadmin') {
    // If role filter is provided, combine it with the superadmin exclusion
    filter.role = role;
  }
  
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } },
      { 'profile.phone': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status && req.user.role !== 'agent') {
    filter.status = status;
  }

  // Get total count for pagination
  const totalUsers = await User.countDocuments(filter);
  
  // Get users with pagination
  const users = await User.find(filter)
    .select('-password -verificationToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalPages = Math.ceil(totalUsers / parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

// @desc    Get all users (no pagination)
// @route   GET /api/users/all
// @access  Private (Admin only)
router.get('/all', authorizeRoles('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password -verificationToken')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      users
    }
  });
}));

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -verificationToken');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user statistics
  const [totalProperties, totalFavorites, totalMessages] = await Promise.all([
    Property.countDocuments({ owner: req.user.id }),
    Favorite.countDocuments({ user: req.user.id }),
    Message.countDocuments({ $or: [{ sender: req.user.id }, { recipient: req.user.id }] })
  ]);

  res.json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        statistics: {
          totalProperties,
          totalFavorites,
          totalMessages
        }
      }
    }
  });
}));

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -verificationToken');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
router.post('/', asyncHandler(async (req, res) => {
  const {
    email,
    password,
    profile,
    role = 'user',
    status = 'active'
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user - password will be hashed by pre-save middleware
  const user = await User.create({
    email,
    password, // Don't hash here, let the model's pre-save middleware handle it
    profile,
    role,
    status,
    emailVerified: true // Admin created users are auto-verified
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.verificationToken;

  res.status(201).json({
    success: true,
    data: { user: userResponse }
  });
}));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Only allow users to update their own profile or admin to update any
  if (req.user.id.toString() !== req.params.id && !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this user'
    });
  }

  const {
    profile,
    preferences,
    role,
    status
  } = req.body;

  // Helper function to deeply merge objects, filtering out undefined values
  const deepMerge = (target, source) => {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] === undefined) {
        continue; // Skip undefined values
      }
      
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // If both target and source have object values, merge them recursively
        if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
          result[key] = deepMerge(result[key], source[key]);
        } else {
          // Only set if source object has at least one defined value
          const hasDefinedValues = Object.values(source[key]).some(v => v !== undefined);
          if (hasDefinedValues) {
            result[key] = source[key];
          }
        }
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  };

  // Update fields
  if (profile) {
    user.profile = deepMerge(user.profile || {}, profile);
  }
  
  // Handle preferences if sent separately (for backward compatibility)
  if (preferences !== undefined && typeof preferences === 'object' && preferences !== null) {
    const hasValidValues = Object.values(preferences).some(value => value !== undefined);
    if (hasValidValues) {
      if (!user.profile.preferences) {
        user.profile.preferences = {};
      }
      user.profile.preferences = deepMerge(user.profile.preferences, preferences);
    }
  }

  // Only admin can update role and status
  if (['admin', 'superadmin'].includes(req.user.role)) {
    if (role) user.role = role;
    if (status) user.status = status;
  }

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.verificationToken;

  res.json({
    success: true,
    data: { user: userResponse }
  });
}));

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const {
    email,
    profile,
    preferences,
  } = req.body;

  // Update email if provided and different
  if (email && email !== user.email) {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email,
      _id: { $ne: user._id }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another account'
      });
    }
    
    user.email = email;
    user.emailVerified = false; // Reset verification status on email change
  }

  // Helper function to deeply merge objects, filtering out undefined values
  const deepMerge = (target, source) => {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] === undefined) {
        continue; // Skip undefined values
      }
      
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // If both target and source have object values, merge them recursively
        if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
          result[key] = deepMerge(result[key], source[key]);
        } else {
          // Only set if source object has at least one defined value
          const hasDefinedValues = Object.values(source[key]).some(v => v !== undefined);
          if (hasDefinedValues) {
            result[key] = source[key];
          }
        }
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  };

  // Update fields
  if (profile) {
    user.profile = deepMerge(user.profile || {}, profile);
  }
  
  // Handle preferences if sent separately (for backward compatibility)
  if (preferences !== undefined && typeof preferences === 'object' && preferences !== null) {
    const hasValidValues = Object.values(preferences).some(value => value !== undefined);
    if (hasValidValues) {
      if (!user.profile.preferences) {
        user.profile.preferences = {};
      }
      user.profile.preferences = deepMerge(user.profile.preferences, preferences);
    }
  }

  await user.save();

  // Get updated statistics
  const [totalProperties, totalFavorites, totalMessages] = await Promise.all([
    Property.countDocuments({ owner: req.user.id }),
    Favorite.countDocuments({ user: req.user.id }),
    Message.countDocuments({ $or: [{ sender: req.user.id }, { recipient: req.user.id }] })
  ]);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.verificationToken;

  res.json({
    success: true,
    data: { 
      user: {
        ...userResponse,
        statistics: {
          totalProperties,
          totalFavorites,
          totalMessages
        }
      }
    }
  });
}));

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
router.patch('/:id/status', asyncHandler(async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { status } = req.body;
  
  if (!['active', 'inactive', 'pending', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).select('-password -verificationToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// @desc    Promote user to different role
// @route   PATCH /api/users/:id/promote
// @access  Private/SuperAdmin
router.patch('/:id/promote', asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Superadmin access required to promote users'
    });
  }

  const { role } = req.body;
  
  const validRoles = ['customer', 'agent', 'admin', 'subadmin', 'superadmin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role value. Must be one of: ' + validRoles.join(', ')
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const oldRole = user.role;
  user.role = role;
  
  // Get role pages from Role collection
  try {
    const Role = require('../models/Role');
    const roleDoc = await Role.findOne({ name: role });
    
    if (roleDoc && roleDoc.pages) {
      user.rolePages = roleDoc.pages;
    } else {
      user.rolePages = [];
    }
  } catch (error) {
    console.error('Error fetching role pages:', error);
    user.rolePages = [];
  }

  await user.save();

  // Send notification email
  try {
    const { sendTemplateEmail } = require('../utils/emailService');
    await sendTemplateEmail(
      user.email,
      'role-promotion',
      {
        firstName: user.profile?.firstName || 'User',
        oldRole,
        newRole: role,
        websiteUrl: process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'
      }
    );
    console.log(`✅ Role promotion notification sent to ${user.email}`);
  } catch (emailError) {
    console.error('❌ Failed to send promotion notification email:', emailError);
  }

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.verificationToken;

  res.json({
    success: true,
    message: `User promoted from ${oldRole} to ${role}`,
    data: { user: userResponse }
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Superadmin access required to delete users. Current role: ' + req.user.role
    });
  }

  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Store user data for email notification before deletion
  const userData = {
    email: user.email,
    firstName: user.profile?.firstName || 'User',
    lastName: user.profile?.lastName || '',
    role: user.role
  };

  try {
    // Import email service
    const { sendTemplateEmail } = require('../utils/emailService');
    
    // Check for active properties or subscriptions before deletion
    
    const [properties, subscriptions] = await Promise.all([
      Property.countDocuments({ owner: req.params.id }),
      Subscription.countDocuments({ user: req.params.id, status: 'active' })
    ]);

    // Clean up related data first
    if (properties > 0) {
      // Deactivate user's properties instead of deleting them
      await Property.updateMany(
        { owner: req.params.id },
        { status: 'inactive', deactivatedAt: new Date() }
      );
    }

    if (subscriptions > 0) {
      // Cancel active subscriptions
      await Subscription.updateMany(
        { user: req.params.id, status: 'active' },
        { status: 'cancelled', cancelledAt: new Date() }
      );
    }

    // Clean up other related data (messages, notifications, etc.)
    
    await Promise.all([
      // Remove user's messages
      Message.deleteMany({ sender: req.params.id }),
      // Remove user's notifications
      Notification.deleteMany({ user: req.params.id })
    ]);

    // Delete the user completely from the database
    await User.findByIdAndDelete(req.params.id);

    // Send deletion notification email
    try {
      await sendTemplateEmail(
        userData.email,
        'account-deleted',
        {
          firstName: userData.firstName,
          email: userData.email,
          role: userData.role,
          deletionDate: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          reason: req.body.reason || 'Account deleted by administrator',
          websiteUrl: process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'
        }
      );
      console.log(`✅ Account deletion notification sent to ${userData.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send deletion notification email:', emailError);
      // Continue with deletion even if email fails
    }

    res.json({
      success: true,
      message: `User account permanently deleted and notification sent to ${userData.email}`,
      deletedUser: {
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Error during user deletion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user account: ' + error.message
    });
  }
}));

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
router.get('/activity', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get user's recent activities
  const activities = [];

  // Recent properties created
  const recentProperties = await Property.find({ owner: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title createdAt');

  activities.push(...recentProperties.map(property => ({
    type: 'property_created',
    action: 'Created property',
    details: property.title,
    timestamp: property.createdAt,
    metadata: { propertyId: property._id }
  })));

  // Recent favorites
  const recentFavorites = await Favorite.find({ user: req.user.id })
    .populate('property', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  activities.push(...recentFavorites.map(favorite => ({
    type: 'favorite_added',
    action: 'Added to favorites',
    details: favorite.property.title,
    timestamp: favorite.createdAt,
    metadata: { propertyId: favorite.property._id }
  })));

  // Recent messages
  const recentMessages = await Message.find({
    $or: [{ sender: req.user.id }, { recipient: req.user.id }]
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('subject createdAt sender recipient');

  activities.push(...recentMessages.map(message => ({
    type: 'message',
    action: message.sender.toString() === req.user.id.toString() ? 'Sent message' : 'Received message',
    details: message.subject,
    timestamp: message.createdAt,
    metadata: { messageId: message._id }
  })));

  // Sort all activities by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Apply pagination
  const paginatedActivities = activities.slice(skip, skip + parseInt(limit));
  const totalCount = activities.length;
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      activities: paginatedActivities,
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

module.exports = router;