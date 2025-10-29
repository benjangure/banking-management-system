import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AuthService } from '../../services/auth';
import { AccountService } from '../../services/account';
import { TransactionService } from '../../services/transaction';
import { ReportService } from '../../services/report.service';
import { Transaction, Account } from '../../models/types';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    MatChipsModule, MatPaginatorModule,CommonModule
  ],
  templateUrl: './transaction-history.html',
  styleUrl: './transaction-history.css'
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedAccount: Account | null = null;
  userAccounts: Account[] = [];
  filterType: string = 'All';
  searchText: string = '';
  displayedColumns: string[] = ['date', 'type', 'description', 'amount', 'balance', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.userAccounts = this.accountService.getUserAccounts(user.id);
      this.selectedAccount = this.accountService.selectedAccount() || this.userAccounts[0];
      this.loadTransactions();
    }
  }

  loadTransactions(): void {
    if (this.selectedAccount) {
      this.transactions = this.transactionService.getAccountTransactions(String(this.selectedAccount.id));
      this.applyFilters();
    }
  }

  onAccountChange(): void {
    this.loadTransactions();
  }

  applyFilters(): void {
    let filtered = [...this.transactions];

    if (this.filterType !== 'All') {
      filtered = filtered.filter(t => t.transactionType === this.filterType);
    }

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(t =>
        String(t.id).toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.toAccountNumber?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredTransactions = filtered;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'primary';
      case 'Pending': return 'accent';
      case 'Failed': return 'warn';
      default: return '';
    }
  }

  getAmountClass(transaction: Transaction): string {
    if (transaction.transactionType === 'Deposit') return 'positive';
    if (transaction.transactionType === 'Transfer' && transaction.toAccountId === this.selectedAccount?.id) {
      return 'positive';
    }
    return 'negative';
  }

  getAmountSign(transaction: Transaction): string {
    if (transaction.transactionType === 'Deposit') return '+';
    if (transaction.transactionType === 'Transfer' && transaction.toAccountId === this.selectedAccount?.id) {
      return '+';
    }
    return '-';
  }

  downloadReceipt(transaction: Transaction): void {
    const receiptText = `
TRANSACTION RECEIPT
===================
Transaction ID: ${transaction.id}
Date: ${transaction.date.toLocaleString()}
Type: ${transaction.transactionType}
Amount: KSh ${transaction.amount.toFixed(2)}
${transaction.toAccountNumber ? `To Account: ${transaction.toAccountNumber}` : ''}
Description: ${transaction.description}
Status: ${transaction.status}
===================
Thank you for banking with us!
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${transaction.id}.txt`;
    link.click();
  }

  downloadPDF(): void {
    if (!this.selectedAccount) {
      return;
    }
    const user = this.authService.currentUser();
    if (!user) return;

    const userName = user.fullName || user.username;
    this.reportService.generateTransactionPDF(this.filteredTransactions, this.selectedAccount, userName);
  }

  downloadExcel(): void {
    if (!this.selectedAccount) {
      return;
    }
    const user = this.authService.currentUser();
    if (!user) return;

    const userName = user.fullName || user.username;
    this.reportService.generateTransactionExcel(this.filteredTransactions, this.selectedAccount, userName);
  }
}