# Owned Properties Feature Implementation

## Overview
This document describes the implementation of the "Owned Properties" feature in the customer portal. This feature allows customers to view properties they have purchased or rented and write reviews for them.

## Changes Made

### 1. Frontend Components

#### New Page: `src/pages/customer/OwnedProperties.tsx`
- **Purpose**: Display properties that customers have purchased or rented
- **Features**:
  - List all properties assigned to the customer (status: sold or rented)
  - Filter by status (purchased/rented)
  - Search functionality
  - Display seller/owner information
  - Review management (write, edit reviews)
  - Property details display
  - Realtime updates support

#### Key Features:
1. **Property Display**
   - Shows property images, title, description
   - Displays location, area, bedrooms, price
   - Shows purchase/rental date
   - Displays seller information

2. **Review Functionality**
   - Customers can write reviews for properties they own
   - Edit existing reviews
   - 5-star rating system
   - Title and detailed comment
   - Public/Private visibility toggle
   - Visual indication of reviewed properties

3. **Filtering & Search**
   - Filter by status (All, Purchased, Rented)
   - Search by property name or location
   - Real-time filtering

### 2. Backend Routes

#### New Endpoint: `GET /api/customer/owned-properties`
- **Location**: `server/routes/customer.js`
- **Purpose**: Fetch properties assigned to the customer
- **Authentication**: Required (JWT token)
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` (optional: 'sold', 'rented')
  - `search` (optional: search term)
  - `sortBy` (default: 'assignedAt')
  - `sortOrder` (default: 'desc')

- **Response Format**:
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "_id": "property_id",
        "title": "Property Title",
        "description": "Property description",
        "type": "apartment",
        "status": "sold",
        "listingType": "sale",
        "price": 5000000,
        "area": { "builtUp": 1200, "unit": "sqft" },
        "bedrooms": 3,
        "bathrooms": 2,
        "address": { "city": "City", "state": "State", "pincode": "123456" },
        "images": [...],
        "assignedAt": "2024-11-05T...",
        "assignedBy": { "_id": "...", "name": "...", "email": "..." },
        "owner": { "_id": "...", "name": "...", "email": "...", "phone": "..." },
        "hasReviewed": true,
        "reviewId": "review_id",
        "review": {
          "_id": "review_id",
          "rating": 5,
          "title": "Review Title",
          "comment": "Review comment",
          "createdAt": "2024-11-05T..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProperties": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### 3. Navigation Updates

#### Updated Files:
1. **`src/routes/CustomerLazyImports.ts`**
   - Added lazy import for OwnedProperties component

2. **`src/routes/CustomerRoutes.tsx`**
   - Added route: `/customer/owned-properties`
   - Configured with lazy loading and PageLoader fallback

3. **`src/components/customer/CustomerSidebar.tsx`**
   - Added "Owned Properties" navigation item
   - Icon: HomeIcon
   - Position: After "My Properties"

### 4. Distinction Between Pages

#### My Properties Page
- **Purpose**: Properties the customer is selling/renting out
- **Filter**: `owner: userId`
- **Features**: Property management, performance tracking, editing
- **Description**: "Properties you are selling or renting out"

#### Owned Properties Page
- **Purpose**: Properties the customer has purchased/rented
- **Filter**: `assignedTo: userId` AND `status: sold/rented`
- **Features**: View purchased/rented properties, write reviews
- **Description**: "Properties you have purchased or rented"

## Database Schema

### Property Model Fields Used
- `assignedTo`: Reference to User (customer who purchased/rented)
- `assignedAt`: Date when property was assigned
- `assignedBy`: Reference to User (admin/vendor who assigned)
- `owner`: Reference to User (property owner/seller)
- `status`: 'sold' | 'rented' | 'available' | 'leased' | 'pending'

### Review Model Fields Used
- `client`: Reference to User (customer writing review)
- `vendor`: Reference to User (property owner/vendor)
- `property`: Reference to Property
- `rating`: Number (1-5)
- `title`: String
- `comment`: String
- `reviewType`: 'property'
- `isPublic`: Boolean
- `createdAt`: Date

## User Flow

### Viewing Owned Properties
1. Customer logs in
2. Navigates to "Owned Properties" from sidebar
3. Sees all properties they've purchased or rented
4. Can filter by status (purchased/rented)
5. Can search by name or location

### Writing a Review
1. Customer finds a property without a review
2. Clicks "Write Review" button
3. Dialog opens with review form
4. Customer selects rating (1-5 stars)
5. Enters review title and comment
6. Chooses public/private visibility
7. Submits review
8. Review is saved and property shows as "Reviewed"

### Editing a Review
1. Customer finds a property with existing review
2. Clicks "Edit Review" button
3. Dialog opens with pre-filled form
4. Customer updates rating, title, or comment
5. Submits updated review
6. Review is updated in database

## API Integration

### Authentication
All API calls use JWT token authentication:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

### Review Submission
- **Endpoint**: `POST /api/customer/reviews`
- **Method**: POST (new review) or PUT (edit review)
- **Payload**:
```json
{
  "propertyId": "property_id",
  "vendorId": "owner_id",
  "rating": 5,
  "title": "Review Title",
  "comment": "Detailed review comment",
  "reviewType": "property",
  "tags": [],
  "isPublic": true
}
```

## UI/UX Features

### Property Card Design
- Property image with status badge
- "Reviewed" indicator for reviewed properties
- Seller information display
- Purchase/rental date
- Review display (if exists)
- Call-to-action buttons

### Review Dialog
- Modal design with property context
- Star rating selector with hover effects
- Character count for comment (max 1000)
- Title input (max 200 characters)
- Public/private toggle
- Validation before submission

### Empty States
- No properties: Friendly message
- No search results: Clear filters button
- Loading state: Spinner with message

### Real-time Updates
- Connection status indicator
- Auto-refresh capability
- Real-time property updates support

## Error Handling

1. **API Errors**: Toast notifications for failed requests
2. **Validation Errors**: Inline validation messages
3. **Network Errors**: Fallback to offline mode indication
4. **Form Validation**: 
   - Rating required
   - Title and comment required
   - Character limits enforced

## Testing Checklist

- [ ] Customer can view owned properties
- [ ] Filtering by status works correctly
- [ ] Search functionality works
- [ ] Review submission works
- [ ] Review editing works
- [ ] Only assigned properties show up
- [ ] Seller information displays correctly
- [ ] Images display properly
- [ ] Realtime updates work
- [ ] Pagination works correctly
- [ ] Empty states display correctly
- [ ] Loading states work
- [ ] Error handling works
- [ ] Mobile responsive design

## Future Enhancements

1. **Review Photos**: Allow customers to upload photos with reviews
2. **Review Tags**: Add predefined tags (location, amenities, value, etc.)
3. **Helpful Votes**: Allow other users to vote reviews as helpful
4. **Vendor Response**: Allow sellers to respond to reviews
5. **Review Analytics**: Show review trends and statistics
6. **Export Data**: Allow customers to export property details
7. **Document Storage**: Store purchase/rental documents
8. **Payment History**: Track payment history for properties
9. **Maintenance Requests**: For rented properties
10. **Renewal Reminders**: For rental properties approaching end date

## Notes

- The feature distinguishes between properties customers own (selling) vs. properties they've purchased/rented
- Reviews are tied to the property-customer relationship
- Only properties with status "sold" or "rented" and assigned to customer appear
- The review system integrates with the existing Review model
- Real-time updates enhance user experience
- Mobile-responsive design ensures accessibility across devices
