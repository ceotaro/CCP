import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // システム全体の統計を取得
    const [
      totalUsers,
      totalTransactions,
      totalCirculation,
      todayTransactions,
      weeklyTransactions,
      usersByRole,
      recentTransactions,
      topUsers,
    ] = await Promise.all([
      // 総ユーザー数
      prisma.user.count(),
      
      // 総取引数
      prisma.transaction.count(),
      
      // 総発行量（全ユーザーの残高合計）
      prisma.user.aggregate({
        _sum: {
          balance: true,
        },
      }),
      
      // 今日の取引数
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      
      // 過去7日間の取引数
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // ロール別ユーザー数
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      }),
      
      // 最近の取引
      prisma.transaction.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      
      // 残高上位ユーザー
      prisma.user.findMany({
        take: 10,
        orderBy: {
          balance: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          balance: true,
        },
      }),
    ]);

    // 日別取引データ（過去7日間）
    const dailyTransactions = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        const count = await prisma.transaction.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });
        
        return {
          date: startOfDay.toISOString().split('T')[0],
          transactions: count,
        };
      })
    );

    return NextResponse.json({
      overview: {
        totalUsers,
        totalTransactions,
        totalCirculation: totalCirculation._sum.balance || 0,
        todayTransactions,
        weeklyTransactions,
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>),
      dailyTransactions: dailyTransactions.reverse(),
      recentTransactions,
      topUsers,
    });
  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}