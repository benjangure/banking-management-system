import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { User, Account, Transaction, Beneficiary, TransactionSummary, DailyLimit } from '../models/types';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';

  constructor(private http: HttpClient) {}

  // JWT Token Management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      apiError = {
        message: 'Network error occurred. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
        details: error.error.message
      };
    } else {
      if (error.error && typeof error.error === 'object' && error.error.message) {
        apiError = {
          message: error.error.message,
          code: error.error.code || `HTTP_${error.status}`,
          details: error.error.details
        };
      } else {
        apiError = {
          message: this.getDefaultErrorMessage(error.status),
          code: `HTTP_${error.status}`,
          details: error.message
        };
      }
    }

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Invalid request. Please check your input and try again.';
      case 401: return 'Authentication required. Please log in again.';
      case 403: return 'Access denied. You do not have permission to perform this action.';
      case 404: return 'Resource not found.';
      case 409: return 'Conflict occurred. The resource may already exist.';
      case 422: return 'Validation failed. Please check your input.';
      case 429: return 'Too many requests. Please wait and try again.';
      case 500: return 'Server error occurred. Please try again later.';
      case 503: return 'Service temporarily unavailable. Please try again later.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  }

  // Authentication Endpoints
  login(credentials: { username: string; password: string }): Observable<{ user: User; token: string; accounts?: any[] }> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    })
      .pipe(
        map(response => {
          console.log('Raw login response:', response);
          let token = response.token;
          let user = response.user;

          if (response.data && typeof response.data === 'object') {
            token = response.data.token;
            user = {
              id: response.data.userId?.toString() || '',
              username: response.data.username || '',
              email: response.data.email || '',
              firstName: response.data.fullName?.split(' ')[0] || '',
              lastName: response.data.fullName?.split(' ').slice(1).join(' ') || '',
              name: response.data.fullName || '',
              fullName: response.data.fullName || '',
              phoneNumber: ''
            };
          }

          if (!token || !user || !user.id) {
            throw new Error('Invalid login response: missing token or user data');
          }

          this.setToken(token);
          return { user, token, accounts: response.data?.accounts || [] };
        }),
        catchError(this.handleError)
      );
  }

  register(userData: { username: string; email: string; password: string; fullName: string; phoneNumber: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData)
      .pipe(catchError(error => this.handleError(error)));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers: this.getHeaders() })
      .pipe(
        map(() => this.removeToken()),
        catchError(this.handleError)
      );
  }

  // Account Endpoints
  getUserAccounts(userId: string): Observable<Account[]> {
    console.log('API call: getUserAccounts for userId:', userId);
    return this.http.get<any>(`${this.apiUrl}/accounts/user/${userId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          }
          if (Array.isArray(response)) {
            return response;
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  createAccount(accountData: { accountType: string; userId: string }): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/accounts`, accountData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateAccount(accountId: string, accountData: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/accounts/${accountId}`, accountData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAccountById(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounts/${accountId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Transaction Endpoints
  deposit(accountId: string, amount: number, description: string): Observable<Transaction> {
    const transactionData = { accountId: parseInt(accountId), amount, description };
    return this.http.post<any>(`${this.apiUrl}/transactions/deposit`, transactionData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  withdraw(accountId: string, amount: number, description: string): Observable<Transaction> {
    const transactionData = { accountId: parseInt(accountId), amount, description };
    return this.http.post<any>(`${this.apiUrl}/transactions/withdraw`, transactionData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  transfer(fromAccountId: string, toAccountNumber: string, amount: number, description: string): Observable<Transaction> {
    const transactionData = { accountId: parseInt(fromAccountId), toAccountNumber, amount, description };
    return this.http.post<any>(`${this.apiUrl}/transactions/transfer`, transactionData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  getAccountTransactions(accountId: string): Observable<Transaction[]> {
    return this.http.get<any>(`${this.apiUrl}/transactions/history/${accountId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          }
          return Array.isArray(response) ? response : [];
        }),
        catchError(this.handleError)
      );
  }

  getRecentTransactions(accountId: string, limit: number = 10): Observable<Transaction[]> {
    return this.http.get<any>(`${this.apiUrl}/transactions/mini-statement/${accountId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          }
          return Array.isArray(response) ? response : [];
        }),
        catchError(this.handleError)
      );
  }

  // ✅ FIXED: Updated endpoint to match backend
  getMonthlySummary(accountId: string, month: number, year: number): Observable<TransactionSummary> {
    const url = `${this.apiUrl}/transactions/monthly-summary/${accountId}`;
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
      params: { 
        month: month.toString(), 
        year: year.toString() 
      }
    }).pipe(
      map(response => {
        console.log('✅ Monthly summary API response:', response);
        // Handle ApiResponse wrapper
        if (response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // ✅ FIXED: Updated endpoint
  getDailyLimits(accountId: string): Observable<DailyLimit> {
    return this.http.get<any>(`${this.apiUrl}/daily-limits/account/${accountId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  // Beneficiary Endpoints
  getUserBeneficiaries(userId: string): Observable<Beneficiary[]> {
    return this.http.get<any>(`${this.apiUrl}/beneficiaries/user/${userId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          }
          return Array.isArray(response) ? response : [];
        }),
        catchError(this.handleError)
      );
  }

  addBeneficiary(beneficiaryData: { userId: string; beneficiaryAccountNumber: string; accountName: string; bankName: string; nickname: string }): Observable<Beneficiary> {
    return this.http.post<any>(`${this.apiUrl}/beneficiaries/user/${beneficiaryData.userId}`, beneficiaryData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  updateBeneficiary(beneficiaryId: string, beneficiaryData: Partial<Beneficiary>): Observable<Beneficiary> {
    return this.http.put<any>(`${this.apiUrl}/beneficiaries/${beneficiaryId}`, beneficiaryData, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  deleteBeneficiary(beneficiaryId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/beneficiaries/${beneficiaryId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }
}