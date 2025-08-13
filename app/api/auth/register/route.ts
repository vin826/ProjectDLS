import { NextRequest } from 'next/server';
import { UserController } from '@/controllers/UserController';

export async function POST(request: NextRequest) {
  return UserController.createUser(request);
}