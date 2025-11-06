# Support System Implementation

## Overview
A comprehensive support system has been implemented with the following features:
- Support ticket creation from homepage footer
- Support tracking and status monitoring
- Real-time ticket management
- File attachment support
- Response/conversation system

## Components Created

### 1. Support Service (`/src/services/supportService.ts`)
API service for managing support tickets with the following methods:
- `createTicket()` - Create new support ticket with attachments
- `getMyTickets()` - Fetch user's support tickets with filters
- `getTicketByNumber()` - Track ticket by ticket number
- `addResponse()` - Add response to existing ticket
- `closeTicket()` - Mark ticket as resolved/closed

**Interfaces:**
```typescript
interface SupportTicket {
  _id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: 'technical' | 'billing' | 'property' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  attachments?: string[];
  userId?: string;
  assignedTo?: { _id: string; name: string };
  responses?: Array<{
    message: string;
    sender: { _id: string; name: string; role: string };
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
```

### 2. Support Dialog Component (`/src/components/support/SupportDialog.tsx`)
Reusable dialog component for creating support tickets:
- Form validation (name, email, subject, description required)
- Category selection (General, Technical, Billing, Property, Account)
- Priority levels (Low, Medium, High, Urgent)
- File attachments support (Images: JPG, PNG; Documents: PDF, DOC, DOCX)
- Max file size: 5MB per file
- Email format validation
- Success callback with ticket number

**Props:**
```typescript
interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (ticketNumber: string) => void;
}
```

### 3. Track Support Page (`/src/pages/TrackSupport.tsx`)
Comprehensive support tracking page with:

**Features:**
- Track tickets by ticket number (guest/public tracking)
- View all user tickets (authenticated users)
- Filter by status (All, Open, In Progress, Resolved, Closed)
- Search tickets by subject or number
- Detailed ticket view with conversation history
- Add responses to tickets
- Mark tickets as resolved
- Create new support tickets

**Tabs:**
- All Tickets
- Open
- In Progress
- Resolved
- Closed

**Status Badges:**
- Open (Blue)
- In Progress (Yellow)
- Resolved (Green)
- Closed (Gray)

**Priority Badges:**
- Low (Gray)
- Medium (Blue)
- High (Orange)
- Urgent (Red)

### 4. Updated Footer (`/src/components/Footer.tsx`)
Enhanced with support functionality:
- "Get Support" button integrated
- Opens SupportDialog component
- Added "Track Support" link in Quick Links
- Toast notifications for ticket creation
- Imports: `SupportDialog`, `useToast`, `Headphones` icon

## Routes Added

### User Routes (`/src/routes/UserRoutes.tsx`)
```typescript
<Route path="/track-support" element={<TrackSupport />} />
```

### Lazy Imports (`/src/routes/UserLazyImports.ts`)
```typescript
export const TrackSupport = lazy(() => import("@/pages/TrackSupport"));
```

## User Workflows

### 1. Create Support Ticket (Anonymous/Guest)
1. User clicks "Get Support" button in footer
2. Dialog opens with support form
3. User fills required fields:
   - Full Name
   - Email
   - Phone (optional)
   - Category
   - Subject
   - Priority
   - Description
   - Attachments (optional)
4. Form validates inputs
5. Ticket created with unique ticket number
6. Success message displayed with ticket number
7. User can save ticket number for tracking

### 2. Track Ticket by Number
1. User visits `/track-support` page
2. Enters ticket number in "Track by Number" section
3. Clicks "Track" button
4. System fetches ticket details
5. Full ticket information displayed including:
   - Status and priority
   - Subject and description
   - Creation date
   - All responses/conversation
   - Assigned staff (if any)

### 3. Authenticated User - My Tickets
1. Logged-in user visits `/track-support`
2. "My Support Tickets" section shows all user tickets
3. Filter by status using tabs
4. Search tickets by subject/number
5. Click "View Details" to see full ticket
6. Add responses to open tickets
7. Mark tickets as resolved

### 4. Ticket Response Flow
1. User opens ticket details
2. For open/in-progress tickets:
   - Response textarea available
   - Can send messages to support team
   - Can mark as resolved
3. View conversation history with timestamps
4. Each response shows sender name and role

## Backend API Endpoints Required

The frontend expects these API endpoints:

### POST `/api/support/tickets`
Create new support ticket
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with ticket details + attachments
- Auth: Optional (can be anonymous)
- Response: `{ success: true, data: { ticket: SupportTicket } }`

