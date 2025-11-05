# Buildhomemartsquares - Complete Project Documentation

## Project Overview
**Name:** Buildhomemartsquares Real Estate Platform  
**Version:** 1.0.0  
**Type:** Full-stack Real Estate Management System  
**Tech Stack:**
- **Frontend:** React 18.3.1, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express.js 4.18.2, MongoDB (Mongoose 8.19.2)
- **Real-time:** Socket.IO 4.8.1
- **Payment:** Razorpay 2.9.6
- **Storage:** Cloudinary 1.41.0
- **Email:** Nodemailer 6.9.7

---

## User Roles & Access Levels

### 1. **Super Admin** (Full System Access)
- Complete administrative control
- Manage all users, roles, and permissions
- System-wide settings and configurations

### 2. **Admin** (Administrative Access)
- User management
- Property oversight
- Vendor approvals
- System monitoring

### 3. **Sub Admin** (Limited Administrative)
- Property review and approval
- Content moderation
- Support ticket management
- Vendor verification

### 4. **Agent/Vendor** (Property Seller)
- Property listing and management
- Lead tracking
- Messaging with customers
- Subscription management

### 5. **Customer** (Property Buyer/Renter)
- Property search and browsing
- Favorites management
- Messaging vendors
- Service requests

---

## Portal-wise Feature Documentation

## 1. ADMIN PORTAL (Super Admin & Admin)

### Dashboard Features
- **Real-time Statistics:**
  - Total Revenue with monthly breakdown
  - Total Users count with new user metrics
  - Total Properties with monthly additions
  - Engagement Rate calculations
  - Recent Activities timeline

### User Management
- **Features:**
  - Create, Read, Update, Delete (CRUD) users
  - User role assignment (customer, agent, admin, subadmin, superadmin)
  - User status management (active/inactive)
  - Email verification status
  - Profile management

### Property Management
- **Features:**
  - View all properties with status filters
  - Property approval/rejection workflow
  - Featured property toggle
  - Property status updates (available, sold, rented, under_review)
  - Property deletion
  - Advanced search and filtering
  - Bulk operations

### Vendor Approvals
- **Features:**
  - Vendor registration review
  - Document verification (business license, identity, address, PAN, GST)
  - Approval/rejection with reasons
  - Vendor profile management
  - Status tracking

### Role & Permission Management
- **Features:**
  - Role creation and editing
  - Permission assignment
  - Role hierarchy (levels 1-100)
  - User count per role
  - Role status management
  - Custom permissions per role

### Subscription & Plans Management
- **Plans:**
  - Create/edit subscription plans
  - Feature management
  - Pricing configuration (monthly/quarterly/annually)
  - Trial period settings
  - Property listing limits
  - Featured listing allowances
  - Analytics access control
  - Lead generation limits

- **Clients (Subscriptions):**
  - View all active subscriptions
  - Subscription status management
  - Payment history tracking
  - Manual subscription renewal
  - Cancellation management
  - Invoice generation

### Addon Services Management
- **Features:**
  - Create/edit addon services
  - Categories: Marketing, Photography, Technology, Support, CRM
  - Pricing models (one-time, monthly, quarterly, annually)
  - Service activation/deactivation
  - Sort order management
  - Icon customization

### Messaging System
- **Features:**
  - View all conversations
  - Property-based message filtering
  - Real-time message updates via WebSocket
  - Message search functionality
  - User conversation management

---

## 2. SUB ADMIN PORTAL

### Dashboard Features
- **Statistics:**
  - Pending Properties review count
  - Approved Properties count
  - Support Tickets pending
  - Content Reports count
  - Pending Promotions
  - Active Vendors tracking

### Property Review
- **Features:**
  - Pending property listings review
  - Approve/reject properties
  - Rejection reason documentation
  - Property details verification
  - Image and document review

### Property Approval
- **Features:**
  - **Property Status Management:**
    - View all properties (admin-created and vendor-submitted)
    - Approve properties (pending → active/available)
    - Reject properties with detailed reason
    - Update property status (available, active, sold, rented, pending, rejected)
    - Assign sold/rented properties to customers
    - Customer search and selection for property assignment
    - Smart actions based on property creator (admin vs vendor)
    - View-only mode for vendor properties pending approval
    - Full edit access for admin-created properties
  - Approval workflow automation
  - Quality checks and verification
  - Compliance verification
  - Rejection reason tracking
  - Bulk approval operations

### Vendor Approvals
- **Features:**
  - New vendor registration verification
  - Document authentication
  - Business verification
  - Profile completeness check

