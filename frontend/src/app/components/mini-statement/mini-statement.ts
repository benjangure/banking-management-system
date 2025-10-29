import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction';
import { Account, Transaction } from '../../models/types';

@Component({
  selector: 'app-mini-statement',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './mini-statement.html',
  styleUrl: './mini-statement.css'
})
export class MiniStatementComponent implements OnInit, OnChanges {
  @Input() account: Account | null = null;
  
  transactions = signal<Transaction[]>([]);
  isLoading = signal(true);
  displayedColumns: string[] = ['date', 'type', 'description', 'amount'];

  constructor(private transactionService: TransactionService) {
    // ✅ FIX: React to transaction changes from the service
    effect(() => {
      const allTransactions = this.transactionService.transactions();
      console.log('📋 Mini Statement - All transactions updated:', allTransactions.length);
      if (this.account) {
        this.filterTransactionsForAccount();
      }
    });
  }

  ngOnInit(): void {
    console.log('📋 Mini Statement initialized with account:', this.account);
    this.loadTransactions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ FIX: Reload transactions when account changes
    if (changes['account'] && !changes['account'].firstChange) {
      console.log('📋 Account changed in mini statement, reloading:', this.account);
      this.loadTransactions();
    }
  }

  async loadTransactions(): Promise<void> {
    if (!this.account) {
      console.log('⚠️ No account selected for mini statement');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    console.log('🔄 Loading mini statement for account:', this.account.id);

    try {
      // ✅ FIX: Load transactions from API through the service
      this.transactionService.loadTransactions(String(this.account.id));
      
      // Wait a moment for the service to update
      setTimeout(() => {
        this.filterTransactionsForAccount();
        this.isLoading.set(false);
      }, 500);
    } catch (error) {
      console.error('❌ Failed to load mini statement:', error);
      this.transactions.set([]);
      this.isLoading.set(false);
    }
  }

  private filterTransactionsForAccount(): void {
    if (!this.account) return;

    const recentTransactions = this.transactionService.getRecentTransactions(
      String(this.account.id),
      10
    );
    
    console.log('📋 Filtered recent transactions for account:', recentTransactions);
    this.transactions.set(recentTransactions);
  }

  // ✅ FIX: Add public method to refresh from parent component
  refresh(): void {
    console.log('🔄 Mini Statement refresh triggered');
    this.loadTransactions();
  }

  getAmountClass(transaction: Transaction): string {
    if (transaction.transactionType === 'Deposit') return 'positive';
    if (transaction.transactionType === 'Transfer' && 
        transaction.toAccountId === this.account?.id) {
      return 'positive';
    }
    return 'negative';
  }

  getAmountSign(transaction: Transaction): string {
    if (transaction.transactionType === 'Deposit') return '+';
    if (transaction.transactionType === 'Transfer' && 
        transaction.toAccountId === this.account?.id) {
      return '+';
    }
    return '-';
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'Deposit': return 'arrow_downward';
      case 'Withdrawal': return 'arrow_upward';
      case 'Transfer': return 'swap_horiz';
      default: return 'help';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Deposit': return 'primary';
      case 'Withdrawal': return 'warn';
      case 'Transfer': return 'accent';
      default: return '';
    }
  }
}