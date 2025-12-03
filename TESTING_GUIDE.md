# WACE Platform - Testing Guide

This document provides comprehensive test cases for QA testers to verify all features are working correctly.

---

## Pre-Testing Setup

### 1. Test Accounts
Create at least **3 test accounts** with different emails:
- **Account 1**: Creator account (for creating pods)
- **Account 2**: Member account (for testing invitations)
- **Account 3**: Additional member (for testing multiple members)

### 2. Test Environment
- Access the deployed application URL
- Use different browsers if possible (Chrome, Firefox, Safari)
- Clear browser cache before testing
- Use incognito/private mode for fresh sessions

### 3. Test Data
- Prepare test images (JPEG, PNG) under 5MB
- Prepare test PDF files under 10MB
- Have email addresses ready for invitation testing

---

## Test Cases

### 🔐 TC-001: User Authentication

#### TC-001-1: User Sign Up
**Steps:**
1. Navigate to signup page
2. Enter email address (new, not used before)
3. Enter password
4. Enter name
5. Click "Sign Up"

**Expected Results:**
- ✅ User is created successfully
- ✅ Redirected to login page or dashboard
- ✅ No error messages
- ✅ Can log in with new credentials

**Test with:**
- Valid email format
- Invalid email format (should show error)
- Weak password (should show error if validation exists)
- Duplicate email (should show error)

---

#### TC-001-2: User Login
**Steps:**
1. Navigate to login page
2. Enter registered email
3. Enter password
4. Click "Login"

**Expected Results:**
- ✅ Successfully logged in
- ✅ Redirected to dashboard
- ✅ User name/profile appears in header
- ✅ Can see pods (if any)

**Test with:**
- Correct credentials
- Wrong password (should show error)
- Non-existent email (should show error)
- Empty fields (should show validation error)

---

#### TC-001-3: User Logout
**Steps:**
1. Log in to the application
2. Click "Log out" button
3. Confirm logout

**Expected Results:**
- ✅ Session is cleared
- ✅ Redirected to login page
- ✅ Cannot access dashboard without logging in again

---

### 🏢 TC-002: Pod Management

#### TC-002-1: Create Pod
**Steps:**
1. Log in as Account 1
2. Click "Create Pod" or "Create Your First Pod"
3. Enter pod name (e.g., "Test Pod")
4. Enter tagline (optional, e.g., "Testing workspace")
5. Upload logo image (optional)
6. Click "Create"

**Expected Results:**
- ✅ Pod is created successfully
- ✅ Pod appears on dashboard
- ✅ Logo displays if uploaded
- ✅ Can click pod to open canvas
- ✅ User is automatically added as creator

**Test with:**
- Pod name only
- Pod name + tagline
- Pod name + tagline + logo
- Empty pod name (should show error)

---

#### TC-002-2: View Pod Details
**Steps:**
1. On dashboard, hover over a pod card
2. Click the three dots (⋮) icon
3. Pod details modal opens

**Expected Results:**
- ✅ Modal opens (no double close icons)
- ✅ Shows pod name, tagline, logo
- ✅ Shows member count
- ✅ Shows "Invite Members" button (if creator)
- ✅ Shows creation date
- ✅ Can close modal with X button

**Issues to Check:**
- ❌ Double close icons (should NOT appear)
- ❌ Modal doesn't open
- ❌ Missing information

---

#### TC-002-3: Delete Pod
**Steps:**
1. Open pod details (three dots menu)
2. As creator, delete button should be visible on pod card
3. Click delete button
4. Confirm deletion

**Expected Results:**
- ✅ Delete confirmation dialog appears
- ✅ Pod is deleted after confirmation
- ✅ Pod disappears from dashboard
- ✅ All pod data is removed
- ✅ Non-creators cannot see delete button

**Test with:**
- Creator account (should be able to delete)
- Member account (should NOT see delete button)

---

### 👥 TC-003: Member Management

#### TC-003-1: Add Member Directly (No Email)
**Steps:**
1. Log in as Account 1 (creator)
2. Open pod details (three dots)
3. Click "Invite Members"
4. Go to "Add Directly" tab
5. Type Account 2's name or email in search box
6. Wait for search results
7. Click "Add" next to Account 2

**Expected Results:**
- ✅ Search results appear after typing 2+ characters
- ✅ Account 2 appears in results
- ✅ Clicking "Add" adds user immediately
- ✅ Success message appears
- ✅ Member count increases
- ✅ Account 2 can now see pod in their dashboard

