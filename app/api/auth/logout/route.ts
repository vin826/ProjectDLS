import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Handle logout logic (clear sessions, tokens, etc.)
  return NextResponse.json({ message: 'Logged out successfully' });
}