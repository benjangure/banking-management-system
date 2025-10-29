import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransactionService } from '../../services/transaction';
import { ReportService } from '../../services/report.service';
import { Account, TransactionSummary } from '../../models/types';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-monthly-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './monthly-summary.html',
  styleUrl: './monthly-summary.css'
})
export class MonthlySummaryComponent implements OnInit, OnChanges {
  @Input() account: Account | null = null;
  
  summary = signal<TransactionSummary>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    transactionCount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    depositChange: 0,
    withdrawalChange: 0,
    transferChange: 0,
    transactionChange: 0
  });

  isLoading = signal(true);
  currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  constructor(
    private transactionService: TransactionService,
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('📊 Monthly Summary Component initialized with account:', this.account);
    this.loadSummary();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ FIX: Reload summary when account changes
    if (changes['account'] && !changes['account'].firstChange) {
      console.log('📊 Account changed, reloading summary:', this.account);
      this.loadSummary();
    }
  }

  async loadSummary(): Promise<void> {
    if (!this.account) {
      console.log('⚠️ No account selected for monthly summary');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    console.log('🔄 Loading monthly summary for account:', this.account.id);

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const year = currentDate.getFullYear();

    try {
      // ✅ FIX: Always fetch from API
      const summaryData = await this.transactionService.getMonthlySummary(
        String(this.account.id),
        month,
        year
      );

      console.log('✅ Monthly summary loaded from API:', summaryData);
      this.summary.set(summaryData);
    } catch (error) {
      console.error('❌ Failed to load monthly summary:', error);
      // Set default zero values on error
      this.summary.set({
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
    } finally {
      this.isLoading.set(false);
    }
  }

  // ✅ FIX: Add public method to refresh from parent component
  refresh(): void {
    console.log('🔄 Monthly Summary refresh triggered');
    this.loadSummary();
  }

  downloadPDF(): void {
    if (!this.account) return;
    
    const user = this.authService.currentUser();
    if (!user) return;

    const userName = user.fullName || user.username;
    const currentSummary = this.summary();
    
    this.reportService.generateMonthlySummaryPDF(
      currentSummary,
      this.account,
      userName,
      currentSummary.month,
      currentSummary.year
    );
  }

  downloadExcel(): void {
    if (!this.account) return;
    
    const user = this.authService.currentUser();
    if (!user) return;

    const userName = user.fullName || user.username;
    const currentSummary = this.summary();
    
    this.reportService.generateMonthlySummaryExcel(
      currentSummary,
      this.account,
      userName,
      currentSummary.month,
      currentSummary.year
    );
  }

  getChangeIcon(change: number): string {
    return change > 0 ? 'trending_up' : change < 0 ? 'trending_down' : 'trending_flat';
  }

  getChangeClass(change: number): string {
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  }
}