const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Message = require('../models/Message');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Middleware to check if user is vendor/agent
const requireVendorRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Allow both 'agent' and 'admin' roles to access vendor routes
  // Also allow users who might be registered as vendors but have different role
  if (!['agent', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions. Vendor access required.'
    });
  }

  next();
};

// @desc    Get vendor statistics
// @route   GET /api/vendors/statistics
// @access  Private/Agent
router.get('/statistics', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;

  // Get vendor's properties count
  const totalProperties = await Property.countDocuments({ owner: vendorId });

  // Calculate total property value
  const properties = await Property.find({ owner: vendorId }).select('price');
  const totalValue = properties.reduce((sum, property) => {
    const price = parseFloat(property.price.toString().replace(/[^0-9.]/g, ''));
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  // Get property counts by status
  const [activeProperties, soldProperties, pendingProperties] = await Promise.all([
    Property.countDocuments({ owner: vendorId, status: 'available' }),
    Property.countDocuments({ owner: vendorId, status: 'sold' }),
    Property.countDocuments({ owner: vendorId, status: 'pending' })
  ]);

  // Calculate total views across all properties
  const viewsAggregation = await Property.aggregate([
    { $match: { owner: vendorId } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]);
  const totalViews = viewsAggregation[0]?.totalViews || 0;

  // Format total value in Cr/Lakhs
  const formatValue = (value) => {
    if (value >= 10000000) { // 1 Cr
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) { // 1 Lakh
      return `₹${(value / 100000).toFixed(1)} L`;
    } else {
      return `₹${value.toLocaleString()}`;
    }
  };

  // Get total leads (inquiries/messages about vendor's properties)
  const totalLeads = await Message.countDocuments({
    recipient: vendorId,
    type: { $in: ['inquiry', 'lead', 'property_inquiry'] }
  });

  // Calculate average response time (simplified - you may want to make this more sophisticated)
  const recentMessages = await Message.find({
    sender: vendorId,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  }).sort({ createdAt: -1 }).limit(10);

  let avgResponseTime = "Not calculated";
  if (recentMessages.length > 0) {
    // Simplified calculation - in real scenario, you'd need to track inquiry-response pairs
    avgResponseTime = "2.3 hours"; // Placeholder
  }

  // Get vendor profile for additional stats
  const vendor = await User.findById(vendorId);
  const totalSales = vendor?.profile?.vendorInfo?.rating?.count || 0;

  res.json({
    success: true,
    data: {
      totalProperties,
      totalSales,
      totalValue: formatValue(totalValue),
      totalLeads,
      totalViews,
      avgResponseTime,
      rating: vendor?.profile?.vendorInfo?.rating?.average || 0,
      reviewCount: vendor?.profile?.vendorInfo?.rating?.count || 0,
      activeProperties,
      soldProperties,
      pendingProperties
    }
  });
}));

// @desc    Update vendor rating
// @route   POST /api/vendors/rating
// @access  Private
router.post('/rating', asyncHandler(async (req, res) => {
  const { vendorId, rating, review } = req.body;

  if (!vendorId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Valid vendor ID and rating (1-5) are required'
    });
  }

  const vendor = await User.findById(vendorId);
  if (!vendor || vendor.role !== 'agent') {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  // Calculate new rating
  const currentRating = vendor.profile.vendorInfo.rating.average || 0;
  const currentCount = vendor.profile.vendorInfo.rating.count || 0;
  
  const newCount = currentCount + 1;
  const newAverage = ((currentRating * currentCount) + rating) / newCount;

  // Update vendor rating
  vendor.profile.vendorInfo.rating = {
    average: Math.round(newAverage * 10) / 10, // Round to 1 decimal
    count: newCount
  };

  await vendor.save();

  res.json({
    success: true,
    message: 'Rating submitted successfully',
    data: {
      newRating: vendor.profile.vendorInfo.rating
    }
  });
}));

