import { Injectable } from '@angular/core';
import { Transaction, Account, TransactionSummary } from '../models/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // ✅ FIXED: PDF Generation with proper spacing and no overlapping
  async generateTransactionPDF(transactions: Transaction[], account: Account, userName: string): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    // Savanna Bank Header with Logo - Blue background
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Bank Logo/Icon
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('🏦', 20, 25);

    // Bank Name
    doc.setFontSize(20);
    doc.text('SAVANNA BANK', 40, 25);

    // Personalized welcome message
    doc.setFontSize(10);
    doc.text(`Dear ${userName}, thank you for trusting Savanna Bank with your financial needs.`, 20, 35);

    // Report Title
    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text('TRANSACTION HISTORY REPORT', 20, 50);

    // Account Information Box - Pink background
    doc.setFillColor(255, 192, 203);
    doc.rect(margin, 58, contentWidth, 32, 'F');

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Account Number: ${account.accountNumber}`, 20, 68);
    doc.text(`Account Type: ${account.accountType}`, 20, 74);
    doc.text(`Customer Name: ${userName}`, 20, 80);
    doc.text(`Report Date: ${new Date().toLocaleDateString('en-KE')}`, 120, 68);
    doc.text(`Currency: Kenyan Shillings (KES)`, 120, 74);

    // Table headers with styling - Red header
    let yPosition = 100;
    doc.setFillColor(220, 20, 60);
    doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Date', 20, yPosition);
    doc.text('Type', 55, yPosition);
    doc.text('Description', 85, yPosition);
    doc.text('Amount (KES)', 135, yPosition);
    doc.text('Balance (KES)', 170, yPosition);

    yPosition += 8;

    // Transactions with alternating row colors
    doc.setTextColor(0, 0, 0);
    transactions.forEach((transaction, index) => {
      // ✅ FIX: Check for page overflow with proper spacing
      if (yPosition > 260) {
        doc.addPage();
        
        // Repeat header on new page
        doc.setFillColor(25, 118, 210);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('🏦 SAVANNA BANK', 20, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(25, 118, 210);
        doc.text('TRANSACTION HISTORY (Continued)', 20, 45);
        
        // Repeat table header
        yPosition = 55;
        doc.setFillColor(220, 20, 60);
        doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('Date', 20, yPosition);
        doc.text('Type', 55, yPosition);
        doc.text('Description', 85, yPosition);
        doc.text('Amount (KES)', 135, yPosition);
        doc.text('Balance (KES)', 170, yPosition);
        
        yPosition += 8;
      }

      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(240, 248, 255);
      }
      doc.rect(margin, yPosition - 4, contentWidth, 7, 'F');

      const date = new Date(transaction.date).toLocaleDateString('en-KE', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
      const amount = transaction.transactionType === 'Deposit' || 
                    (transaction.transactionType === 'Transfer' && transaction.toAccountId === account.id) ?
        `+${transaction.amount.toFixed(2)}` : `-${transaction.amount.toFixed(2)}`;

      // Truncate description if too long
      const description = transaction.description.length > 20 ? 
        transaction.description.substring(0, 20) + '...' : 
        transaction.description;

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(date, 20, yPosition);
      doc.text(transaction.transactionType, 55, yPosition);
      doc.text(description, 85, yPosition);

      // Color code amounts
      if (amount.startsWith('+')) {
        doc.setTextColor(25, 118, 210); // Blue for positive
      } else {
        doc.setTextColor(220, 20, 60); // Red for negative
      }
      doc.text(amount, 135, yPosition);

      doc.setTextColor(0, 0, 0);
      doc.text(transaction.balanceAfter?.toFixed(2) || 'N/A', 170, yPosition);

      yPosition += 7; // ✅ FIX: Consistent row height
    });

    // Footer with Savanna Bank branding - Blue footer
    doc.setFillColor(25, 118, 210);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('Generated by Savanna Bank Digital Banking System', 20, pageHeight - 13);
    doc.text(`© ${new Date().getFullYear()} Savanna Bank. All rights reserved.`, 20, pageHeight - 8);

    doc.save(`savanna-bank-transaction-history-${account.accountNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateMonthlySummaryPDF(summary: TransactionSummary, account: Account, userName: string, month: number, year: number): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;

    // Savanna Bank Header with Logo - Blue background
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Bank Logo/Icon
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('🏦', 20, 25);

    // Bank Name
    doc.setFontSize(20);
    doc.text('SAVANNA BANK', 40, 25);

    // Personalized welcome message
    doc.setFontSize(10);
    doc.text(`Dear ${userName}, thank you for choosing Savanna Bank.`, 20, 35);

    // Report Title
    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text('MONTHLY ACCOUNT SUMMARY', 20, 55);

    // Account Information Box - Pink background
    doc.setFillColor(255, 192, 203);
    doc.rect(15, 65, 180, 32, 'F');

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Account Number: ${account.accountNumber}`, 25, 75);
    doc.text(`Account Type: ${account.accountType}`, 25, 82);
    doc.text(`Customer Name: ${userName}`, 25, 89);
    doc.text(`Period: ${new Date(year, month - 1).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}`, 120, 75);
    doc.text(`Currency: Kenyan Shillings (KES)`, 120, 82);

    // Summary data with styled boxes
    let yPosition = 110;

    // Summary header - Red header
    doc.setFillColor(220, 20, 60);
    doc.rect(15, yPosition - 5, 180, 10, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('MONTHLY SUMMARY DETAILS', 20, yPosition + 2);

    yPosition += 20;

    // Create summary boxes
    const summaryItems = [
      { label: 'Total Deposits', value: summary.totalDeposits, color: [25, 118, 210] },
      { label: 'Total Withdrawals', value: summary.totalWithdrawals, color: [220, 20, 60] },
      { label: 'Total Transfers', value: summary.totalTransfers, color: [255, 140, 0] },
      { label: 'Transaction Count', value: summary.transactionCount, color: [0, 0, 0] }
    ];

    summaryItems.forEach((item, index) => {
      const boxY = yPosition + (index * 15);
      doc.setFillColor(248, 248, 248);
      doc.rect(20, boxY - 4, 170, 10, 'F');

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${item.label}:`, 25, boxY + 2);

      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      const valueText = typeof item.value === 'number' && item.label !== 'Transaction Count' ?
        `KSh ${item.value.toFixed(2)}` : item.value.toString();
      doc.text(valueText, 120, boxY + 2);
    });

    yPosition += 70;

    // Net change highlight box - Pink background
    doc.setFillColor(255, 192, 203);
    doc.rect(15, yPosition - 5, 180, 15, 'F');

    const netChange = summary.totalDeposits - summary.totalWithdrawals;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('NET CHANGE THIS MONTH:', 20, yPosition + 4);

    if (netChange >= 0) {
      doc.setTextColor(25, 118, 210);
    } else {
      doc.setTextColor(220, 20, 60);
    }
    doc.text(`KSh ${netChange.toFixed(2)}`, 120, yPosition + 4);

    // Footer with Savanna Bank branding - Blue footer
    doc.setFillColor(25, 118, 210);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('Generated by Savanna Bank Digital Banking System', 20, pageHeight - 13);
    doc.text(`© ${new Date().getFullYear()} Savanna Bank. All rights reserved.`, 20, pageHeight - 8);

    doc.save(`savanna-bank-monthly-summary-${account.accountNumber}-${year}-${month.toString().padStart(2, '0')}.pdf`);
  }

  // Excel Generation
  generateTransactionExcel(transactions: Transaction[], account: Account, userName: string): void {
    const data: any[] = transactions.map(transaction => ({
      Date: new Date(transaction.date).toLocaleDateString(),
      Type: transaction.transactionType,
      Description: transaction.description,
      Amount: transaction.amount,
      'From Account': transaction.fromAccountId?.toString(),
      'To Account': transaction.toAccountNumber || '',
      'Balance After': transaction.balanceAfter || 0,
      Status: transaction.status || 'Completed'
    }));

    // Add summary row
    const totalDeposits = transactions
      .filter(t => t.transactionType === 'Deposit' || (t.transactionType === 'Transfer' && t.toAccountId === account.id))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter(t => t.transactionType === 'Withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    data.push({
      Date: '',
      Type: 'SUMMARY',
      Description: '',
      Amount: 0,
      'From Account': '',
      'To Account': '',
      'Balance After': 0,
      Status: ''
    });

    data.push({
      Date: 'Total Deposits',
      Type: `KSh ${totalDeposits.toFixed(2)}`,
      Description: 'Total Withdrawals',
      Amount: totalWithdrawals,
      'From Account': `KSh ${totalWithdrawals.toFixed(2)}`,
      'To Account': 'Net Change',
      'Balance After': totalDeposits - totalWithdrawals,
      Status: `KSh ${(totalDeposits - totalWithdrawals).toFixed(2)}`
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Add account info sheet
    const accountData = [{
      'Account Number': account.accountNumber,
      'Account Type': account.accountType,
      'Current Balance': account.balance,
      'Customer': userName,
      'Generated': new Date().toLocaleDateString()
    }];
    const accountSheet = XLSX.utils.json_to_sheet(accountData);
    XLSX.utils.book_append_sheet(workbook, accountSheet, 'Account Info');

    XLSX.writeFile(workbook, `transaction-history-${account.accountNumber}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  generateMonthlySummaryExcel(summary: TransactionSummary, account: Account, userName: string, month: number, year: number): void {
    const data = [{
      'Account Number': account.accountNumber,
      'Account Type': account.accountType,
      'Customer': userName,
      'Period': new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      'Total Deposits': summary.totalDeposits,
      'Total Withdrawals': summary.totalWithdrawals,
      'Total Transfers': summary.totalTransfers,
      'Transaction Count': summary.transactionCount,
      'Net Change': summary.totalDeposits - summary.totalWithdrawals,
      'Generated': new Date().toLocaleDateString()
    }];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Summary');

    XLSX.writeFile(workbook, `monthly-summary-${account.accountNumber}-${year}-${month.toString().padStart(2, '0')}.xlsx`);
  }
}