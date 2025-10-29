import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { BeneficiaryService } from '../../services/beneficiary';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { Beneficiary } from '../../models/types';
import { ApiError } from '../../services/api';

@Component({
  selector: 'app-beneficiary-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatSnackBarModule, MatDialogModule,CommonModule
  ],
  templateUrl: './beneficiary-management.html',
  styleUrl: './beneficiary-management.css'
})
export class BeneficiaryManagementComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];
  showAddForm = false;
  
  accountNumber = '';
  accountName = '';
  bankName = '';
  nickname = '';
  
  editingBeneficiary: Beneficiary | null = null;

  constructor(
    private authService: AuthService,
    private beneficiaryService: BeneficiaryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.beneficiaries = this.beneficiaryService.getUserBeneficiaries(String(user.id));
    }
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.accountNumber = '';
    this.accountName = '';
    this.bankName = '';
    this.nickname = '';
    this.editingBeneficiary = null;
  }

  saveBeneficiary(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    if (!this.accountNumber || !this.accountName || !this.bankName || !this.nickname) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.editingBeneficiary) {
      this.beneficiaryService.updateBeneficiary(String(this.editingBeneficiary.id), {
        accountNumber: this.accountNumber,
        accountName: this.accountName,
        bankName: this.bankName,
        nickname: this.nickname
      }).then(success => {
        if (success) {
          this.snackBar.open('Beneficiary updated successfully', 'Close', { duration: 3000 });
          this.loadBeneficiaries();
          this.resetForm();
          this.showAddForm = false;
        }
      }).catch((error: ApiError) => {
        this.snackBar.open(error.message, 'Close', { duration: 4000 });
      });
    } else {
      this.beneficiaryService.addBeneficiary(
        String(user.id),
        this.accountNumber,
        this.accountName,
        this.bankName,
        this.nickname
      ).then(success => {
        if (success) {
          this.snackBar.open('Beneficiary added successfully', 'Close', { duration: 3000 });
          this.loadBeneficiaries();
          this.resetForm();
          this.showAddForm = false;
        } else {
          this.snackBar.open('Beneficiary already exists', 'Close', { duration: 3000 });
        }
      }).catch((error: ApiError) => {
        this.snackBar.open(error.message, 'Close', { duration: 4000 });
      });
    }
  }

  editBeneficiary(beneficiary: Beneficiary): void {
    this.editingBeneficiary = beneficiary;
    this.accountNumber = beneficiary.accountNumber;
    this.accountName = beneficiary.accountName;
    this.bankName = beneficiary.bankName;
    this.nickname = beneficiary.nickname;
    this.showAddForm = true;
  }

  deleteBeneficiary(beneficiary: Beneficiary): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Beneficiary',
        message: `Are you sure you want to delete ${beneficiary.nickname}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.beneficiaryService.deleteBeneficiary(String(beneficiary.id)).then(success => {
          if (success) {
            this.snackBar.open('Beneficiary deleted', 'Close', { duration: 3000 });
            this.loadBeneficiaries();
          }
        }).catch((error: ApiError) => {
          this.snackBar.open(error.message, 'Close', { duration: 4000 });
        });
      }
    });
  }

  transferToBeneficiary(beneficiary: Beneficiary): void {
    this.router.navigate(['/transfer'], { 
      queryParams: { accountNumber: beneficiary.accountNumber } 
    });
  }
}