import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  _ctx: unknown
) {
  try {
    const body = await request.json();
    const userId = body.user_id as string;
    
  console.log('Updating profile for user:', userId);
    console.log('Update data:', body);

    // Update the user's profile information
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        name: body.name,
        email: body.email,
        phone_number: body.phone_number ? BigInt(body.phone_number) : null,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone_number: true,
        created_at: true,
      }
    });

    // Handle profile image and bio in User_Profile table
    if (body.profile_image_url || body.bio) {
      await prisma.user_Profile.upsert({
        where: { user_id: userId },
        update: {
          bio: body.bio,
          profile_image_url: body.profile_image_url,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          display_name: BigInt(0), // You might want to handle this differently
          bio: body.bio,
          profile_image_url: body.profile_image_url,
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        phone_number: updatedUser.phone_number ? updatedUser.phone_number.toString() : null,
        profile_image: body.profile_image_url,
        bio: body.bio,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}