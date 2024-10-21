import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DocServiceCommunication {
  private socket!: Socket;
  private http: HttpClient = inject(HttpClient);

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
  getDocMessage(): Observable<any> {
    return this.http.get<any>(
      'http://localhost:3000/doc/670e7027d2ebe79b16092671'
    );
  }

  saveDocById(id: string, message: object) {
    if (this.socket) {
      this.socket.emit('save-doc', message);
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
}
