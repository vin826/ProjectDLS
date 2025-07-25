import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Users } from 'lucide-react';

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
          profile: {
            select: {
              profile_image_url: true,
              bio: true,
              display_name: true,
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Convert BigInt to string for JSON serialization
      const serializedUsers = users.map(user => ({
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null,
      profile: user.profile ? {
       profile_image_url: user.profile.profile_image_url,
        bio: user.profile.bio,
        display_name: user.profile.display_name ? user.profile.display_name.toString() : null
      } : null,
      profile_image_url: user.profile?.profile_image_url || null,
      bio: user.profile?.bio || null,
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

  static async getUserById(user_id: string) {
  try {
    const user = await prisma.user.findUnique({
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
            display_name: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const serializedUser = {
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null,
      phone: user.phone_number ? user.phone_number.toString() : null,
      profile_image: user.profile?.profile_image_url || null,
      bio: user.profile?.bio || null,
      profile: user.profile ? {
        ...user.profile,
        display_name: user.profile.display_name ? user.profile.display_name.toString() : null,
      } : null,
    };

    return NextResponse.json(serializedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

  static async createUser(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, email, role, phone_number, password, profile_image_url, bio } = body;

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
          // Create profile if image or bio provided
          ...(profile_image_url || bio ? {
            profile: {
              create: {
                display_name: BigInt(Date.now()), // Using timestamp as display_name
                profile_image_url: profile_image_url || null,
                bio: bio || null,
                updated_at: new Date(),
              }
            }
          } : {})
        },
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
              display_name: true,
          
            }
          }
        }
      });

      // Convert BigInt to string for JSON serialization
      const serializedUser = {
      ...user,
      phone_number: user.phone_number ? user.phone_number.toString() : null,
      profile: user.profile ? {
        ...user.profile,
        display_name: user.profile.display_name ? user.profile.display_name.toString() : null
      } : null,
      profile_image_url: user.profile?.profile_image_url || null,
      bio: user.profile?.bio || null,
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
      const { name, email, role, phone_number, profile_image_url,bio } = body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { user_id },
        include: { profile: true }
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
           profile: {
            select: {
              profile_image_url: true,
              bio: true,
              display_name: true,
            }
          }
        }
      });

      // Handle profile update/creation
      if (profile_image_url !== undefined || bio !== undefined) {
        if (existingUser.profile) {
          // Update existing profile
          await prisma.user_Profile.update({
            where: { user_id },
            data: {
              ...(profile_image_url !== undefined && { profile_image_url: profile_image_url }),
              ...(bio !== undefined && { bio }),
              updated_at: new Date(),
            }
          });
        } else {
          // Create new profile
          await prisma.user_Profile.create({
            data: {
              user_id,
              display_name: BigInt(Date.now()),
              profile_image_url: profile_image_url || null,
              bio: bio || null,
              updated_at: new Date(),
            }
          });
        }
      }

      // Fetch updated user with profile
      const finalUser = await prisma.user.findUnique({
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
              display_name: true,
            }
          }
        }
      });

      // Convert BigInt to string for JSON serialization
      const serializedUser = {
        ...finalUser,
        phone_number: updatedUser.phone_number ? updatedUser.phone_number.toString() : null,
        profile_image_url: finalUser?.profile?.profile_image_url || null,
        bio: finalUser?.profile?.bio || null,
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
          phone_number: true,
          profile: {
            select: {
              profile_image_url: true,
              bio: true,
            }
          }
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
      

      const serializedUser = {
        ...userWithoutPassword,
        phone_number: user.phone_number ? user.phone_number.toString() : null,
        phone: user.phone_number ? user.phone_number.toString() : null, // Add this line
        profile_image: user.profile?.profile_image_url || null,
        profile_image_url: user.profile?.profile_image_url || null, // Add this line
        bio: user.profile?.bio || null,
      };

      return NextResponse.json({
        message: 'Login successful',
        user: serializedUser
      });

    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  static async updateProfile(request: NextRequest, user_id: string) {
    try {
      const body = await request.json();
      const { profile_image, bio, phone_number, name, email } = body;

     const updatedUser = await prisma.user.update({
      where: { user_id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone_number !== undefined && { 
          phone_number: phone_number ? BigInt(phone_number) : null 
        }),
      },
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
            display_name: true,
          }
        }
      }
    });

    // Handle profile update/creation
    if (profile_image !== undefined || bio !== undefined) {
      await prisma.user_Profile.upsert({
        where: { user_id },
        update: {
          ...(profile_image !== undefined && { profile_image_url: profile_image }),
          ...(bio !== undefined && { bio }),
          updated_at: new Date(),
        },
        create: {
          user_id,
          display_name: BigInt(Date.now()),
          profile_image_url: profile_image|| null,
          bio: bio || null,
          updated_at: new Date(),
        }
      });
    }

    const finalUser = await prisma.user.findUnique({
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
            display_name: true,
          }
        }
      }
    });

    const serializedUser = {
     ...finalUser,
      phone_number: finalUser?.phone_number ? finalUser.phone_number.toString() : null,
      phone: finalUser?.phone_number ? finalUser.phone_number.toString() : null, 
      profile_image: finalUser?.profile?.profile_image_url || null, 
      bio: finalUser?.profile?.bio || null,
      profile: finalUser?.profile ? {
        ...finalUser.profile,
        display_name: finalUser.profile.display_name ? finalUser.profile.display_name.toString() : null,
  } : null, };

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: serializedUser 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
}