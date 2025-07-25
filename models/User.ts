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

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone_number?: string;
  profile_image?: string;
  bio?: string;
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
        profile: {
          select: {
            profile_image_url: true,
            bio: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Convert BigInt to string for JSON serialization
    return users.map(user => ({
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null,
      profile_image: user.profile?.profile_image_url || null,
      bio: user.profile?.bio || null,
    }));
  }

  static async findById(user_id: string) {
    const user =  await prisma.user.findUnique({
      where: { user_id },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone_number: true,
        created_at: true,
        profile: {
          select: {
            profile_image_url: true,
            bio: true,
          }
        } 
      }
    });


    if (!user) return null;

    return {
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null,
      profile_image: user.profile?.profile_image_url || null,
      bio: user.profile?.bio || null,
    };
  
    
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

  static async updateProfile(user_id: string, profileData: UpdateProfileData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { user_id },
      include: { profile: true }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update user basic info if provided
    if (profileData.name || profileData.email || profileData.phone_number !== undefined) {
      await prisma.user.update({
        where: { user_id },
        data: {
          ...(profileData.name && { name: profileData.name }),
          ...(profileData.email && { email: profileData.email }),
          ...(profileData.phone_number !== undefined && { 
            phone_number: profileData.phone_number ? BigInt(profileData.phone_number) : null 
          }),
        }
      });
    }

    // Handle profile update/creation
    if (profileData.profile_image !== undefined || profileData.bio !== undefined) {
      if (existingUser.profile) {
        // Update existing profile
        await prisma.user_Profile.update({
          where: { user_id },
          data: {
            ...(profileData.profile_image !== undefined && { profile_image_url: profileData.profile_image }),
            ...(profileData.bio !== undefined && { bio: profileData.bio }),
            updated_at: new Date(),
          }
        });
      } else {
        // Create new profile
        await prisma.user_Profile.create({
          data: {
            user_id,
            display_name: BigInt(Date.now()),
            profile_image_url: profileData.profile_image || null,
            bio: profileData.bio || null,
            updated_at: new Date(),
          }
        });
      }
    }

    // Return updated user with profile
    return await this.findById(user_id);
  }

  static async authenticate(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        password_hash: true,
        phone_number: true,
        profile: {
          select: {
            profile_image_url: true,
            bio: true,
          }
        }
      }
    });

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) return null;

    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      phone_number: user.phone_number ? user.phone_number.toString() : null,
      profile_image: user.profile?.profile_image_url || null,
      bio: user.profile?.bio || null,
    };
  }

  static async delete(user_id: string) {
    return await prisma.user.delete({
      where: { user_id }
    });
  }
}