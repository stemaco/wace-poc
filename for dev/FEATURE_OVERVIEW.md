# WACE Platform - Feature Overview

## What is WACE?

WACE is a collaborative workspace platform that enables teams to organize their work through **Pods** (workspaces) and collaborate using various tools like Chat, Documents, Calendar, and Goals.

---

## Core Features

### 1. User Authentication

**How it works:**
- Users can sign up with email and password
- Passwords are securely hashed using bcrypt
- Sessions are managed using NextAuth.js
- Users must be logged in to access the platform

**Key Points:**
- Email must be unique
- Password is required (minimum security enforced)
- Session persists across browser sessions
- Logout clears the session

---

### 2. Pods (Workspaces)

**What are Pods?**
Pods are collaborative workspaces where teams can work together. Each pod can have multiple members and contains various "blocks" (Chat, Documents, Calendar, Goals).

**Features:**
- **Create Pod**: Users can create pods with a name, optional tagline, and logo
- **Pod Dashboard**: View all pods you're a member of
- **Pod Details**: View pod information, member count, and manage members
- **Delete Pod**: Only the creator can delete a pod (deletes all associated data)

**How it works:**
1. Click "Create Pod" button
2. Enter pod name (required), tagline (optional), and upload logo (optional)
3. Pod is created and you're automatically added as the creator
4. Pod appears on your dashboard
5. Click on a pod to open its canvas

---

### 3. Pod Members & Invitations

**Two ways to add members:**

#### Method 1: Direct Add (Recommended - No Email Required)
- **How it works:**
  1. Open pod details (click three dots on pod card)
  2. Click "Invite Members"
  3. Go to "Add Directly" tab
  4. Search for users by name or email
  5. Click "Add" next to the user
  6. User is immediately added to the pod

- **Benefits:**
  - Instant - no email setup required
  - Works immediately
  - Fast and efficient

#### Method 2: Email Invitation
- **How it works:**
  1. Open pod details
  2. Click "Invite Members"
  3. Go to "Send Invitation" tab
  4. Enter user's email address
  5. System sends invitation email
  6. User clicks link in email to accept

- **Requirements:**
  - User must already be signed up in WACE
  - Email service (Resend) must be configured
  - User receives email with invitation link

**Access Control:**
- Only pod creators can invite/add members
- Members can view and interact with pod content
- Creators have additional permissions (delete pod, manage members)

---

### 4. Canvas & Blocks

**What is the Canvas?**
The canvas is an infinite workspace where you can place different types of "blocks" (Chat, Documents, Calendar, Goals, Meetings).

**Block Types:**
1. **Chat Blocks**: Real-time messaging
2. **Document Blocks**: PDF file storage and sharing
3. **Calendar Blocks**: Event scheduling
4. **Goals Blocks**: Task and goal tracking
5. **Meeting Blocks**: Meeting management (coming soon)

**How it works:**
1. Open a pod to see the canvas
2. Use tabs at the top to switch between block types (Chat, Docs, Calendar, Goals, Meetings)
3. Click "+" button to create a new block
4. Blocks appear as draggable boxes on the canvas
5. **Double-click** a block to open it
6. Drag blocks to reposition them
7. Delete button appears on hover (creator only)

**Access Control:**
- Block creators can delete blocks
- Block creators can add members to specific blocks
- Members added to a block can access that block
- Non-members cannot open blocks (shows access error)

---

### 5. Chat Feature

**How it works:**
1. Create a Chat block on the canvas
2. Double-click the block to open chat
3. Type messages and press Enter or click Send
4. Messages appear in real-time
5. View member list on the right side
6. Add members to chat (creator only)
7. Unread message count badge appears on block

**Features:**
- Real-time messaging
- Member list with roles (Creator/Owner badges)
- Add members to specific chat blocks
- Unread message tracking
- Message timestamps

---

### 6. Documents Feature

**How it works:**
1. Create a Document block on the canvas
2. Double-click the block to open documents
3. Click "Upload Document" button
4. Select a PDF file (max 10MB)
5. Document is uploaded and stored
6. Click document name to download
7. View document details (name, uploader, date, size)

**Features:**
- PDF file upload (only PDFs allowed)
- File size limit: 10MB
- Download documents
- View upload history
- Delete documents (creator only)

---

### 7. Calendar Feature

**How it works:**
1. Create a Calendar block on the canvas
2. Double-click the block to open calendar
3. Click "Create Event" button
4. Fill in event details:
   - Title (required)
   - Date (required)
   - Time (optional)
   - Description (optional)
5. Events appear on the calendar
6. Click event to view/edit details
7. Delete events (creator only)

**Features:**
- Create, edit, and delete events
- Date and time selection
- Event descriptions
- Calendar view

---

### 8. Goals Feature

**How it works:**
1. Create a Goals block on the canvas
2. Double-click the block to open goals
3. Click "Create Tracker" button
4. Enter goal title and initial status
5. Goals appear in the list
6. Click status badge to update progress
7. Delete goals (creator only)