// @desc    Get vendor's properties
// @route   GET /api/vendors/properties
// @access  Private/Agent
router.get('/properties', authorizeRoles(['agent']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10,
    status,
    type,
    sort = '-createdAt'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build filter object
  const filter = { owner: req.user.id };
  
  if (status) {
    filter.status = status;
  }
  
  if (type) {
    filter.type = type;
  }

  // Get total count for pagination
  const totalProperties = await Property.countDocuments(filter);
  
  // Get properties with pagination
  const properties = await Property.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('owner', 'profile.firstName profile.lastName email');

  const totalPages = Math.ceil(totalProperties / parseInt(limit));

  res.json({
    success: true,
    data: {
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProperties,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

// @desc    Get vendor leads/inquiries
// @route   GET /api/vendors/leads
// @access  Private/Agent
router.get('/leads', authorizeRoles(['agent']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10,
    status = 'unread'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get leads (messages sent to this vendor)
  const filter = {
    recipient: req.user.id,
    type: { $in: ['inquiry', 'lead', 'property_inquiry', 'contact'] }
  };

  if (status !== 'all') {
    filter.status = status;
  }

  // Get total count for pagination
  const totalLeads = await Message.countDocuments(filter);
  
  // Get leads with pagination
  const leads = await Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('sender', 'profile.firstName profile.lastName email profile.phone')
    .populate('property', 'title location price images');

  const totalPages = Math.ceil(totalLeads / parseInt(limit));

  res.json({
    success: true,
    data: {
      leads,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalLeads,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

// @desc    Check vendor subscription
// @route   GET /api/vendors/subscription/check/:subscriptionName
// @access  Private/Agent
router.get('/subscription/check/:subscriptionName', requireVendorRole, asyncHandler(async (req, res) => {
  const { subscriptionName } = req.params;
  const vendorId = req.user.id;
  
  // For now, we'll simulate checking subscription
  // In a real implementation, you would check against a Subscription model
  // that links users to their purchased plans/features
  
  try {
    const Subscription = require('../models/Subscription');
    const Plan = require('../models/Plan');
    
    // Check if vendor has active subscription
    const activeSubscription = await Subscription.findOne({
      user: vendorId, // Changed from userId to user
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('plan'); // Changed from planId to plan
    
    let hasSubscription = false;
    
    if (activeSubscription) {
      // Check if the active subscription plan includes the requested feature
      const plan = activeSubscription.plan; // Changed from planId to plan
      
      // Map subscription names to plan features and limits
      const featureMapping = {
        'addPropertySubscription': {
          hasAccess: true, // All plans allow adding properties
          limit: plan.limits?.properties || 0 // 0 means unlimited
        },
        'featuredListingSubscription': {
          hasAccess: plan.limits?.featuredListings > 0 || plan.name === 'Enterprise Plan',
          limit: plan.limits?.featuredListings || 0
        },
        'premiumAnalyticsSubscription': {
          hasAccess: plan.features?.includes('Detailed analytics & insights') || 
                    plan.features?.includes('Advanced analytics & reports') ||
                    plan.name === 'Premium Plan' || plan.name === 'Enterprise Plan',
          limit: 0
        },
        'leadManagementSubscription': {
          hasAccess: plan.limits?.leadManagement !== undefined,
          limit: plan.limits?.leadManagement === 'enterprise' ? 0 : 
                 plan.limits?.leadManagement === 'advanced' ? 1000 : 50
        }
      };
      
      const feature = featureMapping[subscriptionName];
      hasSubscription = feature ? feature.hasAccess : false;
    }
    
    // Remove demo override - now properly check subscriptions
    // Only allow access if user has an active subscription
    
    res.json({
      success: true,
      data: {
        hasSubscription,
        subscriptionName
      }
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription'
    });
  }
}));

// @desc    Get vendor subscriptions
// @route   GET /api/vendors/subscriptions
// @access  Private/Agent
router.get('/subscriptions', authorizeRoles(['agent']), asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  
  try {
    const Subscription = require('../models/Subscription');
    
    // Get vendor's active subscriptions
    const activeSubscriptions = await Subscription.find({
      userId: vendorId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('planId');
    
    // Map subscriptions to expected format
    const subscriptionsMap = {
      'addPropertySubscription': { isActive: true, expiresAt: null }, // Allow by default for demo
      'featuredListingSubscription': { isActive: false, expiresAt: null },
      'premiumAnalyticsSubscription': { isActive: false, expiresAt: null },
      'leadManagementSubscription': { isActive: false, expiresAt: null }
    };
    
    // Update based on active subscriptions
    activeSubscriptions.forEach(subscription => {
      const plan = subscription.planId;
      const expiresAt = subscription.endDate.toISOString();
      
      if (plan.limits?.featuredListings > 0 || plan.name === 'Enterprise Plan') {
        subscriptionsMap['featuredListingSubscription'] = { isActive: true, expiresAt };
      }
      if (plan.features?.includes('Detailed analytics & insights') || 
          plan.features?.includes('Advanced analytics & reports') ||
          plan.name === 'Premium Plan' || plan.name === 'Enterprise Plan') {
        subscriptionsMap['premiumAnalyticsSubscription'] = { isActive: true, expiresAt };
      }
      if (plan.limits?.leadManagement) {
        subscriptionsMap['leadManagementSubscription'] = { isActive: true, expiresAt };
      }
    });
    
    // Convert to array format
    const subscriptions = Object.entries(subscriptionsMap).map(([name, data]) => ({
      name,
      isActive: data.isActive,
      expiresAt: data.expiresAt
    }));
    
    res.json({
      success: true,
      data: {
        subscriptions: subscriptions
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
}));

// @desc    Activate vendor subscription after payment
// @route   POST /api/vendors/subscription/activate
// @access  Private/Agent
router.post('/subscription/activate', requireVendorRole, asyncHandler(async (req, res) => {
  const { planId, paymentId } = req.body;
  const vendorId = req.user.id;
  
  try {
    if (!planId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and Payment ID are required'
      });
    }

    // In a real implementation, you would:
    // 1. Verify the payment with Razorpay
    // 2. Get the plan details from Plan model
    // 3. Create or update the Subscription record
    // 4. Update user's subscription status
    
    // For now, we'll simulate successful activation
    const Plan = require('../models/Plan');
    const Subscription = require('../models/Subscription');
    
    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create or update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { user: vendorId, plan: planId }, // Changed userId to user, planId to plan
      {
        user: vendorId, // Changed from userId to user
        plan: planId, // Changed from planId to plan
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + (plan.duration || 30) * 24 * 60 * 60 * 1000), // Add duration in days, default 30 days
        transactionId: paymentId, // Changed from paymentId to transactionId
        amount: plan.price
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        subscription: {
          id: subscription._id,
          planName: plan.name,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate
        }
      }
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate subscription'
    });
  }
}));

// @desc    Get vendor lead statistics
// @route   GET /api/vendors/lead-stats
// @access  Private/Agent
router.get('/lead-stats', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;

  try {
    // Mock lead statistics - in real implementation, you would fetch from Lead model
    const leadStats = {
      totalLeads: 45,
      newLeads: 12,
      contactedLeads: 28,
      convertedLeads: 5,
      leadTrends: {
        thisMonth: 15,
        lastMonth: 12,
        growth: 25
      },
      leadSources: {
        website: 25,
        social: 12,
        referral: 8
      },
      conversionRate: 11.1
    };

    res.json({
      success: true,
      data: leadStats
    });
  } catch (error) {
    console.error('Lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead statistics'
    });
  }
}));

// @desc    Get vendor analytics overview
// @route   GET /api/vendors/analytics/overview
// @access  Private/Agent
router.get('/analytics/overview', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const { timeframe = '30days' } = req.query;

  try {
    // Mock analytics data - in real implementation, you would calculate from actual data
    const analyticsData = {
      totalViews: 2847,
      totalLeads: 45,
      totalProperties: 12,
      conversionRate: 1.58,
      trends: {
        views: {
          current: 2847,
          previous: 2156,
          growth: 32.1
        },
        leads: {
          current: 45,
          previous: 38,
          growth: 18.4
        },
        properties: {
          current: 12,
          previous: 10,
          growth: 20.0
        }
      },
      chartData: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        views: [650, 720, 890, 587],
        leads: [8, 12, 15, 10],
        inquiries: [15, 18, 22, 16]
      }
    };

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview'
    });
  }
}));

// @desc    Get vendor performance metrics
// @route   GET /api/vendors/analytics/performance
// @access  Private/Agent
router.get('/analytics/performance', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const { timeframe = '30days' } = req.query;

  try {
    // Mock performance data
    const performanceData = {
      propertyPerformance: [
        {
          propertyId: '1',
          title: 'Luxury Villa in Bandra',
          views: 456,
          leads: 12,
          inquiries: 8,
          conversionRate: 2.6
        },
        {
          propertyId: '2', 
          title: '3BHK Apartment in Powai',
          views: 389,
          leads: 9,
          inquiries: 6,
          conversionRate: 2.3
        }
      ],
      topPerformingProperties: [
        { id: '1', title: 'Luxury Villa in Bandra', metric: 'views', value: 456 },
        { id: '2', title: '3BHK Apartment in Powai', metric: 'leads', value: 9 }
      ],
      timeSeriesData: {
        daily: {
          labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
          views: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 20),
          leads: Array.from({ length: 30 }, () => Math.floor(Math.random() * 5) + 1)
        }
      }
    };

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics'
    });
  }
}));

