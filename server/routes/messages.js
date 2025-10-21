const express = require('express');
const Message = require('../models/Message');
const Property = require('../models/Property');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// @desc    Get conversations for user
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', asyncHandler(async (req, res) => {
  // Get messages where user is either sender or recipient
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          property: '$property',
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', req.user._id] },
              then: '$recipient',
              else: '$sender'
            }
          }
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$recipient', req.user._id] },
                  { $eq: ['$read', false] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'properties',
        localField: '_id.property',
        foreignField: '_id',
        as: 'property'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.otherUser',
        foreignField: '_id',
        as: 'otherUser'
      }
    },
    {
      $project: {
        _id: 1,
        property: { $arrayElemAt: ['$property', 0] },
        otherUser: { $arrayElemAt: ['$otherUser', 0] },
        lastMessage: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      conversations: conversations.map(conv => ({
        id: `${conv._id.property}_${conv._id.otherUser}`,
        property: {
          _id: conv.property._id,
          title: conv.property.title,
          price: conv.property.price,
          address: conv.property.address
        },
        otherUser: {
          _id: conv.otherUser._id,
          name: `${conv.otherUser.profile.firstName} ${conv.otherUser.profile.lastName}`,
          email: conv.otherUser.email,
          phone: conv.otherUser.profile.phone
        },
        lastMessage: {
          _id: conv.lastMessage._id,
          subject: conv.lastMessage.subject,
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          isFromMe: conv.lastMessage.sender.toString() === req.user._id.toString()
        },
        unreadCount: conv.unreadCount
      }))
    }
  });
}));

// @desc    Get messages between users for a property
// @route   GET /api/messages/:propertyId/:otherUserId
// @access  Private
router.get('/:propertyId/:otherUserId', asyncHandler(async (req, res) => {
  const { propertyId, otherUserId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get total count for pagination
  const totalCount = await Message.countDocuments({
    property: propertyId,
    $or: [
      { sender: req.user._id, recipient: otherUserId },
      { sender: otherUserId, recipient: req.user._id }
    ]
  });

  // Get messages
  const messages = await Message.find({
    property: propertyId,
    $or: [
      { sender: req.user._id, recipient: otherUserId },
      { sender: otherUserId, recipient: req.user._id }
    ]
  })
    .populate('sender', 'profile.firstName profile.lastName email')
    .populate('recipient', 'profile.firstName profile.lastName email')
    .populate('property', 'title price address')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Mark messages as read
  await Message.updateMany({
    property: propertyId,
    sender: otherUserId,
    recipient: req.user._id,
    read: false
  }, {
    read: true
  });

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      messages: messages.reverse().map(msg => ({
        _id: msg._id,
        subject: msg.subject,
        content: msg.content,
        createdAt: msg.createdAt,
        read: msg.read,
        sender: msg.sender,
        recipient: msg.recipient,
        property: msg.property,
        isFromMe: msg.sender._id.toString() === req.user._id.toString()
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

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { recipientId, propertyId, subject, content } = req.body;

  if (!recipientId || !propertyId || !subject || !content) {
    return res.status(400).json({
      success: false,
      message: 'Recipient, property, subject, and content are required'
    });
  }

  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({
      success: false,
      message: 'Recipient not found'
    });
  }

  // Create message
  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    property: propertyId,
    subject: subject.trim(),
    content: content.trim()
  });

  await message.populate([
    { path: 'sender', select: 'profile.firstName profile.lastName email' },
    { path: 'recipient', select: 'profile.firstName profile.lastName email' },
    { path: 'property', select: 'title price address' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: { message }
  });
}));

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Private
router.get('/message/:id', asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id)
    .populate('sender', 'profile.firstName profile.lastName email')
    .populate('recipient', 'profile.firstName profile.lastName email')
    .populate('property', 'title price address');

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is sender or recipient
  if (message.sender._id.toString() !== req.user._id.toString() && 
      message.recipient._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this message'
    });
  }

  // Mark as read if user is recipient
  if (message.recipient._id.toString() === req.user._id.toString() && !message.read) {
    message.read = true;
    await message.save();
  }

  res.json({
    success: true,
    data: { message }
  });
}));

// @desc    Mark message as read
// @route   PATCH /api/messages/:id/read
// @access  Private
router.patch('/:id/read', asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is recipient
  if (message.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to mark this message as read'
    });
  }

  message.read = true;
  await message.save();

  res.json({
    success: true,
    message: 'Message marked as read'
  });
}));

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is sender or recipient
  if (message.sender.toString() !== req.user._id.toString() && 
      message.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this message'
    });
  }

  await Message.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

module.exports = router;

