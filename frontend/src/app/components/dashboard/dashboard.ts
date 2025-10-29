import { Component, OnInit, computed, signal, effect, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth';
import { AccountService } from '../../services/account';
import { TransactionService } from '../../services/transaction';
import { MiniStatementComponent } from '../mini-statement/mini-statement';
import { MonthlySummaryComponent } from '../monthly-summary/monthly-summary';
import { Account } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatProgressBarModule, MatChipsModule, MatSnackBarModule,
    MiniStatementComponent, MonthlySummaryComponent, MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ✅ FIX: Add ViewChild references to child components
  @ViewChild(MiniStatementComponent) miniStatement!: MiniStatementComponent;
  @ViewChild(MonthlySummaryComponent) monthlySummary!: MonthlySummaryComponent;

  currentUser: any;
  userAccounts = signal<Account[]>([]);
  selectedAccount = signal<Account | null>(null);
  isLoading = signal(true);
  dataReady = signal(false);
  private isBrowser: boolean;
  private refreshSubscription: Subscription | null = null;

  // Computed values for daily limits
  withdrawalProgress = computed(() => {
    const limit = this.transactionService.dailyLimit();
    if (!limit || !limit.withdrawalLimit) return 0;
    return (limit.withdrawalUsed / limit.withdrawalLimit) * 100;
  });

  transferProgress = computed(() => {
    const limit = this.transactionService.dailyLimit();
    if (!limit || !limit.transferLimit) return 0;
    return (limit.transferUsed / limit.transferLimit) * 100;
  });

  constructor(
    private authService: AuthService,
    public accountService: AccountService,
    public transactionService: TransactionService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = typeof window !== 'undefined' && !!window.localStorage;
    
    // ✅ FIX: Subscribe to refresh dashboard events
    if (this.transactionService.refreshDashboard$) {
      this.refreshSubscription = this.transactionService.refreshDashboard$.subscribe(() => {
        console.log('📞 Dashboard: Received refresh trigger from TransactionService');
        this.refreshDashboardData();
      });
    }
  }

  ngOnInit(): void {
    console.log('Dashboard ngOnInit called');
    const user = this.authService.currentUser();
    console.log('Current user in dashboard:', user);
    this.currentUser = user;

    if (!user) {
      console.log('No user found in dashboard');
      this.isLoading.set(false);
      return;
    }

    // Load accounts from localStorage or API
    const storedAccounts = this.isBrowser ? localStorage.getItem('accounts') : null;
    if (storedAccounts) {
      try {
        const accounts = JSON.parse(storedAccounts);
        console.log('Loaded accounts from localStorage:', accounts);
        this.accountService.accountsSignal.set(accounts);
        const userAccountsList = this.accountService.getUserAccounts(user.id);
        this.userAccounts.set(userAccountsList);

        if (userAccountsList.length > 0) {
          this.selectedAccount.set(userAccountsList[0]);
          console.log('Dashboard - selected first account:', userAccountsList[0]);

          // Load initial data for selected account
          if (userAccountsList[0].id) {
            this.loadAccountData(String(userAccountsList[0].id));
          }
        }

        this.dataReady.set(true);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error parsing stored accounts:', error);
        this.loadAccountsFromAPI(user);
      }
    } else {
      this.loadAccountsFromAPI(user);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private loadAccountsFromAPI(user: any): void {
    this.accountService.loadAccounts(user.id);

    effect(() => {
      const accounts = this.accountService.accounts();
      const userAccountsList = this.accountService.getUserAccounts(user.id);

      console.log('Dashboard effect - all accounts:', accounts);
      console.log('Dashboard effect - user accounts:', userAccountsList);

      this.userAccounts.set(userAccountsList);

      if (userAccountsList.length > 0) {
        if (!this.selectedAccount()) {
          this.selectedAccount.set(userAccountsList[0]);
          console.log('Dashboard - selected first account:', userAccountsList[0]);

          if (userAccountsList[0].id) {
            this.loadAccountData(String(userAccountsList[0].id));
          }
        }

        this.dataReady.set(true);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      } else if (accounts.length === 0) {
        this.dataReady.set(true);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ NEW: Load all data for an account
  private loadAccountData(accountId: string): void {
    console.log('📊 Loading all data for account:', accountId);
    
    // Load daily limits
    this.transactionService.loadDailyLimits(accountId);
    
    // Load transactions
    this.transactionService.loadTransactions(accountId);
  }

  /**
   * ✅ IMPROVED: Refreshes all dashboard data after transactions
   */
  refreshDashboardData(): void {
    console.log('🔄 FORCE REFRESHING dashboard data...');
    
    const user = this.authService.currentUser();
    if (!user) {
      console.log('No user found during refresh');
      return;
    }

    console.log('📊 Before refresh - Selected account:', this.selectedAccount());

    // Show loading state during refresh
    this.isLoading.set(true);

    // Clear cached data
    if (this.isBrowser) {
      localStorage.removeItem('accounts');
      console.log('🗑️ Cleared accounts cache');
    }

    // Store current account selection
    const currentAccountId = this.selectedAccount()?.id;

    // Force reload accounts from API
    setTimeout(() => {
      console.log('🔄 Loading fresh accounts from API...');
      this.accountService.loadAccounts(user.id);
      
      // Wait for accounts to load
      setTimeout(() => {
        const updatedUserAccounts = this.accountService.getUserAccounts(user.id);
        console.log('📊 Updated user accounts:', updatedUserAccounts);
        
        this.userAccounts.set(updatedUserAccounts);

        if (updatedUserAccounts.length > 0) {
          // Restore previous account selection
          const accountToSelect = currentAccountId 
            ? updatedUserAccounts.find(acc => acc.id === currentAccountId) 
            : updatedUserAccounts[0];
          
          if (accountToSelect) {
            this.selectedAccount.set(accountToSelect);
            console.log('✅ Selected account after refresh:', accountToSelect);

            // Reload all data for the account
            this.loadAccountData(String(accountToSelect.id));

            // ✅ FIX: Refresh child components
            setTimeout(() => {
              if (this.miniStatement) {
                console.log('🔄 Refreshing mini statement component');
                this.miniStatement.refresh();
              }
              if (this.monthlySummary) {
                console.log('🔄 Refreshing monthly summary component');
                this.monthlySummary.refresh();
              }
            }, 800);
          }
        }

        this.isLoading.set(false);
        this.cdr.detectChanges();
        
        console.log('✅ Dashboard refresh completed');

        this.snackBar.open('Dashboard updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }, 1000);
    }, 500);
  }

  onAccountChange(account: Account): void {
    console.log('🔄 Account changed to:', account);
    this.selectedAccount.set(account);
    this.accountService.selectAccount(account);
    
    // Load data for newly selected account
    if (account.id) {
      this.loadAccountData(String(account.id));
      
      // Refresh child components after a short delay
      setTimeout(() => {
        if (this.miniStatement) {
          this.miniStatement.refresh();
        }
        if (this.monthlySummary) {
          this.monthlySummary.refresh();
        }
      }, 300);
    }
  }

  getAccountTypeColor(type: string): string {
    switch (type.toUpperCase()) {
      case 'SAVINGS': return 'primary';
      case 'CHECKING': return 'accent';
      case 'FIXED_DEPOSIT': return 'warn';
      default: return 'primary';
    }
  }

  getTotalBalance(): number {
    const user = this.authService.currentUser();
    return user ? this.accountService.getTotalBalance(user.id) : 0;
  }

  getDailyLimit() {
    return this.transactionService.dailyLimit();
  }
}