// @desc    Check vendor subscription status
// @route   GET /api/vendors/subscription-status
// @access  Private/Agent
router.get('/subscription-status', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;

  try {
    const Subscription = require('../models/Subscription');
    
    const activeSubscription = await Subscription.findOne({
      user: vendorId, // Changed from userId to user
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate([
      { path: 'plan' },
      { path: 'addons', select: 'name description price category billingType' }
    ]); // Changed from planId to plan and added addons population

    if (activeSubscription) {
      res.json({
        success: true,
        data: {
          hasActiveSubscription: true,
          subscription: {
            id: activeSubscription._id,
            planName: activeSubscription.plan.name, // Changed from planId to plan
            planId: activeSubscription.plan._id, // Changed from planId to plan
            status: activeSubscription.status,
            startDate: activeSubscription.startDate,
            endDate: activeSubscription.endDate,
            features: activeSubscription.plan.features, // Changed from planId to plan
            billingCycle: activeSubscription.billingCycle || 'monthly',
            addons: activeSubscription.addons || [], // Include purchased addons
            amount: activeSubscription.amount,
            currency: activeSubscription.currency
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          hasActiveSubscription: false,
          subscription: null
        }
      });
    }
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status'
    });
  }
}));

// @desc    Get vendor leads
// @route   GET /api/vendors/leads
// @access  Private/Agent
router.get('/leads', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  try {
    // Mock lead data - in real implementation, you would fetch from Lead model
    const mockLeads = [
      {
        id: '1',
        propertyTitle: 'Luxury Villa in Bandra',
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul@example.com',
        customerPhone: '+91 9876543210',
        status: 'new',
        message: 'Interested in visiting this property',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        budget: '2.5 Cr'
      },
      {
        id: '2',
        propertyTitle: '3BHK Apartment in Powai',
        customerName: 'Priya Patel',
        customerEmail: 'priya@example.com',
        customerPhone: '+91 9876543211',
        status: 'contacted',
        message: 'Looking for immediate possession',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        budget: '1.8 Cr'
      },
      {
        id: '3',
        propertyTitle: 'Commercial Office Space',
        customerName: 'Amit Kumar',
        customerEmail: 'amit@example.com',
        customerPhone: '+91 9876543212',
        status: 'converted',
        message: 'Need office space for IT company',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        budget: '5 Cr'
      }
    ];

    // Apply filters
    let filteredLeads = mockLeads;
    if (status && status !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        leads: paginatedLeads,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredLeads.length / limit),
          totalLeads: filteredLeads.length,
          hasNext: startIndex + parseInt(limit) < filteredLeads.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Vendor leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor leads'
    });
  }
}));