### Content Moderation
- **Features:**
  - User-generated content review
  - Inappropriate content flagging
  - Report management
  - Content status updates

### Support Tickets
- **Features:**
  - Ticket management (open, in-progress, resolved, closed)
  - Priority assignment (urgent, high, medium, low)
  - Ticket response system
  - Status tracking
  - Pagination and filtering

### Performance Tracking
- **Features:**
  - Sub-admin activity metrics
  - Task completion rates
  - Response time tracking

### Promotion Approval
- **Features:**
  - Review promotion requests
  - Approve/reject promotional campaigns
  - Promotion type management

### Notifications
- **Features:**
  - Send system-wide notifications
  - Targeted user notifications
  - Notification templates

### Reports
- **Features:**
  - Generate activity reports
  - Export functionality
  - Statistical analysis

---

## 3. VENDOR/AGENT PORTAL

### Dashboard Features
- **Real-time Metrics:**
  - Total Properties count with change tracking
  - Active Leads with conversion metrics
  - Property Views analytics
  - Messages count (unread tracking)
  - Total Revenue with growth percentage
  - Conversion Rate tracking
  - Performance charts and graphs
  - Recent activities timeline
  - Notifications center

### Property Management
- **Features:**
  - Add new property listings
  - Edit existing properties
  - **Property Status Management:**
    - **Available**: Active listings visible to customers
    - **Pending**: Awaiting admin approval (default for new listings)
    - **Sold**: Marked as sold with customer assignment
    - **Rented**: Marked as rented with customer assignment
    - **Leased**: Marked as leased with customer assignment
    - **Rejected**: Not approved by admin (with rejection reason)
    - Status update with customer selection (for sold/rented/leased)
    - Automatic vendor statistics update on status change
    - Customer ownership transfer on sale/rent
    - Status change notifications via realtime updates
  - Image upload (multiple images with primary selection)
  - Property types: apartment, house, villa, plot, commercial, office, land, pg
  - Listing types: sale, rent, lease
  - Area specifications (carpet, built-up, plot)
  - Amenities management
  - Location pinning
  - Price and negotiation settings
  - Property deletion
  - Featured property toggle
  - Property statistics (views, inquiries, favorites)

### Lead Management
- **Features:**
  - View all inquiries
  - Lead status tracking (new, contacted, qualified, converted, lost)
  - Lead source identification
  - Priority assignment
  - Follow-up reminders
  - Lead conversion tracking
  - Notes and comments
  - Contact information management

### Messaging System
- **Features:**
  - Real-time chat with customers
  - Property-specific conversations
  - Message notifications
  - Attachment support
  - Conversation history
  - Unread message tracking
  - Search functionality

### Analytics
- **Features:**
  - Property view statistics
  - Lead source analysis
  - Conversion rate metrics
  - Revenue tracking
  - Performance trends
  - Date range filtering
  - Export reports

### Subscription Management
- **Plans:**
  - View available subscription plans
  - Compare plan features
  - Plan selection and purchase
  - Trial period activation
  - Feature comparison matrix

- **Manager:**
  - Current subscription details
  - Usage statistics
  - Renewal management
  - Plan upgrade/downgrade
  - Subscription history
  - Payment method management

### Billing
- **Features:**
  - Invoice history
  - Payment tracking
  - Transaction details
  - Payment method management
  - Auto-renewal settings
  - Receipt generation
  - Tax information

### Services
- **Features:**
  - View available addon services
  - Service subscription
  - Service activation/deactivation
  - Service usage tracking
  - Service-specific settings

### Reviews & Ratings
- **Features:**
  - View received reviews
  - Rating statistics
  - Respond to reviews
  - Review filtering
  - Rating trends

### Profile Management
- **Features:**
  - Business information update
  - Contact details management
  - Profile image upload
  - Business documents upload
  - Service area configuration
  - Operating hours settings
  - Social media links
  - Bio and description

### Notifications
- **Features:**
  - Real-time notification center
  - Notification preferences
  - Alert settings
  - Read/unread management
  - Notification history

---

## 4. CUSTOMER PORTAL

### Dashboard Features
- **Statistics:**
  - Properties Viewed count with period comparison
  - Saved Favorites with trends
  - Active Inquiries tracking
  - My Properties (owned) count
  - Recent Activities feed
  - Recommended Properties
  - Quick Stats overview

