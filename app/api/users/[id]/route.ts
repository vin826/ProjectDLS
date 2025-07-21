import { NextRequest } from 'next/server';
import { UserController } from '@/controllers/UserController';


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return UserController.updateUser(request, params.id);
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return UserController.deleteUser(params.id);
}