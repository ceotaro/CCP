import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  balance: z.number().int().min(0).optional(),
  name: z.string().min(1).optional(),
});

// ユーザー情報更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const body = await req.json();
    const updateData = updateUserSchema.parse(body);

    // ユーザーが存在するかチェック
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 自分自身の管理者権限を削除することを防ぐ
    if (userId === session.user.id && updateData.role && updateData.role !== UserRole.admin) {
      return NextResponse.json(
        { error: '自分自身の管理者権限は削除できません' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ユーザー詳細取得
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentTransactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            receiver: {
              select: { name: true, email: true },
            },
          },
        },
        receivedTransactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            sentTransactions: true,
            receivedTransactions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totalSentTransactions: user._count.sentTransactions,
        totalReceivedTransactions: user._count.receivedTransactions,
        recentSentTransactions: user.sentTransactions,
        recentReceivedTransactions: user.receivedTransactions,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}