### Property Search
- **Advanced Search Filters:**
  - Location-based search (state, district, city, pincode)
  - Property type filter
  - Listing type (sale, rent, lease)
  - Price range slider
  - Bedrooms filter (1-5+ BHK)
  - Bathrooms filter
  - Area range (sq.ft)
  - Amenities filter
  - Property status filter
  - Featured properties toggle
  - Keyword search
  - Sort options (price, date, popularity)
  - Map view
  - List/Grid view toggle

### Property Details
- **Features:**
  - Image gallery with zoom
  - Property specifications
  - Price and area details
  - Location map
  - Amenities list
  - Owner/Agent information
  - Contact buttons (Call, WhatsApp, Message)
  - Favorite/Unfavorite toggle
  - Share property
  - Virtual tour (if available)
  - Similar properties suggestions
  - Property history

### Favorites Management
- **Features:**
  - View all favorited properties
  - Quick property overview
  - Remove from favorites
  - Compare properties
  - Share favorites list
  - Organize by collections
  - Export favorites

### Property Comparison
- **Features:**
  - Side-by-side comparison (up to 10 properties)
  - Price comparison with highlighting
  - Price per sq.ft calculation
  - Area comparison
  - Bedrooms/Bathrooms comparison
  - Amenities comparison matrix
  - Location comparison
  - Contact information display
  - Quick action buttons
  - Add/Remove properties
  - Share comparison
  - Real-time updates

### Owned Properties
- **Features:**
  - View customer's own listed properties
  - Property status tracking
  - Edit property details
  - View property analytics
  - Manage property inquiries
  - Property performance metrics

### Messaging System
- **Features:**
  - Real-time chat with vendors/agents
  - Property-specific conversations
  - Message notifications
  - Attachment support (images, documents)
  - Conversation search
  - Unread message tracking
  - Message history
  - Contact shortcut from property details

### Service Requests
- **Service Categories:**
  - Home Loans
  - Packers & Movers
  - Legal Services
  - Interior Design
  - Cleaning Services
  - Security Services

- **Features:**
  - Create service requests
  - View request status (pending, in_progress, completed, cancelled)
  - Service provider matching
  - Track service progress
  - Rate and review services
  - Cancel requests with reason
  - Service history
  - Service provider details

### Reviews & Ratings
- **Features:**
  - Write property reviews
  - Rate vendors/agents
  - Service reviews
  - View review history
  - Edit/delete own reviews
  - Helpful/Unhelpful voting
  - Review filtering

### Profile Management
- **Features:**
  - Personal information update
  - Contact details management
  - Profile picture upload
  - Address management with pincode autofill
  - Location selection (state, district, city)
  - Email/phone verification
  - Bio and preferences
  - Privacy settings

### Settings
- **Notification Preferences:**
  - Email notifications toggle
  - Push notifications toggle
  - New messages alerts
  - News and updates
  - Marketing emails
  - Property alerts

- **Privacy Settings:**
  - Profile visibility
  - Contact information visibility
  - Activity visibility

- **Account Settings:**
  - Password change (with OTP verification)
  - Email change
  - Phone number change
  - Account deletion
  - Two-factor authentication

---

## 5. AUTHENTICATION & SECURITY FEATURES

### Registration
- **Customer Registration:**
  - Email/password registration
  - OTP-based email verification
  - Profile setup wizard
  - Terms & conditions acceptance

- **Vendor Registration:**
  - Business information collection
  - Document upload (business license, identity, address proof, PAN, GST)
  - Email verification
  - Admin approval workflow
  - Vendor type selection

### Login
- **Features:**
  - Email/password authentication
  - JWT token-based sessions
  - Remember me functionality
  - Role-based redirect
  - Multiple portal login (admin, vendor, customer)

### Password Management
- **Features:**
  - Forgot password with OTP
  - Reset password via email
  - Change password (authenticated)
  - Password strength validation
  - Password history prevention

### OTP System
- **Features:**
  - Email-based OTP generation
  - OTP expiry (10 minutes)
  - Rate limiting (1 OTP per 60 seconds)
  - OTP verification
  - Resend OTP functionality
  - Secure OTP storage with hashing

---

## 6. DATA MODELS & SCHEMAS

### User Model
```javascript
Fields:
- email (unique, required)
- password (hashed)
- role (customer, agent, admin, subadmin, superadmin)
- profile:
  - firstName, lastName
  - phone, avatar
  - address (street, city, state, zipCode, country)
  - bio, dateOfBirth
  - emailVerified, phoneVerified
- vendorProfile (reference to Vendor)
- settings
- isActive
- lastLogin
- createdAt, updatedAt
```

