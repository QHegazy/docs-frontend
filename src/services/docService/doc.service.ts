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
  retrieveUserOwnDocs() {
    return this.http
      .get<any>(`${this.docAPI}/own`)
      .pipe(catchError(this.handleError));
  }

  retrieveUserSharedDocs() {
    return this.http
      .get<any>(`${this.docAPI}/shared`)
      .pipe(catchError(this.handleError));
  }

  retrieveUserRecentDocs() {
    return this.http
      .get<any>(`${this.docAPI}/recent`)
      .pipe(catchError(this.handleError));
  }
  getDocuments(filter: string) {
    switch (filter) {
      case 'owned':
        return this.retrieveUserOwnDocs();
      case 'shared':
        return this.retrieveUserSharedDocs();
      case 'recent':
        return this.retrieveUserRecentDocs();
      default:
        return this.retrieveUserRecentDocs();
    }
  }
  getDocById(id: string) {
    return this.http
      .get<any>(`${this.docAPI}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create a new document
  createDoc(data: any) {
    console.log(data);
    return this.http
      .post<any>(
        this.docAPI,
        { title: data.title, public: data.permission },
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