**Status Options:**
- Not Started
- In Progress
- Completed

**Features:**
- Create and track goals
- Update goal status
- Visual status indicators
- Delete goals

---

### 9. Explore Page

**What is it?**
A public showcase where users can publish their startups or agencies for others to discover.

**Features:**
- **View Profiles**: Browse featured and all profiles
- **Search**: Search profiles by name, tagline, or description
- **Filter**: Filter by type (All, Startups, Agencies)
- **Like Profiles**: Like profiles you find interesting
- **View Details**: Click profile to see full details
- **Create Profile**: Showcase your startup/agency
- **Delete Profile**: Only creators can delete their own profiles

**Profile Types:**
1. **Startup**: For startups with funding stage, founders, etc.
2. **Agency**: For agencies with services, clients, experience, etc.

**How to Create a Profile:**
1. Go to Explore page
2. Click "Showcase Your Work" button
3. Select a pod (optional - can create standalone profile)
4. Choose profile type (Startup or Agency)
5. Fill in profile details
6. Upload logo (optional)
7. Publish profile

**Profile Information:**
- Name, tagline, description
- Logo
- Location, website
- Social media links
- Contact information
- Type-specific fields (funding stage, services, etc.)

---

### 10. Image Upload

**How it works:**
- Images are stored in MongoDB GridFS (cloud storage)
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB
- Used for:
  - Pod logos
  - Profile pictures
  - Explore profile logos

**Upload Process:**
1. Select image file
2. System validates file type and size
3. Image is uploaded to GridFS
4. URL is returned and stored
5. Image is displayed immediately

---

## User Roles & Permissions

### Pod Creator
- Can delete the pod
- Can invite/add members
- Can create and delete blocks
- Can add members to blocks
- Can delete all content in blocks

### Pod Member
- Can view and interact with pod content
- Can access blocks they're added to
- Cannot delete pod
- Cannot invite members
- Cannot delete blocks (unless they created them)

### Block Creator
- Can delete their blocks
- Can add members to their blocks
- Can manage block content

---

## Navigation

### Main Navigation
- **Dashboard**: View all your pods
- **Explore**: Browse and create profiles
- **Personal Assistant**: AI assistant (coming soon)
- **Settings**: Manage your account
- **Marketplace**: Browse marketplace (coming soon)

### Pod Navigation
- **Canvas**: Main workspace with blocks
- **Back to Dashboard**: Return to pod list
- **Tabs**: Switch between block types (Chat, Docs, Calendar, Goals, Meetings)

---

## Performance Optimizations

### Connection Caching
- MongoDB connections are cached globally
- Prevents slow loading on serverless functions
- First request may take a moment, subsequent requests are fast

### Polling Intervals
- Notifications: Check every 30 seconds
- Unread counts: Update every 30 seconds
- Optimized to reduce server load

### Click Debouncing
- Prevents multiple rapid clicks
- Loading states prevent duplicate actions
- Smooth user experience

---

## Key Interactions

### Opening Pods
- **Single click** on pod card → Opens pod canvas
- Loading state shows briefly
- Canvas loads with all blocks

### Opening Blocks
- **Double-click** on block → Opens block content
- Access check happens automatically
- Modal opens with block content

### Dragging Blocks
- Click and hold on block
- Drag to new position
- Release to place
- Position is saved automatically

---

## Data Storage

### MongoDB Collections
- **Users**: User accounts
- **Pods**: Workspaces
- **PodMembers**: Pod membership
- **Blocks**: Canvas blocks
- **BlockMembers**: Block access control
- **ChatMessages**: Chat messages
- **Documents**: Document metadata (files in GridFS)
- **CalendarEvents**: Calendar events
- **Goals**: Goal tracking
- **Invitations**: Email invitations
- **ExploreProfiles**: Public profiles

### File Storage
- **Images**: MongoDB GridFS (uploads bucket)
- **Documents**: MongoDB GridFS (documents bucket)
- All files are stored in the cloud database

---

## Security Features

1. **Password Hashing**: All passwords are hashed with bcrypt
2. **Session Management**: Secure JWT-based sessions
3. **Access Control**: Permission checks on all API routes
4. **Input Validation**: All user inputs are validated
5. **File Type Validation**: Only allowed file types accepted
6. **File Size Limits**: Prevents abuse

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (works on desktop and tablet)
- Dark mode support

---

## Known Limitations

1. **Email Invitations**: Requires Resend domain setup for production
2. **File Size**: Images max 5MB, Documents max 10MB
3. **File Types**: Only PDFs for documents, images for uploads
4. **Real-time Updates**: Polling-based (not true WebSocket real-time)
5. **Mobile**: Optimized for desktop/tablet, mobile experience may vary

---

## Future Enhancements

- Real-time WebSocket updates
- Video/audio meetings
- File previews
- Advanced search
- Mobile app
- Notification system improvements
- More block types

---

**Last Updated**: January 2025

