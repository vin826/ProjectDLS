import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET all users
export async function GET() {
  try {
    console.log('Attempting to fetch users...');
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone_number: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null
    }));

    return NextResponse.json(serializedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, phone_number, password } = body;

    // Hash the password
    const password_hash = await bcrypt.hash(password || 'defaultpassword123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: role || 'USER',
        phone_number: phone_number ? BigInt(phone_number) : null,
        created_at: new Date(),
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

    // Convert BigInt to string for JSON serialization
    const serializedUser = {
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null
    };

    return NextResponse.json(serializedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name, email, role, phone_number, password } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { user_id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (phone_number !== undefined) {
      updateData.phone_number = phone_number ? BigInt(phone_number) : null;
    }
    
    // Only hash password if it's provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { user_id },
      data: updateData,
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone_number: true,
        created_at: true,
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedUser = {
      ...updatedUser,
      phone_number: updatedUser.phone_number ? updatedUser.phone_number.toString() : null
    };

    return NextResponse.json(serializedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}