**Test with:**
- Search by name
- Search by email
- Search with no results
- Add same user twice (should show error)

---

#### TC-003-2: Send Email Invitation
**Steps:**
1. Log in as Account 1 (creator)
2. Open pod details
3. Click "Invite Members"
4. Go to "Send Invitation" tab
5. Enter Account 3's email
6. Click "Send Invitation"

**Expected Results:**
- ✅ Invitation sent message appears
- ✅ Email is sent (check email inbox)
- ✅ Email contains invitation link
- ✅ Link works and accepts invitation
- ✅ User is added to pod after accepting

**Test with:**
- Valid email (user exists in system)
- Invalid email format
- Email of non-existent user (should show error)
- Already member email (should show error)

---

#### TC-003-3: Accept Invitation
**Steps:**
1. Receive invitation email
2. Click invitation link
3. Log in if not already logged in
4. Link redirects to acceptance page

**Expected Results:**
- ✅ Invitation link works
- ✅ Shows success message if accepted
- ✅ Shows error if invalid/expired
- ✅ User is added to pod
- ✅ Can access pod immediately

**Test with:**
- Valid invitation link
- Expired invitation (should show error)
- Already accepted invitation
- Invalid token (should show error)

---

### 📦 TC-004: Canvas & Blocks

#### TC-004-1: Open Pod Canvas
**Steps:**
1. Click on a pod card
2. Wait for canvas to load

**Expected Results:**
- ✅ Canvas opens quickly (no long loading)
- ✅ Shows canvas with grid background
- ✅ Shows tabs at top (Chat, Docs, Calendar, Goals, Meetings)
- ✅ Shows existing blocks (if any)
- ✅ Back button works to return to dashboard

**Performance Check:**
- ⏱️ Canvas should load within 2-3 seconds
- ⏱️ No "loading forever" issues

---

#### TC-004-2: Create Block
**Steps:**
1. Open pod canvas
2. Select a tab (e.g., "Chat")
3. Click "+" button
4. Enter block name
5. Click "Create"

**Expected Results:**
- ✅ Block is created
- ✅ Block appears on canvas
- ✅ Block has correct label
- ✅ Can double-click to open
- ✅ Creator can see delete button on hover

**Test with:**
- Chat block
- Document block
- Calendar block
- Goals block
- Empty block name (should show error)
- Duplicate block name (should be allowed)

---

#### TC-004-3: Open Block (Double-Click)
**Steps:**
1. Create or find a block on canvas
2. Double-click the block

**Expected Results:**
- ✅ Block opens immediately (no delay)
- ✅ Modal/content opens
- ✅ Shows block content
- ✅ Can interact with block features
- ✅ Close button works

**Performance Check:**
- ⏱️ Block should open instantly (no artificial delay)
- ⏱️ No need to click multiple times

**Test with:**
- Blocks you created (should open)
- Blocks you're a member of (should open)
- Blocks you're NOT a member of (should show access error)

---

#### TC-004-4: Drag Block
**Steps:**
1. Open canvas with blocks
2. Click and hold on a block
3. Drag to new position
4. Release mouse

**Expected Results:**
- ✅ Block moves smoothly
- ✅ Block stays in new position
- ✅ Position is saved
- ✅ Refresh page - block stays in new position

---

#### TC-004-5: Delete Block
**Steps:**
1. Open canvas
2. Hover over a block you created
3. Click delete button (trash icon)
4. Confirm deletion

**Expected Results:**
- ✅ Delete button appears on hover (creator only)
- ✅ Confirmation dialog appears
- ✅ Block is deleted after confirmation
- ✅ Block disappears from canvas
- ✅ Non-creators cannot see delete button

---

### 💬 TC-005: Chat Feature

#### TC-005-1: Create Chat Block
**Steps:**
1. Open pod canvas
2. Go to "Chat" tab
3. Click "+" to create chat block
4. Enter chat name
5. Create block

**Expected Results:**
- ✅ Chat block created
- ✅ Appears on canvas
- ✅ Can double-click to open

---

#### TC-005-2: Send Message
**Steps:**
1. Open chat block (double-click)
2. Type message in input box
3. Press Enter or click Send

**Expected Results:**
- ✅ Message appears immediately
- ✅ Shows sender name
- ✅ Shows timestamp
- ✅ Message persists (refresh page, still there)
- ✅ Other members can see message

