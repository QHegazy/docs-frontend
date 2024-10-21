import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private http: HttpClient = inject(HttpClient);
  api = environment.apiUrl;
  docAPI = this.api + '/v1/doc';
  getDocById(id: string) {
    return this.http.get<any>(`${this.docAPI}/${id}`);
  }

  createDoc(message: object) {
    return this.http.post<any>(this.docAPI, message);
  }
}
