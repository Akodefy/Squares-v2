# ObjectId Constructor Fix

## Problem
The application was crashing with the error:
```
TypeError: Class constructor ObjectId cannot be invoked without 'new'
at /home/dheena/Downloads/Squares/ninety-nine-acres-web-main/server/routes/vendors.js:387:41
```

This error occurred when calling `mongoose.Types.ObjectId()` without the `new` keyword in MongoDB aggregation queries.

## Root Cause
In newer versions of Mongoose (v6+), the `ObjectId` constructor must be called with the `new` keyword. The old syntax `mongoose.Types.ObjectId(id)` is deprecated and causes a `TypeError`.

## Files Fixed

### 1. server/routes/vendors.js
**Line 387** - Dashboard route (total views aggregation)
```javascript
// Before ❌
{ $match: { owner: mongoose.Types.ObjectId(vendorId) } }

// After ✅
{ $match: { owner: new mongoose.Types.ObjectId(vendorId) } }
```

**Line 915** - Statistics route (total views aggregation)
```javascript
// Before ❌
{ $match: { owner: mongoose.Types.ObjectId(vendorId) } }

// After ✅
{ $match: { owner: new mongoose.Types.ObjectId(vendorId) } }
```

### 2. server/models/Review.js
**Line 181** - getVendorStats static method
```javascript
// Before ❌
{ $match: { vendor: mongoose.Types.ObjectId(vendorId), status: 'active' } }

// After ✅
{ $match: { vendor: new mongoose.Types.ObjectId(vendorId), status: 'active' } }
```

## Impact
This fix resolves the vendor dashboard crash and ensures all MongoDB aggregation queries using ObjectId work correctly.

### Affected Endpoints
- `GET /api/vendors/dashboard` - Now properly calculates property views
- `GET /api/vendors/statistics` - Now properly aggregates vendor stats
- Review aggregations - Now properly match vendor reviews

## Testing Performed
✅ Vendor dashboard loads without errors
✅ Property views are calculated correctly
✅ Total revenue is displayed
✅ Vendor statistics endpoint works
✅ Review stats are aggregated properly

## Prevention
To prevent this issue in the future:

### 1. Always Use `new` with ObjectId
```javascript
// Good ✅
new mongoose.Types.ObjectId(id)

// Bad ❌
mongoose.Types.ObjectId(id)
```

### 2. For Mongoose Queries (Non-Aggregation)
For regular Mongoose queries, you can use the string directly:
```javascript
// Both work fine
Property.find({ owner: vendorId })
Property.find({ owner: new mongoose.Types.ObjectId(vendorId) })
```

### 3. For Aggregation Pipelines
ALWAYS use `new` in aggregation pipelines:
```javascript
Property.aggregate([
  { $match: { owner: new mongoose.Types.ObjectId(vendorId) } }
])
```

## Related Issues
This is a common issue when upgrading from Mongoose v5 to v6+. The `new` keyword requirement is part of the breaking changes in Mongoose v6.

## Additional Notes
- All other instances in the codebase were already using `new` correctly
- This fix is backward compatible with older Mongoose versions
- No database schema changes required

## Verification Commands
```bash
# Test vendor dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vendors/dashboard?dateRange=7d

# Test vendor statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vendors/statistics
```

## Status
✅ **FIXED** - All instances of `mongoose.Types.ObjectId()` without `new` have been corrected.
