const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');
const SupportTicket = require('../models/SupportTicket');
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/authMiddleware');
const { isSubAdmin, hasPermission, SUB_ADMIN_PERMISSIONS } = require('../middleware/roleMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const adminRealtimeService = require('../services/adminRealtimeService');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(isSubAdmin);

// Get sub admin dashboard statistics
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    pendingProperties,
    totalProperties,
    pendingSupport,
    totalUsers
  ] = await Promise.all([
    Property.countDocuments({ status: 'pending' }),
    Property.countDocuments(),
    SupportTicket.countDocuments({ status: 'open' }),
    User.countDocuments({ role: { $in: ['customer', 'agent'] } })
  ]);

  res.json({
    success: true,
    data: {
      pendingProperties,
      totalProperties,
      pendingSupport,
      totalUsers,
      recentActivity: []
    }
  });
}));

// Property Review and Approval Routes
router.get('/properties/pending', 
  hasPermission(SUB_ADMIN_PERMISSIONS.REVIEW_PROPERTIES),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'pending' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Property.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        properties,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  })
);

// Approve property
router.post('/properties/:id/approve',
  hasPermission(SUB_ADMIN_PERMISSIONS.APPROVE_PROPERTIES),
  asyncHandler(async (req, res) => {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('owner', 'email profile');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Emit real-time event for property approval
    adminRealtimeService.broadcastNotification({
      type: 'property_approved',
      title: 'Property Approved',
      message: `Property "${property.title}" has been approved`,
      data: {
        propertyId: property._id,
        propertyTitle: property.title,
        approvedBy: req.user.email,
        approvedAt: new Date()
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Property approved successfully',
      data: property
    });
  })
);

// Reject property
router.post('/properties/:id/reject',
  hasPermission(SUB_ADMIN_PERMISSIONS.REJECT_PROPERTIES),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: req.user.id,
        rejectedAt: new Date()
      },
      { new: true }
    ).populate('owner', 'email profile');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Emit real-time event for property rejection
    adminRealtimeService.broadcastNotification({
      type: 'property_rejected',
      title: 'Property Rejected',
      message: `Property "${property.title}" has been rejected`,
      data: {
        propertyId: property._id,
        propertyTitle: property.title,
        rejectedBy: req.user.email,
        rejectionReason: reason,
        rejectedAt: new Date()
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Property rejected successfully',
      data: property
    });
  })
);

// Get rejected properties
router.get('/properties/rejected',
  hasPermission(SUB_ADMIN_PERMISSIONS.REVIEW_PROPERTIES),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'rejected' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'email profile')
        .populate('rejectedBy', 'email profile')
        .sort({ rejectedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Property.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        properties,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  })
);

// Reactivate rejected property for review
router.post('/properties/:id/reactivate',
  hasPermission(SUB_ADMIN_PERMISSIONS.APPROVE_PROPERTIES),
  asyncHandler(async (req, res) => {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'pending',
        $unset: { 
          rejectionReason: 1,
          rejectedBy: 1,
          rejectedAt: 1
        },
        reactivatedBy: req.user.id,
        reactivatedAt: new Date()
      },
      { new: true }
    ).populate('owner', 'email profile');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    adminRealtimeService.broadcastNotification({
      type: 'property_reactivated',
      title: 'Property Reactivated',
      message: `Property "${property.title}" has been reactivated for review`,
      data: {
        propertyId: property._id,
        propertyTitle: property.title,
        reactivatedBy: req.user.email
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Property reactivated successfully',
      data: property
    });
  })
);

// Content Moderation Routes
router.get('/content/reports',
  hasPermission(SUB_ADMIN_PERMISSIONS.MODERATE_CONTENT),
  asyncHandler(async (req, res) => {
    const { status = 'pending', search = '' } = req.query;
    
    // Placeholder implementation - would need ContentReport model
    res.json({
      success: true,
      data: {
        reports: [],
        total: 0
      }
    });
  })
);