### Property Model
```javascript
Fields:
- title, description
- type (apartment, house, villa, plot, commercial, office)
- listingType (sale, rent, lease)
- price, negotiable
- area (carpet, builtUp, plot, unit)
- bedrooms, bathrooms, floors
- furnishing (furnished, semi-furnished, unfurnished)
- amenities (array)
- images (url, isPrimary, caption)
- address (street, city, state, country, zipCode, coordinates)
- status (available, sold, rented, under_review)
- featured
- owner (ref: User)
- agent (ref: User)
- views, favorites
- createdAt, updatedAt
```

### Vendor Model
```javascript
Fields:
- userId (ref: User)
- businessName, businessType
- registrationNumber, taxId, gstNumber
- description
- address
- contactInfo (phone, email, website, whatsApp)
- documents (type, url, verified)
- serviceAreas (states, cities)
- specializations
- workingHours
- rating, totalReviews
- verificationStatus (pending, approved, rejected)
- isActive, featured
- createdAt, updatedAt
```

### Plan Model
```javascript
Fields:
- name, description
- price, currency
- billingPeriod (monthly, quarterly, annually)
- features (array of feature objects)
- limits (properties, featuredProperties, leads, analytics)
- trial (enabled, duration)
- isActive, isFeatured
- subscriberCount
- priceHistory
- changeLog
- createdAt, updatedAt
```

### Subscription Model
```javascript
Fields:
- user (ref: User)
- plan (ref: Plan)
- vendor (ref: Vendor)
- status (active, cancelled, expired, paused)
- startDate, endDate, billingCycle
- autoRenew
- paymentInfo
- paymentHistory
- addons (array)
- usageStats
- createdAt, updatedAt
```

### Message Model
```javascript
Fields:
- sender (ref: User)
- receiver (ref: User)
- property (ref: Property)
- content
- attachments (url, type, name, size)
- isRead, readAt
- messageType (text, image, document)
- status (sent, delivered, read)
- createdAt, updatedAt
```

### Review Model
```javascript
Fields:
- vendor (ref: User)
- client (ref: User)
- property (ref: Property)
- service (ref: AddonService)
- rating (1-5)
- title, comment
- reviewType (property, service, general)
- isVerified, isPublic
- helpfulVotes, unhelpfulVotes
- helpfulBy, unhelpfulBy
- tags, images
- vendorResponse
- status (active, hidden, reported, deleted)
- createdAt, updatedAt
```

### AddonService Model
```javascript
Fields:
- name, description
- category
- price, currency
- billingType (one-time, monthly, quarterly, annually)
- features
- icon, images
- isActive, isFeatured
- sortOrder
- createdAt, updatedAt
```

### Role Model
```javascript
Fields:
- name, description
- level (1-100, higher = more power)
- permissions (array)
- isActive, isSystem
- userCount
- createdAt, updatedAt
```

### Favorite Model
```javascript
Fields:
- user (ref: User)
- property (ref: Property)
- notes
- createdAt
```

### Notification Model
```javascript
Fields:
- user (ref: User)
- title, message
- type (info, success, warning, error)
- link
- isRead, readAt
- data (JSON)
- createdAt
```

### SupportTicket Model
```javascript
Fields:
- ticketNumber (unique)
- user (ref: User)
- subject, description
- category, priority
- status (open, in-progress, resolved, closed)
- assignedTo (ref: User)
- messages (array)
- attachments
- resolution
- createdAt, updatedAt, closedAt
```

### PromotionRequest Model
```javascript
Fields:
- vendor (ref: User)
- property (ref: Property)
- promotionType (featured, premium, urgent)
- startDate, endDate, duration
- pricing
- status (pending, approved, rejected, active, expired)
- approvedBy, rejectedBy
- approvalNotes, rejectionReason
- createdAt, updatedAt
```

### ContentReport Model
```javascript
Fields:
- reportedBy (ref: User)
- type (property, user, review, message)
- contentId, contentModel
- reason, details
- status (pending, reviewing, resolved, dismissed)
- action (none, warning, content_removed, user_suspended)
- reviewedBy (ref: User)
- resolution
- createdAt, updatedAt
```

---

## 7. API ENDPOINTS

### Authentication Routes (`/api/auth`)
- `POST /send-otp` - Send OTP to email
- `POST /verify-otp` - Verify OTP
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP
- `POST /change-password` - Change password (authenticated)
- `POST /vendor/register` - Vendor registration

### User Routes (`/api/users`)
- `GET /` - Get all users (admin)
- `GET /me` - Get current user
- `GET /:id` - Get user by ID
- `PUT /me` - Update current user profile
- `PUT /me/avatar` - Upload avatar
- `PUT /me/password` - Change password
- `DELETE /:id` - Delete user (admin)

