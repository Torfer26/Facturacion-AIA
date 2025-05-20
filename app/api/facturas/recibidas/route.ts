import { NextResponse } from 'next/server'

export async function GET() {
  // Create a redirect to the main facturas endpoint
  const url = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const redirectUrl = new URL('/api/facturas', url.origin);
  
  return NextResponse.redirect(redirectUrl.toString(), { status: 307 });
} 