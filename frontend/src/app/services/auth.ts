// ===== auth.ts - FIXED VERSION =====
import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../models/types';
import { ApiService } from './api';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private apiService: ApiService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  // ✅ FIXED: Normalize ID helper
  private normalizeId(id: string | number | undefined): string {
    if (id === undefined || id === null) return '';
    return String(id);
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  private isTokenValid(): boolean {
    if (!this.isBrowser) return false;
    const token = this.apiService.getToken();
    if (!token) {
      console.log('No token found in localStorage');
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Token does not have proper JWT format');
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = decoded.exp > currentTime;
      console.log('Token validation:', { exp: decoded.exp, currentTime, isValid });
      return isValid;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser || typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser && this.isTokenValid()) {
        const user = JSON.parse(storedUser);
        // ✅ Normalize ID
        user.id = this.normalizeId(user.id);
        this.currentUserSignal.set(user);
        console.log('User loaded from storage:', user);
      } else {
        console.log('No valid user found in storage');
        localStorage.removeItem('currentUser');
        this.apiService.removeToken();
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('currentUser');
      this.apiService.removeToken();
    }
  }

  register(username: string, email: string, password: string, fullName: string, phoneNumber: string): Promise<boolean> {
    const userData = { username, email, password, fullName, phoneNumber };
    return new Promise((resolve, reject) => {
      this.apiService.register(userData).subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          // ✅ Registration successful - don't auto-login
          resolve(true);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          reject(error);
        }
      });
    });
  }

  login(username: string, password: string): Promise<boolean> {
    const credentials = { username, password };
    return new Promise((resolve, reject) => {
      this.apiService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login API response:', response);

          // ✅ apiService.login() already returns { user, token, accounts }
          const { user, token, accounts } = response;

          if (user && token) {
            console.log('User from login response:', user);
            console.log('Token from login response:', token.substring(0, 20) + '...');

            // ✅ Normalize user ID
            const normalizedUser: User = {
              ...user,
              id: this.normalizeId(user.id)
            };

            console.log('Normalized user for storage:', normalizedUser);
            this.currentUserSignal.set(normalizedUser);

            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
              console.log('User stored in localStorage');

              // ✅ Store accounts with normalized IDs
              if (accounts && Array.isArray(accounts)) {
                console.log('Processing accounts from login response:', accounts);

                const formattedAccounts = accounts.map((acc: any) => ({
                  id: this.normalizeId(acc.id),
                  accountNumber: acc.accountNumber || '',
                  accountType: acc.accountType || '',
                  balance: acc.balance || 0,
                  userId: normalizedUser.id,
                  interestRate: acc.interestRate || 0,
                  createdDate: acc.createdDate || new Date().toISOString(),
                  status: acc.status || 'ACTIVE'
                }));

                console.log('Formatted accounts for storage:', formattedAccounts);
                localStorage.setItem('accounts', JSON.stringify(formattedAccounts));
              }
            }

            console.log('Login successful, navigating to dashboard');
            this.router.navigate(['/dashboard']);
            resolve(true);
          } else {
            console.error('Invalid login response - missing user or token:', response);
            resolve(false);
          }
        },
        error: (error) => {
          console.error('Login API error:', error);
          reject(error);
        }
      });
    });
  }

  logout(): void {
    console.log('Logging out user');

    this.apiService.logout().subscribe({
      next: () => {
        this.clearUserData();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.clearUserData();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  private clearUserData(): void {
    this.currentUserSignal.set(null);

    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('accounts');
      localStorage.removeItem('selectedAccount');
      localStorage.removeItem('transactions');
      localStorage.removeItem('dailyLimit');
      sessionStorage.clear();
    }
  }

  isAuthenticated(): boolean {
    const isAuth = this.currentUser() !== null && this.isTokenValid();
    console.log('isAuthenticated:', isAuth);
    return isAuth;
  }
}