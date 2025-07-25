import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Uppy sends userId in meta, but we can also get it from form data
    let userId = formData.get('userId') as string;
    
    // If userId is not in form data, try to get it from meta
    if (!userId) {
      const meta = formData.get('meta') as string;
      if (meta) {
        const metaData = JSON.parse(meta);
        userId = metaData.userId;
      }
    }

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 string for database storage
    const base64Image = buffer.toString('base64');
    const mimeType = file.type;
    
    // Create data URL format: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    // Save to database
    const updatedProfile = await prisma.user_Profile.upsert({
      where: { user_id: userId },
      update: {
        profile_image_url: imageDataUrl,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        display_name: BigInt(Date.now()),
        profile_image_url: imageDataUrl,
        updated_at: new Date(),
      }
    });

   

    return NextResponse.json({ 
      imageUrl: imageDataUrl,
      message: 'Image uploaded and saved to database successfully',
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image to database' },
      { status: 500 }
    );
  }
}