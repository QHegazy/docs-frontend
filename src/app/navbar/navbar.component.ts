import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  user = '';
  private authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    this.checkUserLogin();
  }

  checkUserLogin(): void {
    this.authService.isLoggedIn.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.user = 'user';
      }
    });
  }

  login() {
    window.location.href = environment.apiUrl + '/v1/auth/google/login';
    // this.authService.login().subscribe({
    //   next: () => {
    //     console.log('User logged in successfully');
    //   },
    //   error: (err) => {
    //     console.error('Login failed', err);
    //   },
    // });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.user = 'Guest';
        console.log('User logged out successfully');
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }
}
