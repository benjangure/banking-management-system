import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Beneficiary } from '../models/types';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private beneficiariesSignal = signal<Beneficiary[]>([]);
  private isBrowser: boolean;

  beneficiaries = this.beneficiariesSignal.asReadonly();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private apiService: ApiService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadBeneficiaries();
    }
  }

  private loadBeneficiaries(userId?: string): void {
    if (!this.isBrowser) return;

    if (userId) {
      this.apiService.getUserBeneficiaries(userId).subscribe({
        next: (beneficiaries) => {
          this.beneficiariesSignal.set(beneficiaries);
        },
        error: (error) => {
          console.error('Failed to load beneficiaries:', error);
        }
      });
    } else {
      // Fallback to localStorage if no userId provided
      const beneficiaries = localStorage.getItem('beneficiaries');
      if (beneficiaries) {
        this.beneficiariesSignal.set(JSON.parse(beneficiaries));
      }
    }
  }

  private saveBeneficiaries(): void {
    if (!this.isBrowser) return;
    localStorage.setItem('beneficiaries', JSON.stringify(this.beneficiariesSignal()));
  }

  getUserBeneficiaries(userId: string): Beneficiary[] {
    return this.beneficiariesSignal().filter(b => b.userId === userId);
  }

  addBeneficiary(userId: string, accountNumber: string, accountName: string, bankName: string, nickname: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const beneficiaryData = { userId, beneficiaryAccountNumber: accountNumber, accountName, bankName, nickname };

      this.apiService.addBeneficiary(beneficiaryData).subscribe({
        next: (beneficiary) => {
          const beneficiaries = this.beneficiariesSignal();
          this.beneficiariesSignal.set([...beneficiaries, beneficiary]);
          resolve(true);
        },
        error: (error) => {
          console.error('Failed to add beneficiary:', error);
          resolve(false);
        }
      });
    });
  }

  updateBeneficiary(id: string, updates: Partial<Beneficiary>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService.updateBeneficiary(id, updates).subscribe({
        next: (updatedBeneficiary) => {
          const beneficiaries = this.beneficiariesSignal();
          const updated = beneficiaries.map(b =>
            b.id === id ? updatedBeneficiary : b
          );
          this.beneficiariesSignal.set(updated);
          resolve(true);
        },
        error: (error) => {
          console.error('Failed to update beneficiary:', error);
          resolve(false);
        }
      });
    });
  }

  deleteBeneficiary(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService.deleteBeneficiary(id).subscribe({
        next: () => {
          const beneficiaries = this.beneficiariesSignal();
          const filtered = beneficiaries.filter(b => b.id !== id);
          this.beneficiariesSignal.set(filtered);
          resolve(true);
        },
        error: (error) => {
          console.error('Failed to delete beneficiary:', error);
          resolve(false);
        }
      });
    });
  }
}