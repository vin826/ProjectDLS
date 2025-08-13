import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

type Role = 'ADMIN' | 'USER';

type UserWithProfile = {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  phone_number: bigint | null;
  created_at: Date;
  profile?: {
    profile_image_url: string | null;
    bio: string | null;
    display_name: bigint | null;
  } | null;
};

type SerializedUser = {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  phone_number: string | null;
  profile_image_url: string | null;
  bio: string | null;
  display_name: string | null;
};

function serializeUser(u: UserWithProfile): SerializedUser {
  return {
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at.toISOString(),
    phone_number: u.phone_number ? u.phone_number.toString() : null,
    profile_image_url: u.profile?.profile_image_url ?? null,
    bio: u.profile?.bio ?? null,
    display_name: u.profile?.display_name ? u.profile.display_name.toString() : null,
  };
}

export class UserController {
  static async getUsers() {
    try {
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
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      const serialized = users.map(serializeUser);
      return NextResponse.json(serialized);
    } catch (error: unknown) {
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
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(serializeUser(user));
    } catch (error: unknown) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  }

  static async createUser(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, email, role, phone_number, password, profile_image_url, bio } = body as {
        name: string;
        email: string;
        role?: Role;
        phone_number?: string | null;
        password: string;
        profile_image_url?: string | null;
        bio?: string | null;
      };

      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password_hash,
          role: role || 'USER',
          phone_number: phone_number ? BigInt(phone_number) : null,
          created_at: new Date(),
          ...(profile_image_url || bio
            ? {
                profile: {
                  create: {
                    display_name: BigInt(Date.now()),
                    profile_image_url: profile_image_url || null,
                    bio: bio || null,
                    updated_at: new Date(),
                  },
                },
              }
            : {}),
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
            },
          },
        },
      });

      return NextResponse.json(
        { message: 'User created successfully', user: serializeUser(user) },
        { status: 201 },
      );
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create user. Please try again.' }, { status: 500 });
    }
  }

  static async updateUser(request: NextRequest, user_id: string) {
    try {
      const body = await request.json();
      const { name, email, role, phone_number, profile_image_url, bio } = body as {
        name?: string;
        email?: string;
        role?: Role;
        phone_number?: string | null;
        profile_image_url?: string | null;
        bio?: string | null;
      };

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

      await prisma.user.update({
        where: { user_id },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(role !== undefined && { role }),
          ...(phone_number !== undefined && {
            phone_number: phone_number ? BigInt(phone_number) : null,
          }),
        },
        select: { user_id: true },
      });

      // Handle profile update/creation
      if (profile_image_url !== undefined || bio !== undefined) {
        await prisma.user_Profile.upsert({
          where: { user_id },
          update: {
            ...(profile_image_url !== undefined && { profile_image_url }),
            ...(bio !== undefined && { bio }),
            updated_at: new Date(),
          },
          create: {
            user_id,
            display_name: BigInt(Date.now()),
            profile_image_url: profile_image_url || null,
            bio: bio || null,
            updated_at: new Date(),
          },
        });
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

      if (!finalUser) {
        return NextResponse.json({ error: 'User not found after update' }, { status: 404 });
      }

      return NextResponse.json(serializeUser(finalUser as UserWithProfile));
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  }

  static async authenticateUser(request: NextRequest) {
    try {
      const { email, password } = (await request.json()) as { email: string; password: string };

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
      // remove password
      const { password_hash, ...userSansPassword } = user;
      const serialized = serializeUser(userSansPassword as unknown as UserWithProfile);

      return NextResponse.json({ message: 'Login successful', user: serialized });
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  static async updateProfile(request: NextRequest, user_id: string) {
    try {
      const body = (await request.json()) as {
        profile_image?: string | null;
        profile_image_url?: string | null;
        bio?: string | null;
        phone_number?: string | null;
        name?: string;
        email?: string;
      };

      await prisma.user.update({
        where: { user_id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.email && { email: body.email }),
          ...(body.phone_number !== undefined && {
            phone_number: body.phone_number ? BigInt(body.phone_number) : null,
          }),
        },
        select: { user_id: true },
      });

      const profileImg = body.profile_image_url ?? body.profile_image;
      if (profileImg !== undefined || body.bio !== undefined) {
        await prisma.user_Profile.upsert({
          where: { user_id },
          update: {
            ...(profileImg !== undefined && { profile_image_url: profileImg }),
            ...(body.bio !== undefined && { bio: body.bio }),
            updated_at: new Date(),
          },
          create: {
            user_id,
            display_name: BigInt(Date.now()),
            profile_image_url: profileImg || null,
            bio: body.bio || null,
            updated_at: new Date(),
          },
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
            },
          },
        },
      });

      if (!finalUser) {
        return NextResponse.json({ error: 'User not found after profile update' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Profile updated successfully', user: serializeUser(finalUser as UserWithProfile) });
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
  }
}