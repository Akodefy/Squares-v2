const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const { authenticateToken } = require('../middleware/authMiddleware');

// Admin access middleware
router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalProperties,
      newUsersThisMonth,
      newPropertiesThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Property.countDocuments({ createdAt: { $gte: firstDayOfMonth } })
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email profile.firstName profile.lastName createdAt');

    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'email profile.firstName profile.lastName');

    const stats = {
      totalUsers,
      totalProperties,
      newUsersThisMonth,
      newPropertiesThisMonth,
      recentActivities: [
        ...recentUsers.map(user => ({
          type: 'user_registered',
          description: `New user registered: ${user.profile?.firstName || 'User'} ${user.profile?.lastName || ''}`,
          date: user.createdAt
        })),
        ...recentProperties.map(property => ({
          type: 'property_listed',
          description: `New property listed: ${property.title}`,
          date: property.createdAt
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;
