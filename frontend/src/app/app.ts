import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Use fullName from user object
      if (user.fullName) {
        return user.fullName;
      }
      if (user.username) {
        return user.username;
      }
    }
    return 'User';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'user@example.com';
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Use fullName
      if (user.fullName) {
        const nameParts = user.fullName.split(' ');
        if (nameParts.length >= 2) {
          return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[1].charAt(0).toUpperCase()}`;
        }
        return user.fullName.charAt(0).toUpperCase();
      }
      // Try username
      if (user.username) {
        return user.username.charAt(0).toUpperCase();
      }
      // Try email
      if (user.email) {
        return user.email.charAt(0).toUpperCase();
      }
    }
    return 'U';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}