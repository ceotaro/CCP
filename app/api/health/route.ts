import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mode: process.env.CIVICCOIN_MODE || 'DB',
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
      database_url: process.env.DATABASE_URL ? 'configured' : 'missing',
      nextauth_url: process.env.NEXTAUTH_URL || 'not set',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}