### Property Routes (`/api/properties`)
- `GET /` - Get all properties with filters
- `GET /:id` - Get property by ID
- `POST /` - Create property
- `PUT /:id` - Update property
- `DELETE /:id` - Delete property
- **`PATCH /:id/status` - Update property status**
  - **Request Body:** `{ status: string, reason?: string }`
  - **Allowed Status Values:**
    - For Vendors/Owners: `available`, `sold`, `rented`, `leased`
    - For Admins: All above plus `pending`, `rejected`, `active`
  - **Features:**
    - Authorization check (owner or admin)
    - Status validation based on user role
    - Automatic property update timestamp
    - Returns updated property with populated owner details
- **`PATCH /:id/featured` - Toggle featured status**
  - **Request Body:** `{ featured: boolean }`
- **`POST /:id/assign-customer` - Assign property to customer (for sold/rented/leased)**
  - **Request Body:** `{ customerId: string, status: 'sold'|'rented'|'leased', notes?: string }`
  - **Features:**
    - Validates customer exists and has 'customer' role
    - Updates property status
    - Sets `assignedTo` field with customer ID
    - Adds assignment notes
    - Updates vendor statistics (sold properties count, total revenue)
    - Automatic revenue calculation from all sold properties
    - Returns updated property with customer assignment details
