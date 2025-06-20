import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'), // Frontend validation only
  role: z.enum(['user', 'merchant'], { invalid_type_error: '有効なロールを選択してください' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role } = registerSchema.parse(body);

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Registration attempt:', { name, email, role });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }

    // Create new user
    const finalRole: UserRole = email.includes('admin') ? UserRole.admin : (role as UserRole);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: finalRole,
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('User created successfully:', user.id);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    return NextResponse.json(
      { 
        error: 'アカウント作成中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}