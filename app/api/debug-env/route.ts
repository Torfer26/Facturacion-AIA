import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || 'NOT_SET',
    N8N_API_KEY: process.env.N8N_API_KEY ? 'SET (length: ' + process.env.N8N_API_KEY.length + ')' : 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  };

  return NextResponse.json({
    message: 'Environment Variables Debug',
    variables: envVars,
    timestamp: new Date().toISOString()
  });
} 