- `POST /:id/favorite` - Toggle favorite
- `GET /user/:userId` - Get user properties

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Dashboard statistics
- `GET /users` - User management
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /properties` - All properties
- **`PUT /properties/:id/status` - Update property status (approve/reject/change)**
- `PUT /properties/:id/featured` - Toggle featured
- `GET /vendors/pending` - Pending vendor approvals
- `POST /vendors/:id/approve` - Approve vendor
- `POST /vendors/:id/reject` - Reject vendor
- `GET /roles` - Role management
- `POST /roles` - Create role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### SubAdmin Routes (`/api/subadmin`)
- `GET /dashboard` - SubAdmin dashboard
- `GET /properties/pending` - Pending properties
- `POST /properties/:id/approve` - Approve property
- `POST /properties/:id/reject` - Reject property
- `GET /support/tickets` - Support tickets
- `PUT /support/tickets/:id` - Update ticket

### Vendor Routes (`/api/vendors`)
- `GET /dashboard` - Vendor dashboard
- `GET /properties` - Vendor properties
- `GET /leads` - Vendor leads
- `PUT /leads/:id` - Update lead status
- `GET /analytics` - Vendor analytics
- `GET /profile` - Vendor profile
- `PUT /profile` - Update profile

### Plan Routes (`/api/plans`)
- `GET /` - Get all plans
- `GET /:id` - Get plan by ID
- `POST /` - Create plan (admin)
- `PUT /:id` - Update plan (admin)
- `DELETE /:id` - Delete plan (admin)

### Subscription Routes (`/api/subscriptions`)
- `GET /` - Get subscriptions
- `GET /my` - Get user subscriptions
- `POST /` - Create subscription
- `PUT /:id` - Update subscription
- `POST /:id/cancel` - Cancel subscription
- `POST /:id/renew` - Renew subscription

### Message Routes (`/api/messages`)
- `GET /` - Get user messages
- `GET /conversations` - Get conversations
- `GET /property/:propertyId` - Property messages
- `POST /` - Send message
- `PUT /:id/read` - Mark as read
- `POST /upload` - Upload attachment

### Favorite Routes (`/api/favorites`)
- `GET /` - Get user favorites
- `POST /` - Add to favorites
- `DELETE /:propertyId` - Remove from favorites

### Notification Routes (`/api/notifications`)
- `GET /` - Get notifications
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

### Service Routes (`/api/services`)
- `GET /categories` - Service categories
- `GET /requests` - User service requests
- `POST /requests` - Create service request
- `PUT /requests/:id` - Update request
- `POST /requests/:id/cancel` - Cancel request
- `POST /requests/:id/rate` - Rate service

### Location Routes (`/api/locations`)
- `GET /states` - Get states
- `GET /districts/:state` - Get districts
- `GET /cities/:state/:district` - Get cities
- `POST /pincode/:code` - Get location by pincode

---

## 8. REAL-TIME FEATURES (Socket.IO)

### Events
- `property_updated` - Property data changes
- `property_favorited` - Favorite add/remove
- `new_message` - New message received
- `message_read` - Message read status
- `lead_updated` - Lead status change
- `notification_received` - New notification
- `subscription_updated` - Subscription changes
- `vendor_approved` - Vendor approval
- `property_approved` - Property approval

### Connections
- Auto-reconnection on disconnect
- User-specific rooms
- Property-specific rooms
- Conversation rooms

---

## 9. PAYMENT INTEGRATION (Razorpay)

### Features
- Subscription payments
- Addon service purchases
- Payment history
- Invoice generation
- Refund management
- Payment method management
- Auto-renewal payments
- Trial period handling

---

## 10. FILE UPLOAD & STORAGE (Cloudinary)

### Supported Files
- **Images:** Property images, avatars, document scans
- **Documents:** PDFs, business licenses, identity proofs
- **Formats:** JPEG, PNG, PDF

### Features
- Multi-file upload
- Image optimization
- Thumbnail generation
- Secure URLs
- File size limits
- Format validation

---

## 11. NOTIFICATION SYSTEM

### Types
- Email notifications (Nodemailer)
- In-app notifications
- Push notifications (planned)

### Triggers
- New message
- Property approval/rejection
- Lead assignment
- Subscription renewal
- Payment confirmation
- Review received

---

## 12. LOCATION SERVICES

### Features
- India-specific location data
- State, District, City hierarchy
- Pincode-based autofill
- Coordinates for map integration
- Location-based property search
- Service area management

### Data Source
- Custom `loca.json` file with comprehensive Indian location data
- Integration with `country-state-city` library

---

## 13. SECURITY FEATURES

### Implemented
- JWT-based authentication
- Password hashing (bcrypt)
- Rate limiting (express-rate-limit)
- Helmet.js security headers
- CORS configuration
- Input validation (Joi, express-validator)
- SQL injection prevention (Mongoose)
- XSS protection
- Role-based access control (RBAC)
- OTP-based verification

---

## 14. ANALYTICS & REPORTING

### Vendor Analytics
- Property view tracking
- Lead conversion rates
- Revenue metrics
- Performance trends
- Geographic distribution

### Admin Analytics
- Platform-wide statistics
- User growth metrics
- Revenue tracking
- Property listing trends
- Engagement metrics

---

## 15. MOBILE RESPONSIVENESS

### Implemented
- Fully responsive design
- Mobile-first approach
- Touch-friendly UI
- Responsive navigation
- Mobile-optimized forms
- Adaptive image loading

---

## 16. DEVELOPMENT FEATURES

### Code Quality
- TypeScript for type safety
- ESLint configuration
- Modular architecture
- Service layer pattern
- Error handling middleware
- Async/await patterns
- Clean code practices

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Database indexing
- Caching strategies
- Compression middleware

---

## 17. DEPLOYMENT CONFIGURATION

### Supported Platforms
- Hostinger
- Heroku (configured)
- Custom VPS

### Build Scripts
- Production build
- Development mode
- Database migration
- Admin user creation

---

## 18. FUTURE ENHANCEMENTS (Planned)

- Advanced map integration
- Virtual property tours
- AI-based property recommendations
- Video chat integration
- Mobile app (React Native)
- Multi-language support
- Advanced analytics dashboard
- Bulk property import
- API rate limiting per user
- Advanced reporting tools

---

## TECHNICAL SPECIFICATIONS

### Frontend Dependencies
- React 18.3.1 with TypeScript
- TailwindCSS 3.4.17 with shadcn/ui components
- React Router 6.30.1
- React Query (TanStack Query) 5.83.0
- Socket.IO Client 4.8.1
- Recharts 2.15.4 (charts)
- React Hook Form 7.61.1
- Zod 3.25.76 (validation)
- Date-fns 3.6.0
- Lucide React 0.462.0 (icons)

### Backend Dependencies
- Express.js 4.18.2
- Mongoose 8.19.2
- Socket.IO 4.8.1
- Bcrypt 5.1.1
- JWT (jsonwebtoken) 9.0.2
- Nodemailer 6.9.7
- Multer 1.4.5 (file upload)
- Razorpay 2.9.6
- Cloudinary 1.41.0
- Helmet 7.1.0 (security)
- Express Rate Limit 7.1.5
- Joi 17.11.0 (validation)
- Compression 1.7.4
- Morgan 1.10.0 (logging)

---

## DATABASE INDEXES

### Optimized Queries
- User: email (unique), role
- Property: status, type, listingType, owner, city
- Message: sender, receiver, property, isRead
- Subscription: user + status, plan + status
- Review: vendor, client, property, rating
- Favorite: user + property (unique)
- Notification: user + isRead

---

## ENVIRONMENT VARIABLES

### Required Configuration
```env
# Database
MONGODB_URI=
DB_NAME=