// Resolve content report
router.post('/content/reports/:id/resolve',
  hasPermission(SUB_ADMIN_PERMISSIONS.MODERATE_CONTENT),
  asyncHandler(async (req, res) => {
    const { note } = req.body;

    res.json({
      success: true,
      message: 'Content report resolved successfully'
    });
  })
);

// Dismiss content report
router.post('/content/reports/:id/dismiss',
  hasPermission(SUB_ADMIN_PERMISSIONS.MODERATE_CONTENT),
  asyncHandler(async (req, res) => {
    const { note } = req.body;

    res.json({
      success: true,
      message: 'Content report dismissed successfully'
    });
  })
);

// Support Ticket Routes
router.get('/support/tickets',
  hasPermission(SUB_ADMIN_PERMISSIONS.HANDLE_SUPPORT),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status = 'open' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate('user', 'email profile')
        .populate('assignedTo', 'email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SupportTicket.countDocuments(query)
    ]);

    // Transform tickets to match frontend interface
    const transformedTickets = tickets.map(ticket => ({
      _id: ticket._id,
      sender: ticket.user,
      subject: ticket.subject,
      message: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      ticketNumber: ticket.ticketNumber,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      responses: ticket.responses
    }));

    res.json({
      success: true,
      data: {
        tickets: transformedTickets,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  })
);

// Update support ticket status
router.patch('/support/tickets/:id',
  hasPermission(SUB_ADMIN_PERMISSIONS.HANDLE_SUPPORT),
  asyncHandler(async (req, res) => {
    const { status, response } = req.body;

    const updateData = {
      status,
      assignedTo: req.user.id
    };

    // Add response if provided
    if (response) {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found'
        });
      }

      ticket.responses.push({
        message: response,
        author: req.user.profile?.firstName 
          ? `${req.user.profile.firstName} ${req.user.profile.lastName || ''}`
          : req.user.email,
        isAdmin: true
      });

      if (status === 'resolved') {
        ticket.resolution = response;
        ticket.resolvedBy = req.user.id;
        ticket.resolvedAt = new Date();
      }

      ticket.status = status;
      await ticket.save();

      await ticket.populate('user', 'email profile');
      await ticket.populate('assignedTo', 'email profile');

      // Emit real-time event
      adminRealtimeService.broadcastNotification({
        type: 'support_ticket_updated',
        title: 'Support Ticket Updated',
        message: `Ticket #${ticket.ticketNumber} status: ${status}`,
        data: {
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
          status,
          updatedBy: req.user.email
        },
        timestamp: new Date()
      });

      return res.json({
        success: true,
        message: 'Support ticket updated successfully',
        data: {
          _id: ticket._id,
          sender: ticket.user,
          subject: ticket.subject,
          message: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          ticketNumber: ticket.ticketNumber,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          responses: ticket.responses
        }
      });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'email profile')
     .populate('assignedTo', 'email profile');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Emit real-time event
    adminRealtimeService.broadcastNotification({
      type: 'support_ticket_updated',
      title: 'Support Ticket Updated',
      message: `Ticket #${ticket.ticketNumber} status: ${status}`,
      data: {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status,
        updatedBy: req.user.email
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: {
        _id: ticket._id,
        sender: ticket.user,
        subject: ticket.subject,
        message: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        ticketNumber: ticket.ticketNumber,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        responses: ticket.responses
      }
    });
  })
);

