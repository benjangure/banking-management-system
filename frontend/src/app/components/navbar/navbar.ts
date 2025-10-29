import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth';
import { ApiError } from '../../services/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatSnackBarModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  logout(): void {
    try {
      this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      this.snackBar.open('An error occurred during logout. Please try again.', 'Close', { duration: 4000 });
    }
  }
}