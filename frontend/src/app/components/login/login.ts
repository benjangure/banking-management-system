import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { ApiError } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatInputModule,
    MatButtonModule, MatFormFieldModule, MatSnackBarModule, MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  login(): void {
    if (!this.username || !this.password) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    this.authService.login(this.username, this.password).then(success => {
      if (!success) {
        this.snackBar.open('Invalid username or password', 'Close', { duration: 3000 });
      }
    }).catch((error: ApiError) => {
      this.snackBar.open(error.message, 'Close', { duration: 4000 });
    });
  }
}