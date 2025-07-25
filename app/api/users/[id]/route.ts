import { NextRequest } from 'next/server';
import { UserController } from '@/controllers/UserController';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  return UserController.getUserById(id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } =  await params;
  return UserController.updateUser(request,id);
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } =  await params;
  return UserController.deleteUser(id);
}