// @desc    Get conversations for user
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', asyncHandler(async (req, res) => {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      id, property_id, created_at, updated_at,
      properties (id, title, price, city, state),
      conversation_participants!inner (
        user_id,
        users (
          id,
          user_profiles (first_name, last_name, avatar, phone)
        )
      )
    `)
    .or(`participant1_id.eq.${req.user.id},participant2_id.eq.${req.user.id}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Get last message for each conversation
  const conversationsWithMessages = await Promise.all(
    conversations.map(async (conv) => {
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('id, message, created_at, sender_id, read')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('recipient_id', req.user.id)
        .eq('read', false);

      // Get other participant
      const otherParticipant = conv.conversation_participants.find(
        p => p.user_id !== req.user.id
      );

      return {
        id: conv.id,
        propertyId: conv.property_id,
        property: conv.properties,
        otherUser: otherParticipant ? {
          id: otherParticipant.users.id,
          name: `${otherParticipant.users.user_profiles[0]?.first_name || ''} ${otherParticipant.users.user_profiles[0]?.last_name || ''}`.trim(),
          avatar: otherParticipant.users.user_profiles[0]?.avatar,
          phone: otherParticipant.users.user_profiles[0]?.phone
        } : null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          message: lastMessage.message,
          createdAt: lastMessage.created_at,
          isFromMe: lastMessage.sender_id === req.user.id
        } : null,
        unreadCount: unreadCount || 0,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at
      };
    })
  );

  res.json({
    success: true,
    data: {
      conversations: conversationsWithMessages
    }
  });
}));

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:id
// @access  Private
router.get('/conversations/:id', asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  // Check if user is participant in conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id, participant1_id, participant2_id')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  if (conversation.participant1_id !== req.user.id && conversation.participant2_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this conversation'
    });
  }

  // Get messages
  const { data: messages, error, count } = await supabase
    .from('messages')
    .select(`
      id, message, created_at, sender_id, recipient_id, read,
      message_attachments (id, file_url, file_type, file_name)
    `, { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  // Mark messages as read
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('recipient_id', req.user.id)
    .eq('read', false);

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      messages: messages.reverse().map(msg => ({
        id: msg.id,
        message: msg.message,
        createdAt: msg.created_at,
        senderId: msg.sender_id,
        recipientId: msg.recipient_id,
        read: msg.read,
        isFromMe: msg.sender_id === req.user.id,
        attachments: msg.message_attachments || []
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    }
  });
}));

// @desc    Send message
// @route   POST /api/messages/conversations/:id/messages
// @access  Private
router.post('/conversations/:id/messages', asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const { message, attachments = [] } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  // Check if user is participant in conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id, participant1_id, participant2_id')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  if (conversation.participant1_id !== req.user.id && conversation.participant2_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to send messages in this conversation'
    });
  }

  // Determine recipient
  const recipientId = conversation.participant1_id === req.user.id 
    ? conversation.participant2_id 
    : conversation.participant1_id;

  // Create message
  const { data: newMessage, error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: req.user.id,
      recipient_id: recipientId,
      message: message.trim(),
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (messageError) {
    throw messageError;
  }

  // Add attachments if any
  if (attachments.length > 0) {
    const attachmentInserts = attachments.map(attachment => ({
      message_id: newMessage.id,
      file_url: attachment.url,
      file_type: attachment.type,
      file_name: attachment.name,
      file_size: attachment.size
    }));

    const { error: attachmentError } = await supabase
      .from('message_attachments')
      .insert(attachmentInserts);

    if (attachmentError) {
      console.error('Failed to add attachments:', attachmentError);
    }
  }

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      message: {
        id: newMessage.id,
        message: newMessage.message,
        createdAt: newMessage.created_at,
        senderId: newMessage.sender_id,
        recipientId: newMessage.recipient_id,
        isFromMe: true
      }
    }
  });
}));

// @desc    Create conversation
// @route   POST /api/messages/conversations
// @access  Private
router.post('/conversations', asyncHandler(async (req, res) => {
  const { propertyId, recipientId, initialMessage } = req.body;

  if (!propertyId || !recipientId || !initialMessage) {
    return res.status(400).json({
      success: false,
      message: 'Property ID, recipient ID, and initial message are required'
    });
  }

  // Check if property exists
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, title, owner_id')
    .eq('id', propertyId)
    .single();

  if (propertyError || !property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if recipient exists
  const { data: recipient, error: recipientError } = await supabase
    .from('users')
    .select('id')
    .eq('id', recipientId)
    .single();

  if (recipientError || !recipient) {
    return res.status(404).json({
      success: false,
      message: 'Recipient not found'
    });
  }

  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('property_id', propertyId)
    .or(`and(participant1_id.eq.${req.user.id},participant2_id.eq.${recipientId}),and(participant1_id.eq.${recipientId},participant2_id.eq.${req.user.id})`)
    .single();

  if (existingConversation) {
    return res.status(400).json({
      success: false,
      message: 'Conversation already exists',
      data: {
        conversationId: existingConversation.id
      }
    });
  }

  // Create conversation
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({
      property_id: propertyId,
      participant1_id: req.user.id,
      participant2_id: recipientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (conversationError) {
    throw conversationError;
  }

  // Send initial message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: req.user.id,
      recipient_id: recipientId,
      message: initialMessage,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (messageError) {
    throw messageError;
  }

  // Create property inquiry record
  await supabase
    .from('property_inquiries')
    .insert({
      property_id: propertyId,
      user_id: req.user.id,
      inquiry_type: 'message',
      message: initialMessage,
      created_at: new Date().toISOString()
    });

  res.status(201).json({
    success: true,
    message: 'Conversation created successfully',
    data: {
      conversation: {
        id: conversation.id,
        propertyId: conversation.property_id,
        createdAt: conversation.created_at
      },
      initialMessage: {
        id: message.id,
        message: message.message,
        createdAt: message.created_at
      }
    }
  });
}));

// @desc    Delete conversation
// @route   DELETE /api/messages/conversations/:id
// @access  Private
router.delete('/conversations/:id', asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;

  // Check if user is participant in conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id, participant1_id, participant2_id')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  if (conversation.participant1_id !== req.user.id && conversation.participant2_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this conversation'
    });
  }

  // Delete conversation (cascade will handle messages)
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    throw error;
  }

  res.json({
    success: true,
    message: 'Conversation deleted successfully'
  });
}));

module.exports = router;