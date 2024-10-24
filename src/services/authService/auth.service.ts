import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserData } from '../../app/newTypes/user-data';
import { AuthResponse } from '../../app/newTypes/auth';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  private apiUserData = `${environment.apiUrl}/v1/authorize`;
  private userData = new BehaviorSubject<UserData | null>(null);
  private loginState = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;
  private authCheckInProgress: Observable<AuthResponse> | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser && this.getStorageItem('isAuthenticated') === 'true') {
      this.loginState.next(true);
    }
  }

  private setStorageItem(key: string, value: string): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('Local storage is not available:', e);
      }
    }
  }

  private getStorageItem(key: string): string | null {
    if (this.isBrowser) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('Local storage is not available:', e);
        return null;
      }
    }
    return null;
  }

  private removeStorageItem(key: string): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Local storage is not available:', e);
      }
    }
  }

  private clearAuthState(): void {
    if (this.isBrowser) {
      this.removeStorageItem('isAuthenticated');
      this.removeStorageItem('redirectUrl');
    }
    this.loginState.next(false);
    this.userData.next(null);
  }

  get isLoggedIn(): Observable<boolean> {
    return this.loginState.asObservable();
  }

  get currentUser(): Observable<UserData | null> {
    return this.userData.asObservable();
  }

  login(): Observable<AuthResponse> {
    // If we're not in a browser environment, return a dummy response
    if (!this.isBrowser) {
      return of({
        status: 401,
        data: null as unknown as UserData,
        message: 'Server-side rendering',
      } as AuthResponse);
    }

    // If there's already an auth check in progress, return that instead of making a new request
    if (this.authCheckInProgress) {
      return this.authCheckInProgress;
    }

    // Start a new auth check
    this.authCheckInProgress = this.http
      .get<AuthResponse>(this.apiUserData, {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        tap((res: AuthResponse) => {
          if (res && res.status === 200) {
            this.userData.next(res.data);
            this.loginState.next(true);
            this.setStorageItem('isAuthenticated', 'true');
          } else {
            this.clearAuthState();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          this.clearAuthState();
          if (error.status === 401) {
            return throwError(
              () =>
                new Error('Session expired or invalid. Please log in again.')
            );
          }
          return throwError(
            () =>
              new Error(
                `Login failed: ${error.error?.message || error.message}`
              )
          );
        }),
        shareReplay(1)
      );

    // Clear the in-progress check when it completes
    this.authCheckInProgress.subscribe({
      complete: () => {
        this.authCheckInProgress = null;
      },
    });

    return this.authCheckInProgress;
  }

  initiateGoogleLogin(): void {
    if (!this.isBrowser) return;
    this.setStorageItem('redirectUrl', window.location.pathname);
    window.location.href = `${environment.apiUrl}/v1/auth/google/login`;
  }

  logout(): Observable<any> {
    const logoutPath = `${environment.apiUrl}/v1/logout`;
    return this.http
      .post<any>(
        logoutPath,
        {},
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        tap(() => {
          this.clearAuthState();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Logout failed', error);
          this.clearAuthState();
          return throwError(
            () =>
              new Error(
                `Logout failed: ${error.error?.message || error.message}`
              )
          );
        })
      );
  }
}
