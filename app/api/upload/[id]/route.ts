import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

// GET /api/upload/:id - Serve uploaded image from GridFS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
    }

    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const bucket = new GridFSBucket(db, { bucketName: 'uploads' })
    const fileId = new mongoose.Types.ObjectId(id)

    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray()
    if (files.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const file = files[0]

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', file.contentType || 'image/jpeg')
    headers.set('Content-Length', file.length.toString())
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    // Create download stream
    const downloadStream = bucket.openDownloadStream(fileId)

    // Convert stream to response
    const chunks: Buffer[] = []
    for await (const chunk of downloadStream) {
      chunks.push(chunk)
    }

    return new NextResponse(Buffer.concat(chunks), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: 500 }
    )
  }
}

