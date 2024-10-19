import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { environment } from '../../environments/environment';
import { UserData } from '../newTypes/user-data';
import { AsyncPipe, CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  user?: UserData | null;
  private authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    this.checkUserLogin();
  }

  checkUserLogin(): void {
    this.authService.login().subscribe({
      next: (userData: any) => {
        this.user = userData.data;
      },
      error: (err) => {
        console.error('Login failed', err);
      },
    });
  }

  login() {
    window.location.href = environment.apiUrl + '/v1/auth/google/login';
  }

  logout() {
    this.authService.logout().subscribe({
      next: (logoutData) => {
        if (logoutData.status === 200) {
          this.user = null;
          window.location.reload();
        }
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }
}
