import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, Observable, single, throwError } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UUID } from 'crypto';
import { QuillDoc } from '../../app/newTypes/doc';
import { ApiResponse } from '../../app/newTypes/user-data';
@Injectable({
  providedIn: 'root',
})
export class DocServiceCommunication {
  private socket!: Socket;
  private http: HttpClient = inject(HttpClient);
  private api = environment.apiUrl;
  private docAPI = `${this.api}/v1/doc`;
  private defaultOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    withCredentials: true,
  };
  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeSocket();
    }
  }

  private initializeSocket() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('Socket connected with id:', this.socket.id);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  sendMessage(message: string) {
    if (this.socket) {
      this.socket.emit('message', message, (ack: any) => {});
    } else {
      console.error('Socket is not initialized');
    }
  }

  sendtoroom(room: string, message: any) {
    if (this.socket) {
      this.socket.emit('sendRoom', room, message);
    }
  }

  joinroom(room: string) {
    if (this.socket) {
      this.socket.emit('joinRoom', room);
    }
  }

  getRoomMessage(): Observable<any> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('RoomMessage', (message: any) => {
          observer.next(message);
        });
      } else {
        console.error('Socket is not initialized');
      }
    });
  }
  getDocMessage(id: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/doc/${id}`);
  }

  saveDocById(id: string, message: object) {
    if (this.socket) {
      this.socket.emit('save-doc', id, message);
    }
  }
  getMessage(): Observable<any> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('message', (message: any) => {
          observer.next(message);
        });
      } else {
        console.error('Socket is not initialized');
      }
    });
  }
  syncWithServer(docId: string): Observable<QuillDoc> {
    return this.http
      .get<ApiResponse<{ document_name: string; mongo_id: string }>>(
        `${this.docAPI}/${docId}`,
        this.defaultOptions
      )
      .pipe(
        map((response) => {
          const { document_name, mongo_id } = response.data;
          return {
            title: document_name,
            mongoId: mongo_id,
          } as QuillDoc;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error syncing with server:', error);
          return throwError(() => new Error('Failed to sync with server'));
        })
      );
  }
}
