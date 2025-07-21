import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  name: string;
  email: string;
  role?: 'ADMIN' | 'USER';
  phone_number?: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
  phone_number?: string;
  password?: string;
}

export class UserModel {
  static async findAll() {
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
    return users.map(user => ({
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null
    }));
  }

  static async findById(user_id: string) {
    return await prisma.user.findUnique({
      where: { user_id },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone_number: true,
        created_at: true,
      }
    });
  }

  static async create(userData: CreateUserData) {
    const password_hash = await bcrypt.hash(userData.password || 'defaultpassword123', 10);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password_hash,
        role: userData.role || 'USER',
        phone_number: userData.phone_number ? BigInt(userData.phone_number) : null,
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

    return {
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null
    };
  }

  static async update(user_id: string, userData: UpdateUserData) {
    const updateData: any = {};
    
    if (userData.name) updateData.name = userData.name;
    if (userData.email) updateData.email = userData.email;
    if (userData.role) updateData.role = userData.role;
    if (userData.phone_number !== undefined) {
      updateData.phone_number = userData.phone_number ? BigInt(userData.phone_number) : null;
    }
    
    if (userData.password) {
      updateData.password_hash = await bcrypt.hash(userData.password, 10);
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

    return {
      ...updatedUser,
      phone_number: updatedUser.phone_number ? updatedUser.phone_number.toString() : null
    };
  }

  static async delete(user_id: string) {
    return await prisma.user.delete({
      where: { user_id }
    });
  }
}