### GET `/api/support/tickets/my`
Get current user's tickets
- Method: GET
- Auth: Required
- Query params: `page`, `limit`, `status`, `category`, `priority`, `search`
- Response: 
```json
{
  "success": true,
  "data": {
    "tickets": [SupportTicket],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTickets": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET `/api/support/tickets/track/:ticketNumber`
Track ticket by number (public endpoint)
- Method: GET
- Auth: Optional
- Response: `{ success: true, data: { ticket: SupportTicket } }`

### POST `/api/support/tickets/:ticketId/response`
Add response to ticket
- Method: POST
- Auth: Required
- Body: `{ message: string }`
- Response: `{ success: true, data: { ticket: SupportTicket } }`

### PATCH `/api/support/tickets/:ticketId/close`
Close/resolve ticket
- Method: PATCH
- Auth: Required
- Response: `{ success: true, data: { ticket: SupportTicket } }`

## File Upload Specifications

**Allowed file types:**
- Images: JPEG, PNG, JPG
- Documents: PDF, DOC, DOCX

**Constraints:**
- Maximum file size: 5MB per file
- Multiple files supported
- Files sent as FormData multipart

## UI/UX Features

### Support Dialog
- Clean, professional form layout
- Real-time validation
- File upload with preview
- Progress indicators during submission
- Success/error toast notifications
- Responsive design

### Track Support Page
- Tabbed interface for status filtering
- Search functionality
- Card-based ticket display
- Color-coded status badges
- Priority indicators
- Conversation threading
- Responsive grid layout

### Footer Integration
- Prominent "Get Support" button
- Quick access from any page
- Consistent with app theme
- Mobile-friendly

## Notifications & Feedback

### Toast Notifications:
- Ticket creation success with ticket number
- Form validation errors
- File upload errors (type/size)
- API error messages
- Response submission success
- Ticket closure confirmation

### Loading States:
- Form submission loading indicator
- Page load spinner
- Response submission loading
- Button disabled states

## Security Considerations

1. **Email Validation**: Regex pattern validation
2. **File Type Validation**: Client-side type checking
3. **File Size Limits**: 5MB per file enforced
4. **Authorization**: Token-based auth for user tickets
5. **Input Sanitization**: Required on backend

## Accessibility Features

- Semantic HTML structure
- ARIA labels for dialogs
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly
- Color contrast compliant

## Mobile Responsiveness

- Responsive grid layouts
- Touch-friendly buttons
- Mobile-optimized forms
- Drawer-style dialogs on mobile
- Adaptive card layouts

## Future Enhancements

1. **Email Notifications**
   - Ticket creation confirmation
   - Status change notifications
   - New response alerts

2. **Advanced Filtering**
   - Date range filters
   - Category filters
   - Priority filters

3. **Real-time Updates**
   - WebSocket integration
   - Live status updates
   - Instant response notifications

4. **File Management**
   - Download attachments
   - Image preview
   - Document viewer

5. **Analytics Dashboard**
   - Ticket statistics
   - Resolution time metrics
   - Category distribution

6. **Auto-responses**
   - Automated acknowledgment
   - FAQ suggestions
   - Chatbot integration

7. **Rating System**
   - Post-resolution feedback
   - Support quality ratings
   - NPS surveys

## Testing Checklist

- [ ] Create ticket as anonymous user
- [ ] Create ticket as authenticated user
- [ ] Track ticket by number
- [ ] View my tickets
- [ ] Filter tickets by status
- [ ] Search tickets
- [ ] Add response to ticket
- [ ] Mark ticket as resolved
- [ ] Upload files (various types)
- [ ] Test file size limit
- [ ] Test form validation
- [ ] Test mobile responsiveness
- [ ] Test accessibility features

## Dependencies

Already included in the project:
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `react-router-dom` - Routing
- Shadcn UI components - UI library

## Files Modified/Created

**Created:**
1. `/src/services/supportService.ts` - Support API service
2. `/src/components/support/SupportDialog.tsx` - Support form dialog
3. `/src/pages/TrackSupport.tsx` - Support tracking page

**Modified:**
1. `/src/components/Footer.tsx` - Added support button and dialog
2. `/src/routes/UserRoutes.tsx` - Added track-support route
3. `/src/routes/UserLazyImports.ts` - Added TrackSupport lazy import

## Usage Examples

### Opening Support Dialog Programmatically
```typescript
import { SupportDialog } from "@/components/support/SupportDialog";

const [supportOpen, setSupportOpen] = useState(false);

<SupportDialog
  open={supportOpen}
  onOpenChange={setSupportOpen}
  onSuccess={(ticketNumber) => {
    console.log("Ticket created:", ticketNumber);
  }}
/>
```

### Accessing Support Features
- Footer: Click "Get Support" button
- Direct URL: `/track-support`
- Quick Links: "Track Support" link in footer

## Summary

The support system provides a complete solution for:
✅ User support ticket creation
✅ Ticket tracking and monitoring
✅ Status management
✅ Communication between users and support team
✅ File attachment support
✅ Professional UI/UX
✅ Mobile-responsive design
✅ Accessibility compliant
✅ Easy integration with backend APIs
