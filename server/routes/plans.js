const express = require('express');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply auth middleware
router.use(authenticateToken);

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    billingPeriod, 
    isActive,
    search 
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build filter object
  const filter = {};
  
  if (billingPeriod && billingPeriod !== 'all') {
    filter.billingPeriod = billingPeriod;
  }
  
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Get total count for pagination
  const totalPlans = await Plan.countDocuments(filter);
  
  // Get plans with pagination and populate subscriber count
  const plans = await Plan.find(filter)
    .populate('subscriberCount')
    .sort({ sortOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalPages = Math.ceil(totalPlans / parseInt(limit));

  res.json({
    success: true,
    data: {
      plans,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPlans,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

// @desc    Get single plan
// @route   GET /api/plans/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id).populate('subscriberCount');
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Plan not found'
    });
  }

  res.json({
    success: true,
    data: { plan }
  });
}));

// @desc    Create new plan (Admin only)
// @route   POST /api/plans
// @access  Private/Admin
router.post('/', asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const plan = await Plan.create(req.body);

  res.status(201).json({
    success: true,
    data: { plan }
  });
}));

// @desc    Update plan (Admin only)
// @route   PUT /api/plans/:id
// @access  Private/Admin
router.put('/:id', asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const plan = await Plan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Plan not found'
    });
  }

  res.json({
    success: true,
    data: { plan }
  });
}));

// @desc    Toggle plan status (Admin only)
// @route   PATCH /api/plans/:id/toggle-status
// @access  Private/Admin
router.patch('/:id/toggle-status', asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const plan = await Plan.findById(req.params.id);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Plan not found'
    });
  }

  plan.isActive = !plan.isActive;
  await plan.save();

  res.json({
    success: true,
    data: { plan }
  });
}));

// @desc    Delete plan (Admin only)
// @route   DELETE /api/plans/:id
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const plan = await Plan.findById(req.params.id);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Plan not found'
    });
  }

  // Check if plan has active subscriptions
  const activeSubscriptions = await Subscription.countDocuments({
    plan: req.params.id,
    status: 'active'
  });

  if (activeSubscriptions > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete plan with active subscriptions'
    });
  }

  await Plan.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Plan deleted successfully'
  });
}));

module.exports = router;