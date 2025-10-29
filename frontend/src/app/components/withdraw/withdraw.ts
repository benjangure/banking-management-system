// ===== withdraw.component.ts =====
import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth';
import { AccountService } from '../../services/account';
import { TransactionService } from '../../services/transaction';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { Account } from '../../models/types';
import { ApiError } from '../../services/api';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatInputModule,
    MatButtonModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule,
    MatIconModule, MatDialogModule
  ],
  templateUrl: './withdraw.html',
  styleUrl: './withdraw.css'
})
export class WithdrawComponent implements OnInit {
  amount: number = 0;
  description: string = '';
  selectedAccount: Account | null = null;
  userAccounts: Account[] = [];
  isLoading: boolean = false;
  showValidation: boolean = false;
  isInitializing: boolean = true;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (user) {
      // First, try to load accounts from localStorage (stored during login)
      const storedAccounts = localStorage.getItem('accounts');
      if (storedAccounts) {
        try {
          const accounts = JSON.parse(storedAccounts);
          console.log('Loaded accounts from localStorage:', accounts);
          // Set accounts in service signal
          this.accountService.accountsSignal.set(accounts);
          this.userAccounts = this.accountService.getUserAccounts(user.id);
          console.log('User accounts from localStorage:', this.userAccounts);

          if (this.userAccounts.length > 0 && !this.selectedAccount) {
            this.selectedAccount = this.userAccounts[0];
            console.log('Selected first account:', this.userAccounts[0]);
          }

          // Mark as initialized immediately
          this.isInitializing = false;
        } catch (error) {
          console.error('Error parsing stored accounts:', error);
          // Fallback to API call
          this.loadAccountsFromAPI(user);
        }
      } else {
        // No stored accounts, load from API
        this.loadAccountsFromAPI(user);
      }
    } else {
      this.isInitializing = false;
    }
  }

  private loadAccountsFromAPI(user: any): void {
    // Load accounts from service
    this.accountService.loadAccounts(user.id);

    // Update userAccounts when accounts change
    effect(() => {
      const accounts = this.accountService.accounts();
      this.userAccounts = this.accountService.getUserAccounts(user.id);
      console.log('Withdraw component - userAccounts updated:', this.userAccounts);

      // Set initializing to false once we have account data
      this.isInitializing = false;

      if (!this.selectedAccount && this.userAccounts.length > 0) {
        this.selectedAccount = this.userAccounts[0];
        console.log('Withdraw component - selectedAccount set to:', this.selectedAccount);
      }
    });
  }

  shouldShowError(): boolean {
    return this.showValidation && (this.amount <= 0 || this.amount < 10);
  }

  hasInsufficientBalance(): boolean {
    return this.showValidation && this.selectedAccount !== null && this.amount > this.selectedAccount.balance;
  }

  withdraw(): void {
    this.showValidation = true;

    if (!this.selectedAccount) {
      this.snackBar.open('Please select an account', 'Close', { duration: 3000 });
      return;
    }

    if (this.amount <= 0) {
      this.snackBar.open('Please enter a valid amount', 'Close', { duration: 3000 });
      return;
    }

    if (this.amount < 1000) {
      this.snackBar.open('Minimum withdrawal amount is KSh 1,000', 'Close', { duration: 3000 });
      return;
    }

    if (this.amount > this.selectedAccount.balance) {
      this.snackBar.open('Insufficient balance', 'Close', { duration: 3000 });
      return;
    }

    const remaining = this.transactionService.getRemainingWithdrawalLimit();
    if (this.amount > remaining) {
      this.snackBar.open(`Daily limit exceeded. Remaining: KSh ${remaining.toFixed(2)}`, 'Close', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Withdrawal',
        message: `Are you sure you want to withdraw KSh ${this.amount.toFixed(2)} from account ${this.selectedAccount.accountNumber}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedAccount) {
        this.isLoading = true;
        this.transactionService.withdraw(
          String(this.selectedAccount.id),
          this.amount,
          this.description || 'Withdrawal'
        ).then(response => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open(response.message, 'Close', { duration: 3000 });
            // Reset form
            this.amount = 0;
            this.description = '';
            this.showValidation = false;
            // Update account balance immediately
            if (this.selectedAccount) {
              this.accountService.updateAccountBalance(this.selectedAccount.id, this.selectedAccount.balance - this.amount);
            }
            // Navigate to dashboard
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          } else {
            this.snackBar.open(response.message, 'Close', { duration: 3000 });
          }
        }).catch((error: ApiError) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Withdrawal failed. Please try again.', 'Close', { duration: 4000 });
        });
      }
    });
  }

  getRemainingLimit(): number {
    return this.transactionService.getRemainingWithdrawalLimit();
  }
}