const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Message = require('../models/Message');
const Favorite = require('../models/Favorite');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @desc    Get dashboard statistics and recent activities
// @route   GET /api/dashboard
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  // Only admin can access dashboard
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  // Get current date and first day of current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get total counts
  const [
    totalUsers,
    totalProperties,
    totalMessages,
    totalFavorites,
    activeProperties,
    newUsersThisMonth,
    newPropertiesThisMonth,
    newUsersLastMonth,
    newPropertiesLastMonth,
    // Revenue calculations from subscriptions
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Message.countDocuments(),
    Favorite.countDocuments(),
    Property.countDocuments({ status: 'available' }),
    User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
    Property.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
    User.countDocuments({ 
      createdAt: { 
        $gte: firstDayOfLastMonth, 
        $lte: lastDayOfLastMonth 
      } 
    }),
    Property.countDocuments({ 
      createdAt: { 
        $gte: firstDayOfLastMonth, 
        $lte: lastDayOfLastMonth 
      } 
    }),
    // Calculate total revenue from all subscriptions
    Subscription.aggregate([
      {
        $match: {
          status: { $in: ['active', 'expired'] }, // Include completed payments
          lastPaymentDate: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]).then(result => result.length > 0 ? result[0].totalAmount : 0),
    // Calculate revenue this month
    Subscription.aggregate([
      {
        $match: {
          status: { $in: ['active', 'expired'] },
          lastPaymentDate: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]).then(result => result.length > 0 ? result[0].totalAmount : 0),
    // Calculate revenue last month
    Subscription.aggregate([
      {
        $match: {
          status: { $in: ['active', 'expired'] },
          lastPaymentDate: { 
            $gte: firstDayOfLastMonth, 
            $lte: lastDayOfLastMonth 
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]).then(result => result.length > 0 ? result[0].totalAmount : 0)
  ]);

  // Calculate engagement rate (favorites per property)
  const engagementRate = totalProperties > 0 ? (totalFavorites / totalProperties) * 100 : 0;

  // Get recent subscription activities
  const recentSubscriptions = await Subscription.find({
    status: { $in: ['active', 'expired'] },
    lastPaymentDate: { $exists: true }
  })
    .sort({ lastPaymentDate: -1 })
    .limit(3)
    .populate('user', 'email profile.firstName profile.lastName')
    .populate('plan', 'name price');

  // Get recent activities
  const recentActivities = [];

  // Recent user registrations
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('email createdAt profile.firstName profile.lastName');

  recentActivities.push(...recentUsers.map(user => ({
    _id: user._id,
    type: 'user_registered',
    description: `New user registered: ${user.profile.firstName} ${user.profile.lastName}`,
    timestamp: user.createdAt,
    metadata: {
      email: user.email,
      name: `${user.profile.firstName} ${user.profile.lastName}`
    }
  })));

  // Recent property listings
  const recentProperties = await Property.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title createdAt status listingType')
    .populate('owner', 'email profile.firstName profile.lastName');

  recentActivities.push(...recentProperties.map(property => ({
    _id: property._id,
    type: 'property_listed',
    description: `New property listed: ${property.title}`,
    timestamp: property.createdAt,
    metadata: {
      title: property.title,
      listingType: property.listingType,
      ownerName: `${property.owner.profile.firstName} ${property.owner.profile.lastName}`
    }
  })));

  // Recent subscription purchases
  recentActivities.push(...recentSubscriptions.map(subscription => ({
    _id: subscription._id,
    type: 'subscription_purchased',
    description: `Subscription purchased: ${subscription.plan.name}`,
    timestamp: subscription.lastPaymentDate || subscription.createdAt,
    metadata: {
      planName: subscription.plan.name,
      amount: subscription.amount,
      userName: `${subscription.user.profile.firstName} ${subscription.user.profile.lastName}`,
      email: subscription.user.email
    }
  })));

  // Recent messages
  const recentMessages = await Message.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .select('subject createdAt')
    .populate('sender', 'profile.firstName profile.lastName')
    .populate('recipient', 'profile.firstName profile.lastName');

  recentActivities.push(...recentMessages.map(message => ({
    _id: message._id,
    type: 'inquiry_received',
    description: `New inquiry: ${message.subject}`,
    timestamp: message.createdAt,
    metadata: {
      subject: message.subject,
      senderName: `${message.sender.profile.firstName} ${message.sender.profile.lastName}`,
      recipientName: `${message.recipient.profile.firstName} ${message.recipient.profile.lastName}`
    }
  })));

  // Sort activities by timestamp
  recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Prepare response
  const stats = {
    totalUsers,
    totalProperties,
    totalRevenue: totalRevenue || 0,
    activeListings: activeProperties,
    newUsersThisMonth,
    newPropertiesThisMonth,
    revenueThisMonth: revenueThisMonth || 0,
    engagementRate: Math.round(engagementRate * 10) / 10, // Round to 1 decimal
    // Growth percentages
    userGrowth: newUsersLastMonth > 0 ? 
      Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 * 10) / 10 : 
      (newUsersThisMonth > 0 ? 100 : 0),
    propertyGrowth: newPropertiesLastMonth > 0 ? 
      Math.round(((newPropertiesThisMonth - newPropertiesLastMonth) / newPropertiesLastMonth) * 100 * 10) / 10 : 
      (newPropertiesThisMonth > 0 ? 100 : 0),
    revenueGrowth: revenueLastMonth > 0 ? 
      Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 * 10) / 10 : 
      (revenueThisMonth > 0 ? 100 : 0)
  };

  res.json({
    success: true,
    data: {
      stats,
      recentActivities: recentActivities.slice(0, 10) // Return top 10 activities
    }
  });
}));

module.exports = router;