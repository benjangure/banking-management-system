import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { ApiError } from '../../services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatInputModule,
    MatButtonModule, MatFormFieldModule, MatSnackBarModule, MatIconModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  fullName = '';
  phoneNumber = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  register(): void {
    if (!this.username || !this.email || !this.password || !this.fullName || !this.phoneNumber) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.password.length < 6) {
      this.snackBar.open('Password must be at least 6 characters', 'Close', { duration: 3000 });
      return;
    }

    this.authService.register(
      this.username,
      this.email,
      this.password,
      this.fullName,
      this.phoneNumber
    ).then(success => {
      if (success) {
        this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      } else {
        this.snackBar.open('Registration failed. Please try again.', 'Close', { duration: 3000 });
      }
    }).catch((error: ApiError) => {
      this.snackBar.open(error.message, 'Close', { duration: 4000 });
    });
  }
}