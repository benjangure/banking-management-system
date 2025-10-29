// ===== account.ts - FIXED VERSION =====
import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Account } from '../models/types';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  accountsSignal = signal<Account[]>([]);
  private selectedAccountSignal = signal<Account | null>(null);
  private isBrowser: boolean;

  accounts = this.accountsSignal.asReadonly();
  selectedAccount = this.selectedAccountSignal.asReadonly();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private apiService: ApiService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ✅ FIXED: Normalize ID to string for consistent comparison
  private normalizeId(id: string | number | undefined): string {
    if (id === undefined || id === null) return '';
    return String(id);
  }

  loadAccounts(userId?: string | number): void {
    if (!this.isBrowser) return;

    // Clear existing accounts first
    this.accountsSignal.set([]);
    this.selectedAccountSignal.set(null);

    const userIdStr = this.normalizeId(userId);
    
    if (userIdStr) {
      console.log('Loading accounts from API for user:', userIdStr);
      this.apiService.getUserAccounts(userIdStr).subscribe({
        next: (accounts) => {
          console.log('Raw accounts from API:', accounts);
          
          // ✅ FIXED: Normalize all IDs to strings and parse dates
          const parsedAccounts = accounts.map(acc => ({
            ...acc,
            id: this.normalizeId(acc.id),
            userId: this.normalizeId(acc.userId || userId),
            createdDate: typeof acc.createdDate === 'string' ? new Date(acc.createdDate) : acc.createdDate
          }));
          
          console.log('Parsed accounts with normalized IDs:', parsedAccounts);
          this.accountsSignal.set(parsedAccounts);
          
          // Save to localStorage
          if (this.isBrowser) {
            localStorage.setItem('accounts', JSON.stringify(parsedAccounts));
          }
        },
        error: (error) => {
          console.error('Failed to load accounts from API:', error);
          // Fallback to localStorage only for existing users
          if (error.status !== 404) {
            this.fallbackToLocalStorage();
          }
        }
      });
    }
  }

  private fallbackToLocalStorage(): void {
    if (!this.isBrowser) return;
    
    const accounts = localStorage.getItem('accounts');
    if (accounts) {
      try {
        const parsedAccounts = JSON.parse(accounts).map((acc: any) => ({
          ...acc,
          id: this.normalizeId(acc.id),
          userId: this.normalizeId(acc.userId),
          createdDate: new Date(acc.createdDate)
        }));
        this.accountsSignal.set(parsedAccounts);
        console.log('Accounts loaded from localStorage:', parsedAccounts);
      } catch (error) {
        console.error('Error parsing accounts from localStorage:', error);
      }
    } else {
      console.log('No accounts found in localStorage');
    }
  }

  getUserAccounts(userId: string | number): Account[] {
    const userIdStr = this.normalizeId(userId);
    const allAccounts = this.accountsSignal();
    
    const filtered = allAccounts.filter(acc => this.normalizeId(acc.userId) === userIdStr);
    
    console.log('getUserAccounts called with userId:', userIdStr);
    console.log('All accounts:', allAccounts);
    console.log('Filtered accounts:', filtered);
    
    return filtered;
  }

  getAccountById(accountId: string | number): Account | undefined {
    const accountIdStr = this.normalizeId(accountId);
    return this.accountsSignal().find(acc => this.normalizeId(acc.id) === accountIdStr);
  }

  getAccountByNumber(accountNumber: string): Account | undefined {
    return this.accountsSignal().find(acc => acc.accountNumber === accountNumber);
  }

  selectAccount(account: Account): void {
    this.selectedAccountSignal.set(account);
    if (this.isBrowser) {
      localStorage.setItem('selectedAccount', JSON.stringify(account));
    }
  }

  createAccount(accountType: 'Savings' | 'Checking' | 'Fixed Deposit', userId: string | number): Promise<Account> {
    const userIdStr = this.normalizeId(userId);
    
    return new Promise((resolve, reject) => {
      this.apiService.createAccount({ accountType, userId: userIdStr }).subscribe({
        next: (account) => {
          const normalizedAccount = {
            ...account,
            id: this.normalizeId(account.id),
            userId: this.normalizeId(account.userId || userId)
          };
          
          const accounts = this.accountsSignal();
          this.accountsSignal.set([...accounts, normalizedAccount]);
          resolve(normalizedAccount);
        },
        error: (error) => {
          console.error('Failed to create account:', error);
          reject(error);
        }
      });
    });
  }

  updateAccountBalance(accountId: string | number, newBalance: number): void {
    const accountIdStr = this.normalizeId(accountId);
    
    // Update local state immediately
    const accounts = this.accountsSignal();
    const updatedAccounts = accounts.map(acc =>
      this.normalizeId(acc.id) === accountIdStr ? { ...acc, balance: newBalance } : acc
    );

    this.accountsSignal.set(updatedAccounts);

    // Update selected account if it's the one being updated
    const selectedAcc = this.selectedAccountSignal();
    if (selectedAcc && this.normalizeId(selectedAcc.id) === accountIdStr) {
      this.selectedAccountSignal.set({ ...selectedAcc, balance: newBalance });
    }

    // Update localStorage
    if (this.isBrowser) {
      localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    }

    // Update via API (don't block UI)
    this.apiService.updateAccount(accountIdStr, { balance: newBalance }).subscribe({
      next: (updatedAccount) => {
        console.log('Account balance updated via API:', updatedAccount);
      },
      error: (error) => {
        console.error('Failed to update account balance via API:', error);
      }
    });
  }

  getTotalBalance(userId: string | number): number {
    return this.getUserAccounts(userId).reduce((sum, acc) => sum + acc.balance, 0);
  }
}