// @desc    Get vendor subscription details (for billing page)
// @route   GET /api/vendors/subscription/current
// @access  Private/Agent
router.get('/subscription/current', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;

  try {
    const Subscription = require('../models/Subscription');
    
    const activeSubscription = await Subscription.findOne({
      user: vendorId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate([
      { path: 'plan' },
      { path: 'addons', select: 'name description price category billingType' }
    ]);

    if (activeSubscription) {
      res.json({
        success: true,
        data: {
          _id: activeSubscription._id,
          vendorId: activeSubscription.user,
          planId: activeSubscription.plan._id,
          plan: activeSubscription.plan,
          status: activeSubscription.status,
          billingCycle: activeSubscription.billingCycle || 'monthly',
          startDate: activeSubscription.startDate,
          endDate: activeSubscription.endDate,
          nextBillingDate: activeSubscription.nextBillingDate || activeSubscription.endDate,
          amount: activeSubscription.amount,
          currency: activeSubscription.currency || 'INR',
          autoRenew: activeSubscription.autoRenew,
          addons: activeSubscription.addons || [],
          createdAt: activeSubscription.createdAt,
          updatedAt: activeSubscription.updatedAt
        }
      });
    } else {
      res.json({
        success: false,
        message: 'No active subscription found'
      });
    }
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current subscription'
    });
  }
}));

