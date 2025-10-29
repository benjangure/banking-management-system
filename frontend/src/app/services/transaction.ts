import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { Transaction, DailyLimit, TransactionSummary } from '../models/types';
import { AccountService } from './account';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSignal = signal<Transaction[]>([]);
  private dailyLimitSignal = signal<DailyLimit>({
    withdrawalLimit: 500000,
    withdrawalUsed: 0,
    transferLimit: 1000000,
    transferUsed: 0,
    lastResetDate: new Date()
  });
  private isBrowser: boolean;

  // ✅ FIX: Add the missing refreshDashboard$ observable
  refreshDashboard$ = new Subject<void>();

  transactions = this.transactionsSignal.asReadonly();
  dailyLimit = this.dailyLimitSignal.asReadonly();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private accountService: AccountService,
    private apiService: ApiService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.checkAndResetDailyLimit();
    }
  }

  // ✅ FIX: Always load from API, remove localStorage fallback for transactions
  loadTransactions(accountId: string): void {
    if (!this.isBrowser) return;

    console.log('🔄 Loading transactions from API for account:', accountId);
    
    this.apiService.getAccountTransactions(accountId).subscribe({
      next: (transactions) => {
        console.log('✅ Transactions loaded from API:', transactions);
        const parsedTransactions = transactions.map(txn => ({
          ...txn,
          date: new Date(txn.date)
        }));
        this.transactionsSignal.set(parsedTransactions);
      },
      error: (error) => {
        console.error('❌ Failed to load transactions:', error);
        // Set empty array on error instead of loading from localStorage
        this.transactionsSignal.set([]);
      }
    });
  }

  private loadDailyLimit(): void {
    if (!this.isBrowser) return;
    
    const limit = localStorage.getItem('dailyLimit');
    if (limit) {
      const parsedLimit = JSON.parse(limit);
      parsedLimit.lastResetDate = new Date(parsedLimit.lastResetDate);
      this.dailyLimitSignal.set(parsedLimit);
    } else {
      this.saveDailyLimit();
    }
  }

  private saveDailyLimit(): void {
    if (!this.isBrowser) return;
    localStorage.setItem('dailyLimit', JSON.stringify(this.dailyLimitSignal()));
  }

  private checkAndResetDailyLimit(): void {
    const limit = this.dailyLimitSignal();
    const today = new Date();
    const lastReset = limit.lastResetDate ? new Date(limit.lastResetDate) : today;

    if (today.toDateString() !== lastReset.toDateString()) {
      this.dailyLimitSignal.set({
        withdrawalLimit: 500000,
        withdrawalUsed: 0,
        transferLimit: 1000000,
        transferUsed: 0,
        lastResetDate: today
      });
      this.saveDailyLimit();
    }
  }

  deposit(accountId: string, amount: number, description: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log('💰 Deposit request:', { accountId, amount, description });
      
      this.apiService.deposit(accountId, amount, description).subscribe({
        next: (transaction) => {
          console.log('✅ Deposit successful:', transaction);
          
          // ✅ FIX: Trigger dashboard refresh after successful transaction
          this.refreshDashboard$.next();
          
          resolve(true);
        },
        error: (error) => {
          console.error('❌ Deposit failed:', error);
          resolve(false);
        }
      });
    });
  }

  withdraw(accountId: string, amount: number, description: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      console.log('💸 Withdrawal request:', { accountId, amount, description });
      
      const account = this.accountService.getAccountById(accountId);
      if (!account) {
        resolve({ success: false, message: 'Account not found' });
        return;
      }

      if (account.balance < amount) {
        resolve({ success: false, message: 'Insufficient balance' });
        return;
      }

      const limit = this.dailyLimitSignal();
      if (limit.withdrawalUsed + amount > limit.withdrawalLimit) {
        resolve({
          success: false,
          message: `Daily withdrawal limit exceeded. Remaining: KSh ${(limit.withdrawalLimit - limit.withdrawalUsed).toFixed(2)}`
        });
        return;
      }

      this.apiService.withdraw(accountId, amount, description).subscribe({
        next: (transaction) => {
          console.log('✅ Withdrawal successful:', transaction);

          // Update daily limit
          this.dailyLimitSignal.update(l => ({
            ...l,
            withdrawalUsed: l.withdrawalUsed + amount
          }));
          this.saveDailyLimit();

          // ✅ FIX: Trigger dashboard refresh after successful transaction
          this.refreshDashboard$.next();

          resolve({ success: true, message: 'Withdrawal successful' });
        },
        error: (error) => {
          console.error('❌ Withdrawal failed:', error);
          resolve({ success: false, message: error.error?.message || 'Withdrawal failed' });
        }
      });
    });
  }

  transfer(
    fromAccountId: string,
    toAccountNumber: string,
    amount: number,
    description: string
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      console.log('🔄 Transfer request:', { fromAccountId, toAccountNumber, amount, description });
      
      const fromAccount = this.accountService.getAccountById(fromAccountId);
      
      if (!fromAccount) {
        resolve({ success: false, message: 'Source account not found' });
        return;
      }
      
      if (fromAccount.balance < amount) {
        resolve({ success: false, message: 'Insufficient balance' });
        return;
      }

      const limit = this.dailyLimitSignal();
      if (limit.transferUsed + amount > limit.transferLimit) {
        resolve({
          success: false,
          message: `Daily transfer limit exceeded. Remaining: KSh ${(limit.transferLimit - limit.transferUsed).toFixed(2)}`
        });
        return;
      }

      this.apiService.transfer(fromAccountId, toAccountNumber, amount, description).subscribe({
        next: (transaction) => {
          console.log('✅ Transfer successful:', transaction);

          // Update daily limit
          this.dailyLimitSignal.update(l => ({
            ...l,
            transferUsed: l.transferUsed + amount
          }));
          this.saveDailyLimit();

          // ✅ FIX: Trigger dashboard refresh after successful transaction
          this.refreshDashboard$.next();

          resolve({ success: true, message: 'Transfer successful' });
        },
        error: (error) => {
          console.error('❌ Transfer failed:', error);
          resolve({ success: false, message: error.error?.message || 'Transfer failed' });
        }
      });
    });
  }

  // ✅ FIX: Load transactions from API for the account
  getAccountTransactions(accountId: string): Transaction[] {
    // Trigger reload from API
    this.loadTransactions(accountId);
    return this.transactionsSignal().filter(txn => 
      txn.fromAccountId === accountId || txn.toAccountId === accountId
    );
  }

  getRecentTransactions(accountId: string, limit: number = 10): Transaction[] {
    const transactions = this.transactionsSignal().filter(txn => 
      txn.fromAccountId === accountId || txn.toAccountId === accountId
    );
    return transactions.slice(0, limit);
  }

  // ✅ FIX: Always fetch from API
  getMonthlySummary(accountId: string, month: number, year: number): Promise<TransactionSummary> {
    return new Promise((resolve, reject) => {
      console.log('📊 Fetching monthly summary from API:', { accountId, month, year });
      
      this.apiService.getMonthlySummary(accountId, month, year).subscribe({
        next: (summary) => {
          console.log('✅ Monthly summary from API:', summary);
          resolve(summary);
        },
        error: (error) => {
          console.error('❌ Failed to get monthly summary from API:', error);
          
          // Return zero summary on error
          resolve({
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalTransfers: 0,
            transactionCount: 0,
            month,
            year,
            depositChange: 0,
            withdrawalChange: 0,
            transferChange: 0,
            transactionChange: 0
          });
        }
      });
    });
  }

  getRemainingWithdrawalLimit(): number {
    const limit = this.dailyLimitSignal();
    return limit.withdrawalLimit - limit.withdrawalUsed;
  }

  getRemainingTransferLimit(): number {
    const limit = this.dailyLimitSignal();
    return limit.transferLimit - limit.transferUsed;
  }

  loadDailyLimits(accountId: string): void {
    if (!this.isBrowser) return;

    console.log('🔄 Loading daily limits from API for account:', accountId);
    
    this.apiService.getDailyLimits(accountId).subscribe({
      next: (limits) => {
        console.log('✅ Daily limits loaded from API:', limits);
        this.dailyLimitSignal.set(limits);
        this.saveDailyLimit();
      },
      error: (error) => {
        console.error('❌ Failed to load daily limits:', error);
        // Keep current limits on error
      }
    });
  }
}