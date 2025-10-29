import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AccountService } from '../../services/account';
import { Account } from '../../models/types';
import { ApiError } from '../../services/api';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatSnackBarModule
  ],
  templateUrl: './account-management.html',
  styleUrl: './account-management.css'
})
export class AccountManagementComponent implements OnInit {
  userAccounts: Account[] = [];

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      try {
        this.userAccounts = this.accountService.getUserAccounts(user.id);
      } catch (error) {
        console.error('Failed to load user accounts:', error);
        this.snackBar.open('Failed to load accounts. Please try again.', 'Close', { duration: 4000 });
      }
    }
  }

  selectAccount(account: Account): void {
    this.accountService.selectAccount(account);
  }

  getAccountTypeColor(type: string): string {
    switch (type) {
      case 'Savings': return 'primary';
      case 'Checking': return 'accent';
      case 'Fixed Deposit': return 'warn';
      default: return '';
    }
  }

  getAccountIcon(type: string): string {
    switch (type) {
      case 'Savings': return 'savings';
      case 'Checking': return 'account_balance';
      case 'Fixed Deposit': return 'lock';
      default: return 'account_balance_wallet';
    }
  }

  getTotalBalance(): number {
    return this.userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }
}