// @desc    Get vendor payments
// @route   GET /api/vendors/payments
// @access  Private/Agent
router.get('/payments', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const { page = 1, limit = 20, dateFrom } = req.query;

  try {
    const Subscription = require('../models/Subscription');
    
    // Build query
    let query = { user: vendorId };
    if (dateFrom) {
      query.createdAt = { $gte: new Date(dateFrom) };
    }
    
    // Get payments (subscriptions with payment details)
    const payments = await Subscription.find(query)
      .populate('plan', 'name description')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalPayments = await Subscription.countDocuments(query);

    // Format payments data
    const formattedPayments = payments.map(payment => ({
      id: payment._id,
      date: payment.createdAt,
      amount: payment.amount,
      currency: payment.currency || 'INR',
      status: payment.status === 'active' ? 'completed' : payment.status,
      method: payment.paymentMethod || 'razorpay',
      description: `${payment.plan?.name} Subscription`,
      transactionId: payment.transactionId,
      plan: payment.plan
    }));

    res.json({
      success: true,
      data: {
        payments: formattedPayments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalPayments,
          pages: Math.ceil(totalPayments / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
}));

// @desc    Get vendor invoices
// @route   GET /api/vendors/invoices
// @access  Private/Agent
router.get('/invoices', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const Subscription = require('../models/Subscription');
    
    // Get subscriptions as invoices
    const subscriptions = await Subscription.find({ user: vendorId })
      .populate('plan', 'name description')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalInvoices = await Subscription.countDocuments({ user: vendorId });

    // Format invoices data
    const formattedInvoices = subscriptions.map(subscription => ({
      id: subscription._id,
      invoiceNumber: `INV-${subscription._id.toString().slice(-8).toUpperCase()}`,
      date: subscription.createdAt,
      dueDate: subscription.endDate,
      amount: subscription.amount,
      currency: subscription.currency || 'INR',
      status: subscription.status === 'active' ? 'paid' : 
               subscription.status === 'expired' ? 'overdue' : 'pending',
      description: `${subscription.plan?.name} Subscription`,
      plan: subscription.plan
    }));

    res.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalInvoices,
          pages: Math.ceil(totalInvoices / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
}));

// @desc    Get vendor billing stats
// @route   GET /api/vendors/billing/stats
// @access  Private/Agent
router.get('/billing/stats', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;

  try {
    const Subscription = require('../models/Subscription');
    
    // Get all vendor subscriptions
    const subscriptions = await Subscription.find({ user: vendorId });
    
    // Calculate stats
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const totalInvoices = subscriptions.length;
    
    // Get active subscription for next billing
    const activeSubscription = await Subscription.findOne({
      user: vendorId,
      status: 'active',
      endDate: { $gt: new Date() }
    });
    
    const nextBillingAmount = activeSubscription ? activeSubscription.amount : 0;

    // Mock usage stats
    const usageStats = {
      propertiesPosted: 5,
      maxProperties: activeSubscription ? 50 : 0,
      leadsReceived: 25,
      maxLeads: activeSubscription ? 100 : 0,
      usagePercentage: 50
    };

    res.json({
      success: true,
      data: {
        totalRevenue,
        nextBillingAmount,
        totalInvoices,
        usageStats
      }
    });
  } catch (error) {
    console.error('Get billing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing stats'
    });
  }
}));

// @desc    Get vendor billing stats
// @route   GET /api/vendors/billing/stats
// @access  Private/Agent
router.get('/billing/stats', requireVendorRole, asyncHandler(async (req, res) => {
  const vendorId = req.user.id;

  try {
    const Subscription = require('../models/Subscription');
    
    // Get current subscription
    const currentSubscription = await Subscription.findOne({
      user: vendorId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('plan');

    // Calculate stats
    const totalSpent = await Subscription.aggregate([
      { $match: { user: vendorId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalTransactions = await Subscription.countDocuments({ user: vendorId });
    
    const nextBilling = currentSubscription ? currentSubscription.endDate : null;
    const monthlySpend = currentSubscription ? currentSubscription.amount : 0;

    res.json({
      success: true,
      data: {
        totalSpent: totalSpent[0]?.total || 0,
        monthlySpend,
        totalTransactions,
        nextBilling,
        currency: 'INR',
        savings: billingCycle === 'yearly' ? Math.round(monthlySpend * 2) : 0 // 2 months free calculation
      }
    });
  } catch (error) {
    console.error('Get billing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing stats'
    });
  }
}));

module.exports = router;