# JWT
JWT_SECRET=
JWT_EXPIRE=

# Email (Nodemailer)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Server
PORT=
NODE_ENV=
CLIENT_URL=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## 10. PROPERTY STATUS UPDATE SYSTEM

### Overview
The property status update system is a comprehensive feature that allows different user roles to manage property lifecycle from creation to sale/rental completion. It includes automated workflows, customer assignment, and vendor statistics tracking.

### Status Types

#### 1. **Available**
- Property is active and visible to customers
- Can be searched and favorited
- Vendor can receive inquiries
- Default status after admin approval

#### 2. **Pending**
- Default status for newly created properties
- Awaiting admin/subadmin approval
- Not visible to customers
- Vendor can edit while pending

#### 3. **Active**
- Admin-approved status
- Synonymous with "available" for customer-facing
- Property is live on the platform

#### 4. **Sold**
- Property has been sold
- Requires customer assignment
- Updates vendor statistics (sold count, revenue)
- Property ownership transferred to customer
- Visible in customer's "Owned Properties"

#### 5. **Rented**
- Property has been rented out
- Requires customer assignment
- Customer becomes tenant
- Rental start date recorded

#### 6. **Leased**
- Property has been leased
- Requires customer assignment
- Lease terms recorded
- Long-term rental arrangement

#### 7. **Rejected**
- Property failed admin approval
- Includes rejection reason
- Vendor can view reason and resubmit
- Not visible to customers

### API Endpoints

#### Vendor/Owner Status Update
```
PATCH /api/properties/:id/status
Authorization: Bearer token (Owner or Admin)

Request Body:
{
  "status": "available" | "sold" | "rented" | "leased"
}

Response:
{
  "success": true,
  "data": {
    "property": { /* updated property */ }
  },
  "message": "Property status updated successfully"
}
```

#### Admin Status Update
```
PATCH /api/properties/:id/status
Authorization: Bearer token (Admin)

Request Body:
{
  "status": "available" | "active" | "pending" | "rejected" | "sold" | "rented" | "leased",
  "reason": "string" // Required for rejected status
}

Response:
{
  "success": true,
  "data": {
    "property": { /* updated property */ }
  },
  "message": "Property status updated successfully"
}
```

#### Assign Property to Customer
```
POST /api/properties/:id/assign-customer
Authorization: Bearer token (Owner or Admin)

Request Body:
{
  "customerId": "string",
  "status": "sold" | "rented" | "leased",
  "notes": "string" // Optional
}

Response:
{
  "success": true,
  "data": {
    "property": {
      "_id": "...",
      "status": "sold",
      "assignedTo": "customerId",
      "assignmentNotes": "...",
      // ... other property fields
    }
  },
  "message": "Property sold and assigned to customer successfully"
}
```

### Frontend Services

#### propertyService.ts
```typescript
// Toggle property status
async togglePropertyStatus(propertyId: string, status: string): Promise<SinglePropertyResponse>

// Assign property to customer
async assignPropertyToCustomer(
  propertyId: string, 
  customerId: string, 
  status: string, 
  notes?: string
): Promise<SinglePropertyResponse>
```

#### adminPropertyService.ts
```typescript
// Admin-specific status update with rejection reason
async updatePropertyStatus(
  propertyId: string, 
  status: string, 
  reason?: string
): Promise<void>
```

#### customerPropertiesService.ts
```typescript
// Customer's property status management
async togglePropertyStatus(
  id: string, 
  status: CustomerProperty['status']
): Promise<SinglePropertyResponse>
```

### Component Implementation

#### PropertyStatusDialog Component
**Location:** `src/components/PropertyStatusDialog.tsx`

**Features:**
- Status selection dropdown
- Customer search and selection (for sold/rented/leased)
- Rejection reason input (for admin rejection)
- Real-time customer search with debouncing
- Loading states and validation
- Automatic status determination based on listing type

**Usage:**
```tsx
<PropertyStatusDialog
  property={selectedProperty}
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onUpdateStatus={handleUpdatePropertyStatus}
/>
```

### Role-Based Permissions

#### Vendor/Property Owner
- Can update status: `available`, `sold`, `rented`, `leased`
- Can assign property to customer
- Cannot set to `pending` or `rejected`
- Cannot bypass approval workflow

#### Admin/Super Admin
- Can update to any status
- Can approve (pending → active/available)
- Can reject with reason (pending → rejected)
- Can mark as sold/rented/leased with customer assignment
- Can override any status

#### Customer
- Can view owned properties (assigned to them)
- Cannot change property status
- Can write reviews for owned properties

