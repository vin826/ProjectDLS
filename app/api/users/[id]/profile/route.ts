import { UserController } from '@/controllers/UserController';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } =  await params;
  return UserController.updateProfile(request, id);
}