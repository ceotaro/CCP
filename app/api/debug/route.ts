import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      nodeEnv: process.env.NODE_ENV,
      nextauthUrl: process.env.NEXTAUTH_URL,
      nextauthSecret: process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 4)}...` : 'missing',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      civicCoinMode: process.env.CIVICCOIN_MODE,
      vercelUrl: process.env.VERCEL_URL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}