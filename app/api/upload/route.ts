import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'profile', 'pod-logo', or 'explore-profile-logo'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Store file in GridFS
    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const bucket = new GridFSBucket(db, { bucketName: 'uploads' })
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${type}/${timestamp}-${randomString}.${fileExtension}`
    
    // Create a new ObjectId for the file
    const fileId = new mongoose.Types.ObjectId()
    
    const uploadStream = bucket.openUploadStreamWithId(fileId, fileName, {
      contentType: file.type,
      metadata: {
        type,
        uploadedBy: session.user.id,
        uploadedAt: new Date(),
      },
    })

    // Write buffer to GridFS
    await new Promise<void>((resolve, reject) => {
      uploadStream.on('finish', resolve)
      uploadStream.on('error', reject)
      uploadStream.end(buffer)
    })

    // Return the public URL
    const fileUrl = `/api/upload/${fileId.toString()}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

