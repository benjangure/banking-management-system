import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { DepositComponent } from './components/deposit/deposit';
import { WithdrawComponent } from './components/withdraw/withdraw';
import { TransferComponent } from './components/transfer/transfer';
import { BeneficiaryManagementComponent } from './components/beneficiary-management/beneficiary-management';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history';
import { authGuard } from './guards/auth-guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'deposit', component: DepositComponent, canActivate: [authGuard] },
  { path: 'withdraw', component: WithdrawComponent, canActivate: [authGuard] },
  { path: 'transfer', component: TransferComponent, canActivate: [authGuard] },
  { path: 'beneficiaries', component: BeneficiaryManagementComponent, canActivate: [authGuard] },
  { path: 'transaction-history', component: TransactionHistoryComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];