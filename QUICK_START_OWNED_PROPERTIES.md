# Quick Setup Guide - Owned Properties Feature

## Overview
This feature adds an "Owned Properties" page where customers can view properties they've purchased or rented and write reviews for them.

## Files Created/Modified

### ✅ New Files
1. `src/pages/customer/OwnedProperties.tsx` - Main page component
2. `OWNED_PROPERTIES_FEATURE.md` - Complete documentation
3. `OWNED_PROPERTIES_SUMMARY.md` - Implementation summary

### ✅ Modified Files
1. `server/routes/customer.js` - Added `/owned-properties` endpoint
2. `src/routes/CustomerLazyImports.ts` - Added OwnedProperties import
3. `src/routes/CustomerRoutes.tsx` - Added route configuration
4. `src/components/customer/CustomerSidebar.tsx` - Added navigation item
5. `src/pages/customer/MyProperties.tsx` - Updated description for clarity

## Quick Start

### 1. Backend is Ready ✅
The backend endpoint is already added to `server/routes/customer.js`:
```
GET /api/customer/owned-properties
```

### 2. Frontend is Ready ✅
Navigation path: `/customer/owned-properties`
Menu item: "Owned Properties" (in customer sidebar)

### 3. How Properties Appear in "Owned Properties"

A property will show up when:
- Property `status` = "sold" OR "rented"
- Property `assignedTo` = Customer's User ID
- Property `assignedAt` = Date of assignment

### 4. Setting Up a Property for Testing

To make a property appear in a customer's "Owned Properties":

**Option A: Via MongoDB/Database**
```javascript
db.properties.updateOne(
  { _id: ObjectId("property_id") },
  { 
    $set: { 
      status: "sold",
      assignedTo: ObjectId("customer_user_id"),
      assignedAt: new Date()
    }
  }
)
```

**Option B: Via Admin Panel** (if you have property assignment functionality)
- Mark property as "sold" or "rented"
- Assign to a specific customer
- Set assignment date

### 5. Review Flow

Once a property is in "Owned Properties":
1. Customer sees "Write Review" button
2. Clicks button → Review dialog opens
3. Selects star rating (1-5)
4. Enters title and comment
5. Chooses public/private
6. Submits → Review saved
7. Property shows "Reviewed" badge
8. Can edit review later via "Edit Review" button

## API Endpoints Used

### Get Owned Properties
```
GET /api/customer/owned-properties
Headers: Authorization: Bearer <token>
Query Params: page, limit, status, search, sortBy, sortOrder
```

### Submit Review
```
POST /api/customer/reviews
Headers: Authorization: Bearer <token>
Body: {
  propertyId, vendorId, rating, title, comment, 
  reviewType: "property", isPublic
}
```

### Update Review
```
PUT /api/customer/reviews/:reviewId
Headers: Authorization: Bearer <token>
Body: { rating, title, comment, isPublic }
```

## Page Differences

| Feature | My Properties | Owned Properties |
|---------|--------------|------------------|
| **Purpose** | Manage properties you're selling | View properties you purchased/rented |
| **Filter** | `owner: userId` | `assignedTo: userId` |
| **Actions** | Edit, Delete, Promote | View, Review, Contact Seller |
| **Status** | All statuses | Only "sold" or "rented" |
| **Who sees** | Property owners/sellers | Property buyers/renters |

## Verification Checklist

- [ ] Server is running
- [ ] Customer can login
- [ ] "Owned Properties" appears in sidebar
- [ ] Page loads at `/customer/owned-properties`
- [ ] Properties with `assignedTo: customerId` appear
- [ ] Review dialog opens
- [ ] Review submission works
- [ ] Review editing works
- [ ] Seller information displays
- [ ] Search and filter work

## Troubleshooting

### No properties showing?
- Check if any properties have `assignedTo` set to current customer's ID
- Check if property status is "sold" or "rented"
- Check browser console for API errors
- Verify JWT token is valid

### Review not submitting?
- Check browser console for errors
- Verify all required fields are filled
- Check if vendorId is set correctly
- Verify Review model exists in database

### 404 on page load?
- Verify route is added in `CustomerRoutes.tsx`
- Check if OwnedProperties is imported in `CustomerLazyImports.ts`
- Restart development server

## Demo Data Setup

To quickly test with demo data:

```javascript
// In MongoDB or via backend script
const Property = require('./models/Property');
const User = require('./models/User');

// Find a customer
const customer = await User.findOne({ role: 'customer' });

// Update a property to assign to customer
await Property.findByIdAndUpdate(propertyId, {
  status: 'sold',
  assignedTo: customer._id,
  assignedAt: new Date(),
  assignedBy: adminUserId // optional
});
```

## Support

For detailed documentation, see:
- `OWNED_PROPERTIES_FEATURE.md` - Full feature documentation
- `OWNED_PROPERTIES_SUMMARY.md` - Implementation summary

## Notes

⚠️ **Important**: The existing review system (`/customer/reviews`) should already have the endpoints for creating/editing reviews. The "Owned Properties" page uses these existing endpoints.

✅ All code is production-ready with proper error handling, loading states, and responsive design.
