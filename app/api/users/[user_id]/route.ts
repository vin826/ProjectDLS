import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controllers/UserController';

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  return UserController.getUserById(params.user_id);
}