**Test with:**
- Short messages
- Long messages
- Special characters
- Empty message (should not send)

---

#### TC-005-3: View Chat Members
**Steps:**
1. Open chat block
2. Look at right panel

**Expected Results:**
- ✅ Shows member list
- ✅ Shows member names and emails
- ✅ Creator badge appears for creator
- ✅ Owner badge appears for pod owner
- ✅ "Add Members" button visible (creator only)

---

#### TC-005-4: Add Members to Chat
**Steps:**
1. Open chat block (as creator)
2. Click "Add Members" button
3. Search for user
4. Add user

**Expected Results:**
- ✅ User is added to chat
- ✅ User appears in member list
- ✅ User can now see and send messages
- ✅ Non-creators cannot add members

---

#### TC-005-5: Unread Message Count
**Steps:**
1. As Account 1, send message in chat
2. Log out
3. Log in as Account 2 (member)
4. Check chat block on canvas

**Expected Results:**
- ✅ Unread count badge appears on chat block
- ✅ Badge shows number of unread messages
- ✅ Badge disappears after opening chat
- ✅ Badge updates when new messages arrive

---

### 📄 TC-006: Documents Feature

#### TC-006-1: Upload Document
**Steps:**
1. Create or open Document block
2. Click "Upload Document"
3. Select PDF file
4. Wait for upload

**Expected Results:**
- ✅ File uploads successfully
- ✅ Document appears in list
- ✅ Shows file name, size, uploader, date
- ✅ Can download document
- ✅ File size limit enforced (10MB max)

**Test with:**
- Valid PDF file
- PDF over 10MB (should show error)
- Non-PDF file (should show error)
- Multiple files

---

#### TC-006-2: Download Document
**Steps:**
1. Open Document block
2. Click on document name

**Expected Results:**
- ✅ Document downloads
- ✅ File is correct PDF
- ✅ File opens correctly

---

#### TC-006-3: Delete Document
**Steps:**
1. Open Document block (as creator)
2. Find delete button on document
3. Click delete
4. Confirm

**Expected Results:**
- ✅ Document is deleted
- ✅ Disappears from list
- ✅ Cannot download deleted document
- ✅ Non-creators cannot delete

---

### 📅 TC-007: Calendar Feature

#### TC-007-1: Create Event
**Steps:**
1. Create or open Calendar block
2. Click "Create Event"
3. Fill in:
   - Title (required)
   - Date (required)
   - Time (optional)
   - Description (optional)
4. Click "Create"

**Expected Results:**
- ✅ Event is created
- ✅ Appears on calendar
- ✅ Shows correct date and time
- ✅ Can click to view details

**Test with:**
- All fields filled
- Only required fields
- Past dates (should be allowed)
- Future dates

---

#### TC-007-2: Edit Event
**Steps:**
1. Open Calendar block
2. Click on existing event
3. Edit details
4. Save

**Expected Results:**
- ✅ Event is updated
- ✅ Changes are saved
- ✅ Updated info displays correctly

---

#### TC-007-3: Delete Event
**Steps:**
1. Open Calendar block (as creator)
2. Click on event
3. Click delete
4. Confirm

**Expected Results:**
- ✅ Event is deleted
- ✅ Disappears from calendar
- ✅ Non-creators cannot delete

---

### 🎯 TC-008: Goals Feature

#### TC-008-1: Create Goal
**Steps:**
1. Create or open Goals block
2. Click "Create Tracker"
3. Enter goal title
4. Select initial status
5. Create

**Expected Results:**
- ✅ Goal is created
- ✅ Appears in list
- ✅ Shows correct status badge
- ✅ Shows title

---

#### TC-008-2: Update Goal Status
**Steps:**
1. Open Goals block
2. Click on status badge
3. Select new status

**Expected Results:**
- ✅ Status updates immediately
- ✅ Badge color changes
- ✅ Status persists after refresh

**Test with:**
- Not Started → In Progress
- In Progress → Completed
- Completed → Not Started

---

#### TC-008-3: Delete Goal
**Steps:**
1. Open Goals block (as creator)
2. Find delete button
3. Click delete
4. Confirm

**Expected Results:**
- ✅ Goal is deleted
- ✅ Disappears from list
- ✅ Non-creators cannot delete

---

### 🌐 TC-009: Explore Page

#### TC-009-1: View Profiles
**Steps:**
1. Navigate to Explore page
2. Browse featured profiles
3. Browse all profiles