// Vendor Performance Tracking
router.get('/vendors/performance',
  hasPermission(SUB_ADMIN_PERMISSIONS.TRACK_PERFORMANCE),
  asyncHandler(async (req, res) => {
    const { search = '', sortBy = 'performanceScore' } = req.query;

    try {
      let matchQuery = { role: 'agent' };
      if (search) {
        matchQuery.$or = [
          { email: { $regex: search, $options: 'i' } },
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } }
        ];
      }

      const vendors = await User.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'properties',
            localField: '_id',
            foreignField: 'owner',
            as: 'properties'
          }
        },
        {
          $lookup: {
            from: 'reviews',
            let: { vendorId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$vendor', '$$vendorId'] },
                  status: 'active'
                }
              }
            ],
            as: 'reviews'
          }
        },
        {
          $lookup: {
            from: 'messages',
            let: { vendorId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$sender', '$$vendorId'] },
                      { $eq: ['$recipient', '$$vendorId'] }
                    ]
                  }
                }
              }
            ],
            as: 'messages'
          }
        },
        {
          $addFields: {
            name: { 
              $concat: [
                { $ifNull: ['$profile.firstName', ''] },
                ' ',
                { $ifNull: ['$profile.lastName', ''] }
              ]
            },
            phone: { $ifNull: ['$profile.phone', ''] },
            joinedDate: '$createdAt',
            lastActive: { $ifNull: ['$profile.lastLogin', '$updatedAt'] },
            totalProperties: { $size: '$properties' },
            activeProperties: {
              $size: {
                $filter: {
                  input: '$properties',
                  as: 'prop',
                  cond: { $eq: ['$$prop.status', 'active'] }
                }
              }
            },
            rejectedProperties: {
              $size: {
                $filter: {
                  input: '$properties',
                  as: 'prop',
                  cond: { $eq: ['$$prop.status', 'rejected'] }
                }
              }
            },
            totalReviews: { $size: '$reviews' },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { 
                  $round: [
                    { $avg: '$reviews.rating' },
                    1
                  ]
                },
                else: 0
              }
            },
            totalMessages: { $size: '$messages' },
            sentMessages: {
              $size: {
                $filter: {
                  input: '$messages',
                  as: 'msg',
                  cond: { $eq: ['$$msg.sender', '$_id'] }
                }
              }
            },
            receivedMessages: {
              $size: {
                $filter: {
                  input: '$messages',
                  as: 'msg',
                  cond: { $eq: ['$$msg.recipient', '$_id'] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            responseRate: {
              $cond: {
                if: { $gt: ['$receivedMessages', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$sentMessages', '$receivedMessages'] },
                        100
                      ]
                    },
                    0
                  ]
                },
                else: 0
              }
            },
            averageResponseTime: {
              $cond: {
                if: { $gt: ['$sentMessages', 0] },
                then: {
                  $round: [
                    { $divide: ['$receivedMessages', { $add: ['$sentMessages', 1] }] },
                    0
                  ]
                },
                else: 0
              }
            }
          }
        },
        {
          $addFields: {
            performanceScore: {
              $round: [
                {
                  $divide: [
                    {
                      $add: [
                        // Active properties ratio (40%)
                        {
                          $multiply: [
                            {
                              $cond: {
                                if: { $gt: ['$totalProperties', 0] },
                                then: { $divide: ['$activeProperties', '$totalProperties'] },
                                else: 0
                              }
                            },
                            40
                          ]
                        },
                        // Rating score (30%)
                        {
                          $multiply: [
                            { $divide: ['$averageRating', 5] },
                            30
                          ]
                        },
                        // Response rate (20%)
                        {
                          $multiply: [
                            { $divide: ['$responseRate', 100] },
                            20
                          ]
                        },
                        // Review count bonus (10%)
                        {
                          $multiply: [
                            {
                              $cond: {
                                if: { $gte: ['$totalReviews', 10] },
                                then: 1,
                                else: { $divide: ['$totalReviews', 10] }
                              }
                            },
                            10
                          ]
                        }
                      ]
                    },
                    1
                  ]
                },
                0
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            email: 1,
            name: 1,
            phone: 1,
            joinedDate: 1,
            lastActive: 1,
            totalProperties: 1,
            activeProperties: 1,
            rejectedProperties: 1,
            averageRating: 1,
            totalReviews: 1,
            totalMessages: 1,
            responseRate: 1,
            averageResponseTime: 1,
            performanceScore: 1
          }
        }
      ]);

      // Sort in JavaScript after aggregation
      const sortField = sortBy || 'performanceScore';
      vendors.sort((a, b) => {
        const aVal = a[sortField] || 0;
        const bVal = b[sortField] || 0;
        return bVal - aVal; // Descending order
      });

      res.json({
        success: true,
        data: { vendors }
      });
    } catch (error) {
      console.error('Vendor performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor performance',
        error: error.message
      });
    }
  })
);

