# Ninety Nine Acres - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [User Portals & Features](#user-portals--features)
5. [API Services](#api-services)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database Schema](#database-schema)
8. [Deployment](#deployment)

---

## Project Overview

**Ninety Nine Acres** is a comprehensive real estate management platform that connects property buyers, sellers, vendors, and administrators. The platform facilitates property listings, vendor management, subscription plans, and real-time communication.

### Key Objectives
- Enable seamless property discovery and management
- Provide vendor subscription and property listing services
- Facilitate real-time communication between users
- Comprehensive admin controls for platform management
- Multi-role access control system

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Real-time**: Server-Sent Events (SSE)
- **Forms**: React Hook Form
- **Validation**: Zod

### Backend Integration
- **API Communication**: Axios
- **Authentication**: JWT Tokens
- **Storage**: LocalStorage for session persistence
- **Database**: Supabase (PostgreSQL)

### Third-Party Services
- **Cloud Storage**: Cloudinary (Image/Video uploads)
- **Payments**: Razorpay Integration
- **Email**: SMTP Email Service
- **Maps**: Location Services Integration

---

## Architecture

### Portal Structure
```
├── User Portal (Public Access)
├── Customer Portal (Registered Users)
├── Vendor Portal (Vendors/Agents)
├── Admin Portal (Administrators)
└── SubAdmin Portal (Content Moderators)
```

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Portal-specific pages
│   ├── admin/
│   ├── customer/
│   ├── vendor/
│   └── subadmin/
├── layout/             # Layout components
├── routes/             # Route configurations
├── services/           # API service layers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── integrations/       # Third-party integrations
```

---

## User Portals & Features

## 1. User Portal (Public Access)

### Features
**Homepage/Dashboard**
- Property search with advanced filters
- Featured properties showcase
- Property type categorization
- Location-based search
- Price range filtering

**Property Search & Discovery**
- Multi-criteria search (location, price, type, bedrooms)
- Grid/List view toggle
- Property comparison (up to 3 properties)
- Sorting options (price, date, popularity)
- Advanced filters:
  - Property type (House, Apartment, Villa, Land, etc.)
  - Listing type (Sale, Rent, Lease)
  - Bedrooms/Bathrooms count
  - Area range
  - Amenities

**Property Details**
- Image galleries with zoom
- 360° virtual tours
- Property specifications
- Location maps
- Nearby amenities
- Contact owner/agent
- Share property
- Add to favorites
- Schedule property visit

**User Authentication**
- Email/Password registration
- OTP verification
- Login with role detection
- Password reset flow
- Social login integration

**Public Pages**
- About Us
- Contact Us
- Privacy Policy
- Refund Policy
- Subscription Plans
- Products/Services

---

## 2. Customer Portal (Registered Users)

### Authentication & Profile
**Profile Management**
- Personal information update
- Profile image upload
- Contact details management
- Email verification
- Phone verification
- Account settings

**Security Settings**
- Change password
- Two-factor authentication
- Login history
- Active sessions management
- Security notifications

### Property Management
**Property Search**
- Saved searches
- Search alerts
- Recently viewed properties
- Property recommendations
- Advanced filtering

**My Properties (Owned)**
- List of owned properties
- Property documentation
- Ownership verification
- Property details management
- Add reviews for owned properties

**Property Favorites**
- Save favorite properties
- Create collections
- Share favorites
- Get notifications on price changes
- Quick access to saved properties

**Property Comparison**
- Compare up to 3 properties
- Side-by-side specifications
- Price comparison
- Location comparison
- Feature comparison matrix

### Communication & Interaction
**Messaging System**
- Real-time messaging with vendors
- Message attachments (images, documents)
- Conversation history
- Property-specific conversations
- Read receipts
- Typing indicators

**Service Requests**
- Request property inspections
- Schedule property visits
- Request documentation
- Service provider communication
- Request status tracking

**Reviews & Ratings**
- Write property reviews
- Rate properties (1-5 stars)
- Review owned properties
- Review management
- Review moderation

### Dashboard Features
**Customer Dashboard**
- Activity overview
- Quick stats (favorites, messages, requests)
- Recent activities
- Recommended properties
- Saved searches
- Upcoming appointments
- Real-time connection status

**Notifications**
- Real-time notifications
- Email notifications
- Push notifications
- Notification preferences
- Notification history

### Settings & Preferences
**User Preferences**
- Notification settings
- Email preferences
- Search preferences
- Language settings
- Display settings

**Privacy Settings**
- Profile visibility
- Contact information visibility
- Activity visibility
- Data sharing preferences

---

## 3. Vendor Portal (Property Vendors/Agents)

### Vendor Registration & Onboarding
**Registration Process**
- Multi-step registration form
- Business information
- Document uploads (licenses, certifications)
- Bank account details
- Verification process
- Approval workflow

**Vendor Profile**
- Business profile management
- Company logo upload
- Business description
- Service areas
- Contact information
- Social media links
- Operating hours
- Team members

### Subscription Management
**Subscription Plans**
- View available plans
- Feature comparison
- Plan selection
- Subscription purchase
- Plan upgrade/downgrade
- Auto-renewal settings

**Billing & Payments**
- Payment history
- Invoice downloads
- Payment methods management
- Subscription status
- Usage statistics
- Billing alerts

**Add-on Services**
- Photography services
- Marketing services
- Premium listing
- Featured placement
- Virtual tour services
- CRM integration
- Priority support

### Property Management
**Add Property**
- Multi-step property creation
- Property details form
- Image uploads (multiple)
- Video uploads
- Document uploads
- Floor plans
- Location mapping
- Amenities selection
- Pricing details
- Availability status

**Property Listings**
- All properties list
- Active/Pending/Rejected status
- Edit properties
- Delete properties
- Duplicate properties
- Bulk operations
- Property statistics

**Property Status Management**
- Pending approval
- Approved properties
- Rejected properties
- Draft properties
- Sold/Rented properties
- Archive properties

### Analytics & Performance
**Vendor Dashboard**
- Key metrics overview
- Property views statistics
- Lead generation stats
- Conversion rates
- Revenue tracking
- Performance trends
- Real-time analytics

**Vendor Analytics**
- Property performance
- Visitor analytics
- Lead source tracking
- Time period comparisons
- Geographic distribution
- Device analytics
- Export reports

**Performance Tracking**
- Response time metrics
- Lead conversion rates
- Property listing quality
- Customer ratings
- Success metrics

### Lead Management
**Lead Dashboard**
- New leads
- Active leads
- Converted leads
- Lost leads
- Lead source tracking
- Lead assignment

**Lead Interactions**
- Lead details view
- Contact information
- Interaction history
- Notes and tags
- Follow-up reminders
- Lead status updates

### Communication
**Messaging System**
- Customer messages
- Property inquiries
- Real-time messaging
- Message attachments
- Conversation management
- Quick replies

**Notifications**
- Lead notifications
- Property approval updates
- Subscription alerts
- Payment reminders
- System notifications

### Reviews & Ratings
**Review Management**
- Customer reviews
- Rating analytics
- Review responses
- Review moderation
- Rating trends
- Testimonials showcase

---

## 4. Admin Portal

### Dashboard & Analytics
**Admin Dashboard**
- System-wide statistics
- User analytics
- Property metrics
- Revenue tracking
- Recent activities
- Quick actions
- Alert notifications

**Reports & Analytics**
- Generate custom reports
- User activity reports
- Property reports
- Financial reports
- Performance reports
- Export functionality (PDF, Excel)

### User Management
**Users**
- List all users
- User details view
- User role management
- User status (Active/Inactive/Suspended)
- User search and filters
- Bulk operations
- User verification

**Add/Edit Users**
- Create new users
- Edit user details
- Assign roles
- Set permissions
- Account activation/deactivation

**Roles & Permissions**
- Create custom roles
- Define permissions
- Assign role to users
- Role hierarchy
- Permission matrix
- Role-based access control

### Property Management
**All Properties**
- Complete property list
- Property status filters
- Search and filters
- Property details view
- Edit properties
- Delete properties
- Bulk operations

**Property Approvals**
- Pending approvals queue
- Property review interface
- Approve/Reject properties
- Request modifications
- Approval comments
- Smart actions based on quality

**Property Review System**
- Quality assessment
- Image verification
- Description review
- Price validation
- Location verification
- Documentation check

**Content Moderation**
- Review flagged content
- Image moderation
- Review moderation
- User profile moderation
- Content approval workflow

### Vendor Management
**Vendor Approvals**
- Pending vendor applications
- Vendor verification
- Document verification
- Background checks
- Approve/Reject vendors
- Vendor onboarding

**Vendor Performance**
- Performance metrics
- Vendor ratings
- Property quality scores
- Response time tracking
- Compliance monitoring
- Performance reviews

**Promotion Approvals**
- Review promotion requests
- Approve featured listings
- Approve promotional campaigns
- Set promotion duration
- Pricing approval

### Subscription & Billing
**Plans Management**
- Create subscription plans
- Edit plan details
- Plan features management
- Pricing configuration
- Plan activation/deactivation
- Plan versioning

**Client Subscriptions**
- Active subscriptions
- Subscription details
- Payment history
- Renewal management
- Subscription upgrades
- Refund processing

**Addon Management**
- Create add-on services
- Service categorization
- Pricing management
- Availability settings
- Service descriptions

### Communication
**Messages**
- Platform messages
- User communications
- Support tickets
- Message filtering
- Priority messages
- Bulk messaging

**Send Notifications**
- Create notifications
- Notification templates
- Target user selection
- Schedule notifications
- Push notifications
- Email notifications

**Support Tickets**
- Ticket management
- Priority assignment
- Ticket assignment
- Status tracking
- Ticket resolution
- Response templates

### System Settings
**General Settings**
- Site configuration
- Platform name/logo
- Contact information
- Business hours
- Maintenance mode
- Feature toggles

**Email Configuration**
- SMTP settings
- Email templates
- Automated emails
- Email testing
- Delivery tracking

**Payment Settings**
- Payment gateway config
- Razorpay integration
- Transaction fees
- Currency settings
- Payment methods

**Security Settings**
- Password policies
- Session management
- IP whitelisting
- API rate limiting
- Security logs

**Notification Settings**
- Notification preferences
- Alert configurations
- Notification channels
- Template management

### Learning Management System (LMS)
**Course Management**
- Create courses
- Course categories
- Course content (videos, documents)
- Course pricing
- Course enrollment
- Progress tracking

**Course Categories**
- Category management
- Category hierarchy
- Category descriptions
- Category icons

---

## 5. SubAdmin Portal

### Limited Admin Access
**SubAdmin Dashboard**
- Assigned task overview
- Pending reviews
- Activity summary
- Performance metrics

**Property Reviews**
- Review assigned properties
- Property approval/rejection
- Quality assessment
- Request modifications
- Review notes

**Support Tickets**
- Assigned tickets
- Ticket resolution
- Response management
- Escalation handling

**Limited User Management**
- View users (read-only)
- Basic user support
- Report issues to admin

---

## API Services

### Authentication Services
```typescript
authService
├── login()              // User authentication
├── register()           // User registration
├── sendOTP()            // OTP generation
├── verifyOTP()          // OTP validation
├── logout()             // Session termination
├── resetPassword()      // Password reset
└── changePassword()     // Password update
```

### Property Services
```typescript
propertyService
├── getProperties()      // List properties with filters
├── getPropertyById()    // Single property details
├── createProperty()     // Add new property
├── updateProperty()     // Edit property
├── deleteProperty()     // Remove property
├── approveProperty()    // Approve listing
└── searchProperties()   // Advanced search

adminPropertyService
├── getAllProperties()   // Admin property list
├── getPendingApprovals() // Approval queue
├── approveProperty()    // Property approval
└── rejectProperty()     // Property rejection

customerPropertiesService
├── getMyProperties()    // User's properties
├── getOwnedProperties() // Owned properties
└── getPropertyStats()   // Property statistics
```

### User Management Services
```typescript
userService
├── getUsers()           // List users
├── getUserById()        // User details
├── createUser()         // Add user
├── updateUser()         // Edit user
├── deleteUser()         // Remove user
└── updateUserRole()     // Change role

roleService
├── getRoles()           // List roles
├── createRole()         // Add role
├── updateRole()         // Edit role
└── deleteRole()         // Remove role
```

### Subscription Services
```typescript
planService
├── getPlans()           // List subscription plans
├── getPlanById()        // Plan details
├── createPlan()         // Add plan
├── updatePlan()         // Edit plan
└── deletePlan()         // Remove plan

subscriptionService
├── subscribe()          // Create subscription
├── updateSubscription() // Modify subscription
├── cancelSubscription() // Cancel subscription
└── getSubscriptionHistory() // Payment history

billingService
├── getBillingInfo()     // Billing details
├── getInvoices()        // Invoice list
├── getPaymentHistory()  // Transaction history
└── processPayment()     // Payment processing
```

### Messaging Services
```typescript
messageService
├── getConversations()   // List conversations
├── getMessages()        // Conversation messages
├── sendMessage()        // Send message
├── uploadAttachment()   // File upload
└── markAsRead()         // Read status

adminMessageService
├── getAllMessages()     // All platform messages
├── getMessageStats()    // Message analytics
└── moderateMessage()    // Content moderation
```

### Review Services
```typescript
reviewsService
├── getReviews()         // Property reviews
├── createReview()       // Add review
├── updateReview()       // Edit review
├── deleteReview()       // Remove review
└── getReviewStats()     // Review analytics

customerReviewsService
├── getMyReviews()       // User's reviews
├── submitReview()       // Create review
└── updateMyReview()     // Edit own review
```

### Vendor Services
```typescript
vendorService
├── getVendorProfile()   // Vendor details
├── updateVendorProfile() // Edit profile
├── getVendorStats()     // Performance metrics
└── verifyVendor()       // Vendor verification

vendorDashboardService
├── getDashboardData()   // Dashboard stats
├── getAnalytics()       // Analytics data
└── getPerformanceData() // Performance metrics

leadService
├── getLeads()           // Lead list
├── updateLeadStatus()   // Status update
└── getLeadStats()       // Lead analytics
```

### Location Services
```typescript
locationService
├── getCountries()       // Country list
├── getStates()          // State list
├── getDistricts()       // District list
├── getCities()          // City list
└── searchLocation()     // Location search

pincodeService
├── initialize()         // Load pincode data
├── getPincodeData()     // Pincode lookup
└── searchPincode()      // Pincode search

enhancedLocationService
├── validateLocation()   // Location validation
├── getLocationDetails() // Complete location info
└── reverseGeocode()     // Coordinates to address
```

### Notification Services
```typescript
notificationService
├── sendNotification()   // Send notification
├── getNotifications()   // User notifications
├── markAsRead()         // Read status
└── clearNotifications() // Clear all

emailService
├── sendEmail()          // Send email
├── sendBulkEmail()      // Bulk emails
└── getEmailTemplates()  // Template management
```

### File Upload Services
```typescript
uploadService
├── uploadImage()        // Image upload
├── uploadMultiple()     // Multiple files
├── uploadVideo()        // Video upload
└── deleteFile()         // File deletion
```

### Analytics Services
```typescript
analyticsService
├── getOverviewStats()   // Platform overview
├── getChartData()       // Chart data
├── getPerformanceMetrics() // Performance data
└── exportReport()       // Report generation

dashboardService
├── getDashboardStats()  // Dashboard data
├── getRecentActivities() // Activity feed
└── getQuickStats()      // Quick metrics

customerDashboardService
├── getCustomerStats()   // Customer analytics
├── getRecommendations() // Property recommendations
└── getActivityFeed()    // User activity
```

### Add-on Services
```typescript
addonService
├── getAddons()          // List add-ons
├── purchaseAddon()      // Buy add-on
└── getAddonCategories() // Categories

adminAddonService
├── createAddon()        // Add service
├── updateAddon()        // Edit service
└── deleteAddon()        // Remove service
```

### Other Services
```typescript
favoriteService
├── getFavorites()       // User favorites
├── addToFavorites()     // Add favorite
├── removeFromFavorites() // Remove favorite
└── isFavorite()         // Check status

customerServiceRequestsService
├── getServiceRequests() // Request list
├── createRequest()      // New request
├── updateRequest()      // Update request
└── getServiceProviders() // Provider list

settingsService
├── getSettings()        // System settings
├── updateSettings()     // Update settings
└── resetSettings()      // Reset to default

paymentService
├── createOrder()        // Payment order
├── verifyPayment()      // Payment verification
└── getPaymentDetails()  // Transaction details
```

---

## Authentication & Authorization

### Role-Based Access Control (RBAC)
**User Roles**
- `user` - Public users
- `customer` - Registered customers
- `vendor` - Property vendors/agents
- `admin` - Platform administrators
- `subadmin` - Content moderators

### Permission System
```typescript
Permissions = {
  properties: ['create', 'read', 'update', 'delete', 'approve'],
  users: ['create', 'read', 'update', 'delete', 'manage'],
  subscriptions: ['create', 'read', 'update', 'delete'],
  messages: ['read', 'send', 'moderate'],
  reviews: ['create', 'read', 'update', 'delete', 'moderate'],
  settings: ['read', 'update']
}
```

### Protected Routes
- **Customer Routes**: Require `customer` role
- **Vendor Routes**: Require `vendor` role
- **Admin Routes**: Require `admin` or `subadmin` role
- **Public Routes**: Accessible to all

### JWT Token Management
- Access token stored in localStorage
- Token refresh mechanism
- Token expiry handling
- Auto-logout on token invalidation

---

## Database Schema

### Core Tables

**Users**
```sql
users {
  _id: ObjectId
  name: String
  email: String (unique)
  phone: String
  password: String (hashed)
  role: String (enum)
  status: String
  profileImage: String
  verified: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Properties**
```sql
properties {
  _id: ObjectId
  title: String
  description: Text
  type: String
  listingType: String (Sale/Rent/Lease)
  price: Number
  area: Number
  bedrooms: Number
  bathrooms: Number
  location: {
    address: String
    city: String
    state: String
    country: String
    pincode: String
    coordinates: {
      lat: Number
      lng: Number
    }
  }
  images: [String]
  videos: [String]
  amenities: [String]
  status: String (pending/approved/rejected)
  owner: ObjectId (ref: Users)
  vendor: ObjectId (ref: Users)
  createdAt: DateTime
  updatedAt: DateTime
  views: Number
  featured: Boolean
}
```

**Subscriptions**
```sql
subscriptions {
  _id: ObjectId
  plan: ObjectId (ref: Plans)
  user: ObjectId (ref: Users)
  status: String
  startDate: DateTime
  endDate: DateTime
  autoRenew: Boolean
  paymentHistory: [{
    amount: Number
    date: DateTime
    status: String
    transactionId: String
  }]
}
```

**Plans**
```sql
plans {
  _id: ObjectId
  name: String
  description: Text
  price: Number
  duration: Number (days)
  features: [String]
  propertyLimit: Number
  featured: Boolean
  active: Boolean
  createdAt: DateTime
}
```

**Messages**
```sql
messages {
  _id: ObjectId
  conversation: ObjectId
  sender: ObjectId (ref: Users)
  receiver: ObjectId (ref: Users)
  content: Text
  attachments: [String]
  read: Boolean
  property: ObjectId (ref: Properties)
  createdAt: DateTime
}
```

**Reviews**
```sql
reviews {
  _id: ObjectId
  property: ObjectId (ref: Properties)
  user: ObjectId (ref: Users)
  rating: Number (1-5)
  title: String
  comment: Text
  reviewType: String
  isPublic: Boolean
  status: String
  createdAt: DateTime
}
```

**Roles**
```sql
roles {
  _id: ObjectId
  name: String
  description: Text
  permissions: [String]
  active: Boolean
  createdAt: DateTime
}
```

**ServiceRequests**
```sql
serviceRequests {
  _id: ObjectId
  user: ObjectId (ref: Users)
  property: ObjectId (ref: Properties)
  serviceType: String
  status: String
  priority: String
  description: Text
  assignedTo: ObjectId (ref: Users)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Leads**
```sql
leads {
  _id: ObjectId
  property: ObjectId (ref: Properties)
  vendor: ObjectId (ref: Users)
  customer: ObjectId (ref: Users)
  source: String
  status: String
  notes: Text
  followUpDate: DateTime
  createdAt: DateTime
}
```

**Notifications**
```sql
notifications {
  _id: ObjectId
  user: ObjectId (ref: Users)
  type: String
  title: String
  message: Text
  read: Boolean
  link: String
  createdAt: DateTime
}
```

**Addons**
```sql
addons {
  _id: ObjectId
  name: String
  category: String
  description: Text
  price: Number
  duration: Number
  features: [String]
  active: Boolean
}
```

---

## Real-Time Features

### Server-Sent Events (SSE)
**Real-time Notifications**
- Property approval updates
- New messages
- Lead notifications
- System alerts
- Payment confirmations

**Real-time Dashboard Updates**
- Live statistics
- Activity feed
- Performance metrics

### WebSocket Alternative (SSE)
- Connection status indicator
- Auto-reconnection
- Event streaming
- Notification updates

---

## File Upload & Storage

### Cloudinary Integration
**Supported File Types**
- Images (JPEG, PNG, WebP)
- Videos (MP4, MOV)
- Documents (PDF)

**Upload Features**
- Multiple file uploads
- Progress tracking
- Image optimization
- Thumbnail generation
- Lazy loading

**Folder Structure**
```
cloudinary/
├── properties/
│   ├── images/
│   └── videos/
├── profiles/
├── documents/
└── reviews/
```

---

## Payment Integration

### Razorpay Integration
**Features**
- Subscription payments
- Addon purchases
- Recurring payments
- Payment verification
- Refund processing

**Payment Flow**
1. Order creation
2. Payment gateway redirect
3. Payment verification
4. Subscription activation
5. Invoice generation

---

## Deployment

### Environment Variables
```env
VITE_API_URL=https://api.example.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
VITE_RAZORPAY_KEY_ID=your_razorpay_key
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### Deployment Platforms
**Vercel** (Recommended for Frontend)
- Automatic deployments
- Preview deployments
- Environment variables
- Custom domains

**Hostinger** (Backend)
- Node.js hosting
- MongoDB database
- SSL certificates
- Email configuration

### Build Commands
```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Key Features Summary

### Platform Highlights
✅ Multi-role access control  
✅ Real-time notifications  
✅ Advanced property search  
✅ Property comparison  
✅ Messaging system  
✅ Subscription management  
✅ Vendor approval workflow  
✅ Payment integration  
✅ Analytics & reporting  
✅ Review & rating system  
✅ File upload management  
✅ Location services  
✅ Email notifications  
✅ Mobile responsive  
✅ Dark mode support  

---

## Future Enhancements

### Planned Features
- Mobile applications (iOS/Android)
- Advanced AI recommendations
- Virtual property tours
- Chatbot integration
- Social media integration
- Advanced analytics dashboard
- Property valuation tools
- Mortgage calculator
- Legal document management
- Multi-language support

---

## Support & Maintenance

### Documentation
- API documentation
- User guides
- Admin manuals
- Developer documentation

### Monitoring
- Error tracking
- Performance monitoring
- User analytics
- System health checks

---

## Contact Information

**Project**: Ninety Nine Acres  
**Version**: 2.0  
**Last Updated**: November 2025  

For technical support or inquiries, please contact the development team.

---

*This documentation is maintained and updated regularly to reflect the latest features and changes.*
