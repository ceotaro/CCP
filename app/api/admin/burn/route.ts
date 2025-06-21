import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, TransactionType } from '@prisma/client';
import { z } from 'zod';

const burnSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  amount: z.number().int().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, amount, reason } = burnSchema.parse(body);

    // ユーザーの存在と残高確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. User has ${user.balance} CC, but ${amount} CC burn requested` },
        { status: 400 }
      );
    }

    // トランザクション内でburnを実行
    const result = await prisma.$transaction(async (tx) => {
      // ユーザーの残高を減らす
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      });

      // burn取引記録を作成
      const transaction = await tx.transaction.create({
        data: {
          senderId: userId,
          receiverId: session.user.id, // 管理者をreceiverとして記録
          amount,
          type: TransactionType.burn,
          // 理由をblockchainTxHashフィールドに一時的に保存（将来的には専用フィールドを追加）
          blockchainTxHash: reason ? `BURN_REASON: ${reason}` : 'ADMIN_BURN',
        },
      });

      return { updatedUser, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully burned ${amount} CC from user ${user.name}`,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        createdAt: result.transaction.createdAt,
        reason,
      },
      userBalance: result.updatedUser.balance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Burn tokens error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}