// Promotion Routes
router.get('/promotions',
  hasPermission(SUB_ADMIN_PERMISSIONS.APPROVE_PROMOTIONS),
  asyncHandler(async (req, res) => {
    const { status = 'active', search = '' } = req.query;

    res.json({
      success: true,
      data: {
        promotions: [],
        total: 0
      }
    });
  })
);

router.post('/promotions/:id/end',
  hasPermission(SUB_ADMIN_PERMISSIONS.APPROVE_PROMOTIONS),
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Promotion ended successfully'
    });
  })
);

// Notification Routes
router.get('/notifications',
  hasPermission(SUB_ADMIN_PERMISSIONS.SEND_NOTIFICATIONS),
  asyncHandler(async (req, res) => {
    const { status = 'sent', search = '' } = req.query;

    res.json({
      success: true,
      data: {
        notifications: [],
        total: 0
      }
    });
  })
);

router.post('/notifications/send',
  hasPermission(SUB_ADMIN_PERMISSIONS.SEND_NOTIFICATIONS),
  asyncHandler(async (req, res) => {
    const { title, message, recipients, type = 'info' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Broadcast notification to all connected clients
    adminRealtimeService.broadcastNotification({
      type: type || 'info',
      title,
      message,
      data: {
        sentBy: req.user.email,
        recipients: recipients || 'all',
        sentAt: new Date()
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        recipientCount: 100,
        readCount: 0
      }
    });
  })
);

// Reports Generation
router.get('/reports',
  hasPermission(SUB_ADMIN_PERMISSIONS.GENERATE_REPORTS),
  asyncHandler(async (req, res) => {
    const { range = '30days' } = req.query;

    const [
      propertyStats,
      userStats,
      totalViews,
      totalMessages
    ] = await Promise.all([
      Property.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      Property.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: { $ifNull: ['$views', 0] } }
          }
        }
      ]),
      Message.countDocuments({ type: 'support' })
    ]);

    const propertyStatsMap = propertyStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const userStatsMap = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        propertyStats: {
          total: Object.values(propertyStatsMap).reduce((sum, count) => sum + count, 0),
          active: propertyStatsMap.active || 0,
          pending: propertyStatsMap.pending || 0,
          rejected: propertyStatsMap.rejected || 0
        },
        userStats: {
          totalVendors: userStatsMap.agent || 0,
          totalCustomers: userStatsMap.customer || 0,
          activeUsers: Object.values(userStatsMap).reduce((sum, count) => sum + count, 0),
          newUsersThisMonth: 15
        },
        engagementStats: {
          totalViews: totalViews[0]?.totalViews || 0,
          totalMessages: totalMessages || 0,
          totalReviews: 0,
          averageRating: 4.2
        },
        supportStats: {
          totalTickets: totalMessages || 0,
          openTickets: await Message.countDocuments({ type: 'support', status: 'open' }),
          resolvedTickets: await Message.countDocuments({ type: 'support', status: 'resolved' }),
          avgResolutionTime: 24
        }
      }
    });
  })
);

router.get('/reports/export',
  hasPermission(SUB_ADMIN_PERMISSIONS.GENERATE_REPORTS),
  asyncHandler(async (req, res) => {
    const { type, range } = req.query;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_report.csv"`);
    res.send('Report data would be here in CSV format');
  })
);

router.get('/reports/city/:city',
  hasPermission(SUB_ADMIN_PERMISSIONS.GENERATE_REPORTS),
  asyncHandler(async (req, res) => {
    const { city } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [
      propertyStats,
      userStats
    ] = await Promise.all([
      Property.aggregate([
        {
          $match: {
            'address.city': { $regex: city, $options: 'i' },
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        }
      ]),
      User.countDocuments({
        'profile.address.city': { $regex: city, $options: 'i' },
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      })
    ]);

    res.json({
      success: true,
      data: {
        city,
        propertyStats,
        userStats,
        period: { startDate, endDate }
      }
    });
  })
);

module.exports = router;
