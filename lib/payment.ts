import { prisma } from '@/lib/db';
import { TransactionType, UserRole } from '@prisma/client';

// Schema for validation - keeping for future use
// const transferSchema = z.object({
//   senderId: z.string().uuid(),
//   receiverId: z.string().uuid(),
//   amount: z.number().int().positive(),
// });

// const mintSchema = z.object({
//   adminId: z.string().uuid(),
//   userId: z.string().uuid(),
//   amount: z.number().int().positive(),
// });

export async function processPayment({
  senderId,
  receiverId,
  amount,
}: {
  senderId: string;
  receiverId: string;
  amount: number;
}) {
  const mode = process.env.CIVICCOIN_MODE;

  if (mode === 'DB') {
    return await processDbTransfer(senderId, receiverId, amount);
  } else if (mode === 'BLOCKCHAIN') {
    return await processBlockchainTransfer(senderId, receiverId, amount);
  } else {
    throw new Error('Invalid CIVICCOIN_MODE');
  }
}

async function processDbTransfer(senderId: string, receiverId: string, amount: number) {
  return await prisma.$transaction(async (tx) => {
    // Check sender balance
    const sender = await tx.user.findUnique({
      where: { id: senderId },
    });

    if (!sender || sender.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Update balances
    await tx.user.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    });

    await tx.user.update({
      where: { id: receiverId },
      data: { balance: { increment: amount } },
    });

    // Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        senderId,
        receiverId,
        amount,
        type: TransactionType.transfer,
      },
    });

    return transaction;
  });
}

async function processBlockchainTransfer(_senderId: string, _receiverId: string, _amount: number) {
  // Placeholder for blockchain implementation
  // This would interact with smart contracts using ethers.js
  throw new Error('Blockchain mode not yet implemented');
}

export async function mintTokens({
  adminId,
  userId,
  amount,
}: {
  adminId: string;
  userId: string;
  amount: number;
}) {
  // Verify admin role
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (!admin || admin.role !== UserRole.admin) {
    throw new Error('Unauthorized: Only admins can mint tokens');
  }

  const mode = process.env.CIVICCOIN_MODE;

  if (mode === 'DB') {
    return await prisma.$transaction(async (tx) => {
      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          senderId: adminId,
          receiverId: userId,
          amount,
          type: TransactionType.issue,
        },
      });

      return transaction;
    });
  } else if (mode === 'BLOCKCHAIN') {
    // Placeholder for blockchain minting
    throw new Error('Blockchain minting not yet implemented');
  } else {
    throw new Error('Invalid CIVICCOIN_MODE');
  }
}