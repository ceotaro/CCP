// Type-safe constants for roles and transaction types
export const USER_ROLES = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  USER: 'user',
} as const;

export const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
  ISSUE: 'issue', 
  BURN: 'burn',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

// Database provider check
export const isPostgreSQL = () => process.env.DATABASE_PROVIDER === 'postgresql';
export const isSQLite = () => process.env.DATABASE_PROVIDER === 'sqlite';