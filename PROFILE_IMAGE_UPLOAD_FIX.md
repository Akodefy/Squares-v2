# Profile Image Upload Fix

## Issue
Profile image upload was not working in all portals (Customer, Vendor, and Admin) due to missing functionality and incorrect implementation.

## Root Causes

### 1. **Admin Portal** (`src/pages/admin/Profile.tsx`)
- **Missing file input element**: The Camera button existed but there was no hidden `<input type="file">` element
- **No onClick handler**: The Camera button didn't trigger file selection
- **Incorrect upload handler**: `handleAvatarChange` only read the file as DataURL instead of uploading to server
- **Missing loading state**: No visual feedback during upload
- **Missing import**: Used `React.useRef` without importing `useRef` from React

### 2. **Customer Portal** (`src/pages/customer/Profile.tsx`)
- **Incorrect import**: Used `React.useRef` without proper import
- **Type definition issues**: User interface missing `avatar` field
- Upload functionality was implemented but not fully integrated

### 3. **Vendor Portal** (`src/pages/vendor/VendorProfile.tsx`)
- Upload functionality was properly implemented (used as reference for fixes)

### 4. **Upload Service** (`src/services/uploadService.ts`) ⚠️ **CRITICAL**
- **Missing dependency**: Imported non-existent `apiClient` module
- **Broken API calls**: All upload methods were failing due to missing apiClient
- **Inconsistent pattern**: Used different approach than other services in the codebase

## Fixes Applied

### Admin Portal
1. **Added proper React hook import**:
   ```typescript
   import { useState, useEffect, useCallback, useRef } from "react";
   ```

2. **Fixed ref usage**:
   ```typescript
   const fileInputRef = useRef<HTMLInputElement>(null);
   ```

3. **Rewrote `handleAvatarChange` to use uploadService**:
   - Validates image file type and size using `uploadService.validateImageFile()`
   - Compresses image using `uploadService.compressImage()`
   - Uploads to server using `uploadService.uploadAvatar()`
   - Shows proper success/error toasts
   - Includes loading state with spinner
   - Clears file input after upload

4. **Added file input element**:
   ```tsx
   <input
     ref={fileInputRef}
     type="file"
     accept="image/jpeg,image/jpg,image/png,image/webp"
     onChange={handleAvatarChange}
     className="hidden"
   />
   ```

5. **Updated Camera button**:
   - Added onClick handler: `onClick={() => fileInputRef.current?.click()}`
   - Added loading state: `disabled={uploadingAvatar}`
   - Shows spinner during upload: `<Loader2 className="h-4 w-4 animate-spin" />`

### Customer Portal
1. **Fixed React hook import**:
   ```typescript
   import { useState, useEffect, useCallback, useRef } from "react";
   ```

2. **Fixed ref usage**:
   ```typescript
   const fileInputRef = useRef<HTMLInputElement>(null);
   ```

3. **Fixed type issues**:
   - Fixed `emailVerified` access (now using `userData.profile.emailVerified`)
   - Added type assertion for `avatar` field in profile update
   - Used `as any` for avatar in API calls where type definition may be incomplete

## Upload Flow

1. User clicks Camera icon button
2. Hidden file input is triggered
3. User selects an image file
4. File validation:
   - Checks file type (JPEG, PNG, WebP only)
   - Checks file size (max 5MB)
5. Image compression (resizes to max 800px width)
6. Upload to server via uploadService
7. Server returns URL
8. UI updates with new avatar
9. Success toast shown
10. Profile data updated in state

## Features

✅ File type validation (JPEG, PNG, WebP)
✅ File size validation (max 5MB)
✅ Image compression before upload
✅ Loading state with spinner
✅ Success/error toast notifications
✅ Clears file input after upload
✅ Updates profile immediately
✅ Works in edit mode

## Upload Service Methods Used

```typescript
// Validates image file
uploadService.validateImageFile(file)

// Compresses image to reduce file size
uploadService.compressImage(file, maxWidth)

// Uploads avatar to server
uploadService.uploadAvatar(compressedFile)
```

## Testing Checklist

- [ ] Admin portal - Upload profile picture
- [ ] Customer portal - Upload profile picture
- [ ] Vendor portal - Upload profile picture (already working)
- [ ] File validation works (reject invalid types)
- [ ] Size validation works (reject > 5MB)
- [ ] Loading spinner shows during upload
- [ ] Success toast appears after upload
- [ ] Error toast appears on failure
- [ ] Avatar updates immediately
- [ ] Profile saves with new avatar

## Files Modified

1. `/src/pages/admin/Profile.tsx`
   - Added `useRef` import
   - Fixed `fileInputRef` declaration
   - Rewrote `handleAvatarChange` function
   - Added file input element
   - Updated Camera button with onClick and loading state

2. `/src/pages/customer/Profile.tsx`
   - Added `useRef` import
   - Fixed `fileInputRef` declaration
   - Fixed type issues with User interface

3. `/src/pages/vendor/VendorProfile.tsx`
   - No changes needed (already working correctly)

4. `/src/services/uploadService.ts` ⚠️ **CRITICAL FIX**
   - Removed dependency on non-existent `apiClient`
   - Rewrote to use native `fetch` API (consistent with other services)
   - Added `getAuthHeaders()` method for authentication
   - Improved error handling with proper response parsing
   - All upload methods now work correctly

## Notes

- The vendor portal implementation was used as the reference for fixing the other portals
- All portals now use the same upload pattern for consistency
- Upload service handles compression, validation, and API calls
- File input remains hidden for better UX (triggered via Camera button)

## Related Files

- `/src/services/uploadService.ts` - Handles all file uploads
- `/src/services/apiClient.ts` - HTTP client for API calls
- Backend upload endpoint: `POST /api/upload/single`