**Expected Results:**
- ✅ Profiles load
- ✅ Featured section shows at top
- ✅ All profiles show below
- ✅ Profile cards display correctly
- ✅ Can click profile to view details

---

#### TC-009-2: Search Profiles
**Steps:**
1. Go to Explore page
2. Type in search box
3. Wait for results

**Expected Results:**
- ✅ Results filter as you type
- ✅ Searches name, tagline, description
- ✅ Results update in real-time
- ✅ Clear search shows all profiles

**Test with:**
- Search by name
- Search by tagline
- Search with no results
- Special characters

---

#### TC-009-3: Filter Profiles
**Steps:**
1. Go to Explore page
2. Click filter buttons (All, Startups, Agencies)

**Expected Results:**
- ✅ Filters work correctly
- ✅ Only matching profiles show
- ✅ Filter state persists
- ✅ Works with search

---

#### TC-009-4: Like Profile
**Steps:**
1. Go to Explore page
2. Click heart icon on profile
3. Check if liked

**Expected Results:**
- ✅ Heart fills (if logged in)
- ✅ Like count increases
- ✅ Can unlike by clicking again
- ✅ Requires login (redirects if not logged in)

---

#### TC-009-5: Create Profile
**Steps:**
1. Go to Explore page
2. Click "Showcase Your Work"
3. Select pod (optional)
4. Choose type (Startup/Agency)
5. Fill in profile details
6. Upload logo (optional)
7. Submit

**Expected Results:**
- ✅ Profile is created
- ✅ Appears in explore page
- ✅ Can view own profile
- ✅ Logo displays if uploaded

**Test with:**
- Startup profile
- Agency profile
- With pod link
- Without pod link
- With logo
- Without logo

---

#### TC-009-6: Delete Profile
**Steps:**
1. Go to Explore page
2. Find your own profile
3. Click delete button (trash icon)
4. Confirm deletion

**Expected Results:**
- ✅ Delete button only visible to creator
- ✅ Confirmation dialog appears
- ✅ Profile is deleted
- ✅ Disappears from explore page
- ✅ Others cannot delete your profile

**Test with:**
- Your own profile (should see delete)
- Other's profile (should NOT see delete)

---

### 🖼️ TC-010: Image Upload

#### TC-010-1: Upload Pod Logo
**Steps:**
1. Create pod
2. Select logo image
3. Upload

**Expected Results:**
- ✅ Image uploads successfully
- ✅ Logo displays on pod card
- ✅ Logo displays in pod details
- ✅ Image loads correctly

**Test with:**
- JPEG image
- PNG image
- WebP image
- Image over 5MB (should show error)
- Invalid file type (should show error)

---

#### TC-010-2: Upload Profile Picture
**Steps:**
1. Go to Settings
2. Upload profile picture
3. Save

**Expected Results:**
- ✅ Profile picture uploads
- ✅ Displays in header
- ✅ Updates across app

---

### ⚡ TC-011: Performance Testing

#### TC-011-1: Page Load Speed
**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to dashboard
4. Check load time

**Expected Results:**
- ✅ Dashboard loads within 3 seconds
- ✅ No long pending requests
- ✅ Images load reasonably fast

---

#### TC-011-2: API Response Time
**Steps:**
1. Open browser DevTools
2. Go to Network tab
3. Perform various actions (create pod, send message, etc.)
4. Check API response times

**Expected Results:**
- ✅ First API call may take 1-2 seconds (connection setup)
- ✅ Subsequent calls should be fast (<500ms)
- ✅ No requests hanging/pending forever

---

#### TC-011-3: Click Responsiveness
**Steps:**
1. Click on pod (should open quickly)
2. Double-click block (should open immediately)
3. Click buttons (should respond instantly)

**Expected Results:**
- ✅ No need to click multiple times
- ✅ Actions happen immediately
- ✅ Loading states show when appropriate
- ✅ No frozen UI

---

### 🔒 TC-012: Security & Access Control

#### TC-012-1: Unauthorized Access
**Steps:**
1. Log out
2. Try to access API endpoints directly
3. Try to access dashboard URL

**Expected Results:**
- ✅ Redirected to login
- ✅ Cannot access protected pages
- ✅ API returns 401 Unauthorized

---

#### TC-012-2: Permission Checks
**Steps:**
1. As member (not creator), try to:
   - Delete pod
   - Invite members
   - Delete blocks you didn't create