### Automated Workflows

#### On Property Creation (Vendor)
1. Status set to `pending`
2. Property saved to database
3. Admin notification sent
4. Property appears in admin approval queue

#### On Admin Approval
1. Status changed from `pending` to `active`
2. `verified` flag set to `true`
3. Property becomes visible to customers
4. Vendor notification sent

#### On Admin Rejection
1. Status changed from `pending` to `rejected`
2. Rejection reason stored
3. Vendor notification sent with reason
4. Property hidden from customers

#### On Property Sold/Rented/Leased
1. Status updated to `sold`/`rented`/`leased`
2. `assignedTo` field set with customer ID
3. Assignment notes recorded
4. **Vendor statistics updated:**
   - Sold properties count incremented
   - Total revenue recalculated (sum of all sold properties)
5. Customer ownership established
6. Property appears in customer's "Owned Properties"
7. Customer can now write reviews

### Database Schema Updates

#### Property Model Additions
```javascript
{
  status: {
    type: String,
    enum: ['available', 'pending', 'sold', 'rented', 'leased', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignmentNotes: {
    type: String,
    default: ''
  },
  assignedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}
```

#### Vendor Statistics Update
```javascript
// Automatic update on property sold
vendor.performance.statistics.soldProperties += 1;
vendor.performance.statistics.totalRevenue = calculateTotalRevenue();
await vendor.save();
```

### Real-time Updates

#### Socket.IO Events
```javascript
// Emit on status change
socket.emit('property_updated', {
  propertyId: property._id,
  status: newStatus,
  timestamp: new Date()
});

// Listen for updates
useRealtimeEvent('property_updated', (data) => {
  // Update property in state
  setProperties(prev => prev.map(p => 
    p._id === data.propertyId ? { ...p, status: data.status } : p
  ));
});
```

### Validation Rules

1. **Status Transitions:**
   - `pending` can go to → `active`, `rejected`
   - `active/available` can go to → `sold`, `rented`, `leased`, `pending`
   - `sold/rented/leased` cannot be reversed (admin only override)

2. **Customer Assignment:**
   - Required for `sold`, `rented`, `leased` status
   - Customer must exist and have 'customer' role
   - Cannot assign to self

3. **Rejection Reason:**
   - Required when status is `rejected`
   - Minimum 10 characters
   - Stored for vendor reference

### Error Handling

- Invalid property ID → 400 Bad Request
- Property not found → 404 Not Found
- Unauthorized access → 403 Forbidden
- Invalid status for role → 400 Bad Request
- Customer not found → 404 Not Found
- Database error → 500 Internal Server Error

### UI Components Using Status Update

1. **Admin Portal:**
   - `src/pages/admin/Properties.tsx` - Property approval/rejection
   - Smart actions based on property creator

2. **Vendor Portal:**
   - `src/pages/vendor/VendorProperties.tsx` - Mark as sold/rented
   - Property status management

3. **Customer Portal:**
   - `src/pages/customer/OwnedProperties.tsx` - View owned properties
   - Write reviews for owned properties

---

## PROJECT STRUCTURE

```
ninety-nine-acres-web-main/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auth/               # Authentication components
│   │   ├── adminpanel/         # Admin components
│   │   └── customer/           # Customer components
│   ├── pages/                  # Page components
│   │   ├── admin/             # Admin pages
│   │   ├── customer/          # Customer pages
│   │   ├── vendor/            # Vendor pages
│   │   └── subadmin/          # SubAdmin pages
│   ├── services/              # API service layer
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── routes/                # Route configurations
│   ├── utils/                 # Utility functions
│   └── layout/                # Layout components
├── server/                     # Backend source
│   ├── models/                # Mongoose models
│   ├── routes/                # Express routes
│   ├── middleware/            # Express middleware
│   ├── controllers/           # Route controllers
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration files
│   └── scripts/               # Setup scripts
├── public/                    # Static assets
└── package.json              # Dependencies
```

---

## CONCLUSION

This is a comprehensive real estate platform with multi-portal architecture supporting customers, vendors, admins, and sub-admins. The system includes complete property management, subscription-based vendor access, real-time messaging, advanced search, and extensive admin controls. Built with modern technologies and following best practices for security, scalability, and performance.

**Current Status:** Fully functional with all major features implemented  
**Deployment:** Ready for production deployment  
**Documentation:** Complete API and feature documentation  

---

**Last Updated:** November 5, 2025  
**Project Version:** 1.0.0  
**Author:** Buildhomemartsquares Development Team
