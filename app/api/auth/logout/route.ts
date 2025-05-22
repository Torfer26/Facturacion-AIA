import { NextResponse } from 'next/server';

export async function POST() {
  // Since we're using localStorage for tokens in the client,
  // the server doesn't need to do anything except acknowledge the logout
  return NextResponse.json({ success: true });
} 