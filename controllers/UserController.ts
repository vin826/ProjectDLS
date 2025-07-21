import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export class UserController {
  static async getUsers() {
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

  static async createUser(request: NextRequest) {
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

  static async updateUser(request: NextRequest, user_id: string) {
    try {
      const body = await request.json();
      const { name, email, role, phone_number } = body;

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

      const updatedUser = await prisma.user.update({
        where: { user_id },
        data: {
          name,
          email,
          role,
          phone_number: phone_number ? BigInt(phone_number) : null,
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

  static async deleteUser(user_id: string) {
    try {
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

      await prisma.user.delete({
        where: { user_id }
      });

      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  }

  static async authenticateUser(request: NextRequest) {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: {
          email: email.toLowerCase()
        },
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          password_hash: true,
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Return user data without password
      const { password_hash, ...userWithoutPassword } = user;
      
      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}