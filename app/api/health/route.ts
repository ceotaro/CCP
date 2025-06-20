import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mode: process.env.CIVICCOIN_MODE || 'DB',
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
      database_url: process.env.DATABASE_URL ? 'configured' : 'missing',
      nextauth_url: process.env.NEXTAUTH_URL || 'not set',
      database_connected: true,
      user_count: userCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        database_connected: false,
      },
      { status: 500 }
    );
  }
}