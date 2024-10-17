import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  oauthpath = environment.apiUrl + '/v1/auth/google/login';
  private loginState = new BehaviorSubject<boolean>(false);

  constructor() {}

  get isLoggedIn(): Observable<boolean> {
    return this.loginState.asObservable();
  }

  login() {
    return this.http
      .get<any>(this.oauthpath, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.loginState.next(true);
        })
      );
  }

  logout() {
    const logoutPath = environment.apiUrl + 'v1/auth/logout';
    return this.http.post<any>(logoutPath, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.loginState.next(false);
      })
    );
  }
}
