# WACE Platform - Developer Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication](#authentication)
6. [File Storage](#file-storage)
7. [Email System](#email-system)
8. [Setup Guide](#setup-guide)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)

---

## System Architecture

### Overview
WACE is a collaborative workspace platform built with Next.js 16, MongoDB, and NextAuth.js. The platform allows users to create "Pods" (workspaces) and collaborate through various sections: Chat, Documents, Meetings, Calendar, and Goals.

### Architecture Pattern
- **Frontend**: Next.js 16 with React Server Components and Client Components
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Cloud) with Mongoose ODM
- **File Storage**: MongoDB GridFS (built into MongoDB)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Email**: Resend API

### Key Features
1. **User Authentication**: Sign up, login, session management
2. **Pod Management**: Create, update, delete pods
3. **Member Invitations**: Email-based invitation system
4. **Access Control**: Granular permissions per block/section
5. **Real-time Chat**: Server-Sent Events for chat messages
6. **Document Management**: Upload/download PDFs via GridFS
7. **Calendar Events**: Create and manage events
8. **Goal Tracking**: Track goals with status updates

---

## Tech Stack

### Core Technologies
- **Framework**: Next.js 16.0.3
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.9

### Backend & Database
- **Database**: MongoDB Atlas (Free Tier: 512MB)
- **ODM**: Mongoose 8.8.4
- **Authentication**: NextAuth.js v5 (beta)
- **Password Hashing**: bcryptjs 2.4.3

### External Services
- **Email**: Resend (Free Tier: 3,000 emails/month)
- **File Storage**: MongoDB GridFS (Free - built-in)
- **Deployment**: Vercel (Free Tier)

### Development Tools
- **Package Manager**: npm/pnpm
- **Type Checking**: TypeScript
- **Code Formatting**: ESLint

---

## Database Schema

### Collections Overview

#### 1. Users
```typescript
{
  _id: ObjectId
  email: string (unique, lowercase)
  password: string (hashed)
  name: string
  createdAt: Date
  updatedAt: Date
}
```

#### 2. Pods
```typescript
{
  _id: ObjectId
  name: string
  tagline?: string
  logoUrl?: string
  creatorId: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

#### 3. PodMembers
```typescript
{
  _id: ObjectId
  podId: ObjectId (ref: Pod)
  userId: ObjectId (ref: User)
  role: 'creator' | 'member'
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}
// Index: { podId: 1, userId: 1 } (unique)
```

#### 4. Blocks
```typescript
{
  _id: ObjectId
  podId: ObjectId (ref: Pod)
  type: 'chat' | 'docs' | 'meetings' | 'calendar' | 'goals'
  label: string
  x: number
  y: number
  creatorId: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

#### 5. BlockMembers (Access Control)
```typescript
{
  _id: ObjectId
  blockId: ObjectId (ref: Block)
  userId: ObjectId (ref: User)
  addedAt: Date
  createdAt: Date
  updatedAt: Date
}
// Index: { blockId: 1, userId: 1 } (unique)
```

#### 6. Invitations
```typescript
{
  _id: ObjectId
  podId: ObjectId (ref: Pod)
  email: string (lowercase)
  token: string (unique)
  invitedBy: ObjectId (ref: User)
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: Date (default: 7 days)
  createdAt: Date
  updatedAt: Date
}
```

#### 7. ChatMessages
```typescript
{
  _id: ObjectId
  blockId: ObjectId (ref: Block)
  userId: ObjectId (ref: User)
  message: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}
```

#### 8. Documents
```typescript
{
  _id: ObjectId
  blockId: ObjectId (ref: Block)
  fileName: string
  fileUrl: string (GridFS URL)
  fileType: string
  fileSize: number
  uploadedBy: ObjectId (ref: User)
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

#### 9. CalendarEvents
```typescript
{
  _id: ObjectId
  blockId: ObjectId (ref: Block)
  title: string
  date: Date
  time?: string
  description?: string
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

#### 10. Goals
```typescript
{
  _id: ObjectId
  blockId: ObjectId (ref: Block)
  title: string
  status: 'not_started' | 'in_progress' | 'done'
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/login`
Login (handled by NextAuth.js)

#### GET `/api/auth/me`
Get current user session

---

### Pods

#### GET `/api/pods`
Get all pods for the authenticated user.

**Response:**
```json
{
  "pods": [
    {
      "id": "pod_id",
      "name": "My Pod",
      "tagline": "Tagline here",
      "logoUrl": "url",
      "role": "creator",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/pods`
Create a new pod.

**Request Body:**
```json
{
  "name": "My Pod",
  "tagline": "Optional tagline",
  "logoUrl": "optional_logo_url"
}
```

#### GET `/api/pods/:id`
Get a specific pod.

#### PUT `/api/pods/:id`
Update pod (only creator).

**Request Body:**
```json
{
  "name": "Updated Name",
  "tagline": "Updated tagline",
  "logoUrl": "updated_url"
}
```

#### DELETE `/api/pods/:id`
Delete pod (only creator).

---

### Pod Invitations

#### POST `/api/pods/:id/invite`
Invite a user to a pod.

**Request Body:**
```json
{
  "email": "invitee@example.com"
}
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation_id",
    "email": "invitee@example.com",
    "status": "pending"
  }
}
```

#### GET `/api/invitations/accept/:token`
Accept an invitation (redirects to dashboard).

---

### Blocks

#### GET `/api/blocks?podId=:id`
Get all blocks for a pod.

**Response:**
```json
{
  "blocks": [
    {
      "id": "block_id",
      "podId": "pod_id",
      "type": "chat",
      "label": "Development Team",
      "x": 100,
      "y": 200,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/blocks`
Create a new block.

**Request Body:**
```json
{
  "podId": "pod_id",
  "type": "chat",
  "label": "Team Chat",
  "x": 100,
  "y": 200
}
```

#### PUT `/api/blocks/:id`
Update block position.

**Request Body:**
```json
{
  "x": 150,
  "y": 250
}
```

#### DELETE `/api/blocks/:id`
Delete a block.

---

### Block Members (Access Control)

#### POST `/api/blocks/:id/members`
Add a member to a block.

**Request Body:**
```json
{
  "userId": "user_id"
}
```

#### GET `/api/blocks/:id/members`
Get all members with access to a block.

#### DELETE `/api/blocks/:id/members/:userId`
Remove member access from a block.

---

### Chat

#### GET `/api/chat/:blockId/messages`
Get all messages for a chat block.

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "userId": "user_id",
      "userName": "John Doe",
      "message": "Hello!",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/chat/:blockId/messages`
Send a message.

**Request Body:**
```json
{
  "message": "Hello everyone!"
}
```

---

### Documents

#### GET `/api/documents?blockId=:id`
Get all documents for a block.

#### POST `/api/documents`
Upload a document (multipart/form-data).

**Form Data:**
- `file`: PDF file
- `blockId`: Block ID

#### DELETE `/api/documents/:id`
Delete a document.

---

### Calendar Events

#### GET `/api/calendar/events?blockId=:id`
Get all events for a calendar block.

#### POST `/api/calendar/events`
Create a new event.

**Request Body:**
```json
{
  "blockId": "block_id",
  "title": "Meeting",
  "date": "2024-01-15",
  "time": "10:00 AM",
  "description": "Team meeting"
}
```

#### PUT `/api/calendar/events/:id`
Update an event.

#### DELETE `/api/calendar/events/:id`
Delete an event.

---

### Goals

#### GET `/api/goals?blockId=:id`
Get all goals for a goals block.

#### POST `/api/goals`
Create a new goal.

**Request Body:**
```json
{
  "blockId": "block_id",
  "title": "Complete project",
  "status": "not_started"
}
```

#### PUT `/api/goals/:id`
Update goal status.

**Request Body:**
```json
{
  "status": "in_progress"
}
```

#### DELETE `/api/goals/:id`
Delete a goal.

---

## Authentication

### NextAuth.js Configuration

**File**: `auth.ts`

- Uses Credentials provider
- JWT session strategy
- Session stored in JWT token
- User ID included in session

### Protected Routes

All API routes check authentication using:
```typescript
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Client-Side Auth

```typescript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
```

---

## File Storage

### MongoDB GridFS

Files are stored using MongoDB GridFS, which is built into MongoDB.

**Advantages:**
- No additional service needed
- Free with MongoDB Atlas
- Handles large files efficiently
- Integrated with database

**Implementation:**
- Use `multer-gridfs-storage` for file uploads
- Store file metadata in Documents collection
- Serve files via API route

---

## Email System

### Resend Integration

**File**: `lib/email.ts`

**Setup:**
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to `.env.local`: `RESEND_API_KEY=re_...`
4. Verify domain (or use `onboarding@resend.dev` for testing)

**Usage:**
```typescript
import { sendInvitationEmail } from '@/lib/email'

await sendInvitationEmail({
  to: 'user@example.com',
  podName: 'My Pod',
  invitationLink: 'https://...'
})
```

---

## Setup Guide

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free)
- Resend account (free)
- Git installed

### Step 1: Clone and Install

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Step 2: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or `0.0.0.0/0` for development)
5. Get connection string

### Step 3: Environment Variables

Create `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wace?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
RESEND_API_KEY=re_your_api_key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Development Workflow

### Database Models

All models are in `/models` directory:
- `User.ts`
- `Pod.ts`
- `PodMember.ts`
- `Block.ts`
- `BlockMember.ts`
- `Invitation.ts`
- `ChatMessage.ts`
- `Document.ts`
- `CalendarEvent.ts`
- `Goal.ts`

### API Routes

All API routes are in `/app/api` directory following Next.js 13+ App Router structure.

### Adding New Features

1. Create/update Mongoose model in `/models`
2. Create API route in `/app/api`
3. Update frontend components
4. Test locally
5. Deploy to Vercel

---

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Vercel

Add all variables from `.env.local`:
- `MONGODB_URI`
- `NEXTAUTH_URL` (your Vercel URL)
- `NEXTAUTH_SECRET`
- `RESEND_API_KEY`

### MongoDB Atlas Network Access

Update MongoDB Atlas network access to allow Vercel IPs or use `0.0.0.0/0` (less secure but works for development).

---

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcryptjs
2. **JWT Tokens**: Secure session management with NextAuth.js
3. **Input Validation**: Validate all user inputs
4. **Access Control**: Check permissions on all API routes
5. **Email Verification**: Consider adding email verification for signups
6. **Rate Limiting**: Consider adding rate limiting for API routes
7. **CORS**: Configure CORS if needed

---

## Troubleshooting

### MongoDB Connection Issues
- Check connection string format
- Verify network access in MongoDB Atlas
- Check if cluster is running

### NextAuth Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies

### Email Not Sending
- Verify Resend API key
- Check Resend dashboard for errors
- Verify sender email domain

---

## Future Enhancements

1. Real-time updates with WebSockets
2. File preview for documents
3. Video/audio meetings integration
4. Advanced goal tracking with milestones
5. Notification system
6. Search functionality
7. Mobile app (React Native)

---

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint responses
3. Check browser console and server logs
4. Review MongoDB Atlas logs

---

**Last Updated**: January 2024
**Version**: 1.0.0

