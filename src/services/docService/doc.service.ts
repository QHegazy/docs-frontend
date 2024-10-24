import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private http: HttpClient = inject(HttpClient);
  private api = environment.apiUrl;
  private docAPI = `${this.api}/v1/doc`;
  getDocById(id: string) {
    return this.http
      .get<any>(`${this.docAPI}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create a new document
  createDoc(title: string) {
    return this.http
      .post<any>(
        this.docAPI,
        { title: title },
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          withCredentials: true,
        }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error(error.message || 'Something went wrong!')
    );
  }
}
