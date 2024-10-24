import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { UserData } from '../newTypes/user-data';
import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthResponse } from '../newTypes/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  user?: UserData | null;
  isLoading = true;
  error: string | null = null;
  private authService: AuthService = inject(AuthService);
  private subscription = new Subscription();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.checkUserLogin();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  checkUserLogin(): void {
    if (!this.isBrowser) return;

    this.isLoading = true;
    this.error = null;

    this.subscription.add(
      this.authService.login().subscribe({
        next: (userData: AuthResponse) => {
          this.user = userData.data;
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.error = err.message;
          this.user = null;
          this.isLoading = false;
        },
      })
    );
  }

  login(): void {
    this.authService.initiateGoogleLogin();
  }

  logout(): void {
    if (!this.isBrowser) return;

    this.isLoading = true;
    this.error = null;

    this.subscription.add(
      this.authService.logout().subscribe({
        next: () => {
          this.user = null;
          this.isLoading = false;
          if (this.isBrowser) {
            window.location.reload();
          }
        },
        error: (err: Error) => {
          this.error = err.message;
          this.isLoading = false;
        },
      })
    );
  }
}