**Expected Results:**
- ✅ Delete buttons not visible
- ✅ Invite options not available
- ✅ Cannot perform unauthorized actions
- ✅ Error messages if attempted via API

---

#### TC-012-3: Block Access Control
**Steps:**
1. As creator, create block
2. Don't add Account 2 as member
3. Log in as Account 2
4. Try to open block

**Expected Results:**
- ✅ Access denied message appears
- ✅ Cannot view block content
- ✅ Error message is clear

---

## Common Issues to Check

### ❌ Critical Issues

1. **App loads forever**
   - Check browser console for errors
   - Check network tab for failed requests
   - Verify MongoDB connection is working

2. **Images not uploading**
   - Check file size (max 5MB)
   - Check file type (JPEG, PNG, WebP only)
   - Check browser console for errors

3. **Multiple clicks required**
   - Should work with single/double click
   - Check if loading states are working
   - Verify no JavaScript errors

4. **Slow loading**
   - First load may be slower (connection setup)
   - Subsequent loads should be fast
   - Check network tab for slow requests

5. **Double close icons**
   - Pod details modal should have ONE close button
   - No duplicate X icons

### ⚠️ Medium Priority Issues

1. **Email invitations not sending**
   - Check if Resend is configured
   - Verify email addresses are valid
   - Check Resend dashboard for errors

2. **Messages not appearing**
   - Refresh page
   - Check if user has access to block
   - Verify message was sent successfully

3. **Documents not downloading**
   - Check file was uploaded correctly
   - Verify file exists in database
   - Check browser download settings

### ℹ️ Minor Issues

1. **UI alignment issues**
   - Check on different screen sizes
   - Verify dark mode works
   - Check responsive design

2. **Styling inconsistencies**
   - Check colors match theme
   - Verify fonts load correctly
   - Check spacing and alignment

---

## Test Report Template

Use this template to report test results:

```
Test Case: TC-XXX-X
Feature: [Feature Name]
Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
Browser: [Chrome/Firefox/Safari]
Date: [Date]

Steps Taken:
1. [Step]
2. [Step]
3. [Step]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots:
[Attach if failure]

Notes:
[Additional observations]
```

---

## Testing Checklist

### Authentication
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Session persists
- [ ] Invalid credentials rejected

### Pods
- [ ] Create pod
- [ ] View pod details
- [ ] Delete pod (creator only)
- [ ] Pod appears on dashboard
- [ ] Logo uploads correctly

### Members
- [ ] Add member directly (no email)
- [ ] Send email invitation
- [ ] Accept invitation
- [ ] Member appears in pod
- [ ] Only creator can invite

### Canvas & Blocks
- [ ] Canvas opens quickly
- [ ] Create blocks
- [ ] Double-click opens blocks
- [ ] Drag blocks works
- [ ] Delete blocks (creator only)
- [ ] Access control works

### Chat
- [ ] Create chat block
- [ ] Send messages
- [ ] View messages
- [ ] Add members to chat
- [ ] Unread count works

### Documents
- [ ] Upload PDF
- [ ] Download PDF
- [ ] Delete document
- [ ] File size limit enforced
- [ ] File type validation

### Calendar
- [ ] Create events
- [ ] Edit events
- [ ] Delete events
- [ ] Events display correctly

### Goals
- [ ] Create goals
- [ ] Update status
- [ ] Delete goals
- [ ] Status persists

### Explore
- [ ] View profiles
- [ ] Search works
- [ ] Filter works
- [ ] Like profiles
- [ ] Create profile
- [ ] Delete profile (creator only)

### Performance
- [ ] Fast page loads
- [ ] Quick API responses
- [ ] Responsive clicks
- [ ] No hanging requests

### Security
- [ ] Unauthorized access blocked
- [ ] Permissions enforced
- [ ] Access control works

---

## Reporting Issues

When reporting issues, include:
1. **Test Case ID** (e.g., TC-002-1)
2. **Steps to Reproduce** (detailed)
3. **Expected vs Actual** results
4. **Screenshots/Videos** (if possible)
5. **Browser & Version**
6. **Console Errors** (if any)
7. **Network Errors** (check DevTools)
8. **User Account** used for testing

---

## Test Environment

- **URL**: [Your deployed URL]
- **Test Accounts**: 
  - Creator: [email]
  - Member 1: [email]
  - Member 2: [email]

---

**Happy Testing! 🧪**

If you find any issues, document them clearly and report to the development team.

