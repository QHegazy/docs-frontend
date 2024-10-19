import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserData } from '../../app/newTypes/user-data';
import { AuthResponse } from '../../app/newTypes/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  private apiUserData = `${environment.apiUrl}/v1/authorize`;
  private userData = new BehaviorSubject<UserData | null>(null);

  private loginState = new BehaviorSubject<boolean>(false);

  constructor() {}

  get isLoggedIn(): Observable<boolean> {
    return this.loginState.asObservable();
  }

  login(): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(this.apiUserData, { withCredentials: true })
      .pipe(
        tap((res: AuthResponse) => {
          if (res.status === 200) {
            this.userData.next(res.data);
            this.loginState.next(true);
          } else {
            this.loginState.next(false);
            throw new Error(res.message);
          }
        }),
        catchError((error) => {
          console.error('Login failed', error);
          return throwError(() => new Error('Login failed: ' + error.message));
        })
      );
  }

  logout() {
    const logoutPath = `${environment.apiUrl}/v1/logout`;
    return this.http.post<any>(logoutPath, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.loginState.next(false);
        this.userData.next(null);
      }),
      catchError((error) => {
        console.error('Logout failed', error);
        return throwError(() => new Error('Logout failed: ' + error.message));
      })
    );
  }
}
