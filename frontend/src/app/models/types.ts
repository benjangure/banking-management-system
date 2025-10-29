// ===== types.ts - COMPLETE FIXED VERSION =====
// Location: src/app/models/types.ts

export interface User {
  id: string | number;
  username: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  createdDate?: Date | string;
}

export interface Account {
  id: string | number;
  accountNumber: string;
  accountType: string;
  balance: number;
  userId: string | number;
  interestRate: number;
  status: string;
  createdDate: Date | string;
}

export interface Transaction {
  id: string | number;
  transactionId?: string;
  transactionType: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  fromAccountId: string | number;
  fromAccountNumber?: string;
  toAccountId?: string | number;
  toAccountNumber?: string;
  description: string;
  date: Date | string;
  timestamp?: Date | string;
  balanceAfter?: number;
  status?: string;
  recipientName?: string;
}

export interface Beneficiary {
  id: string | number;
  userId: string | number;
  accountNumber: string;
  beneficiaryAccountNumber?: string;
  nickname: string;
  accountName: string;
  bankName: string;
  createdDate?: Date | string;
}

export interface DailyLimit {
  withdrawalLimit: number;
  withdrawalUsed: number;
  transferLimit: number;
  transferUsed: number;
  lastResetDate?: Date | string;
}

export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
  transactionCount: number;
  month: number;
  year: number;
  depositChange: number;
  withdrawalChange: number;
  transferChange: number;
  transactionChange: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}