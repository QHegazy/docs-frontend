import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class DocServiceService {
  private socket: any;

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
      this.socket.emit('message', message, (ack: any) => {
        console.log(ack);
      });
    } else {
      console.error('Socket is not initialized');
    }
  }

  sendtoroom(room: string, message: string) {
    if (this.socket) {
      this.socket.emit('sendRoom', room, message);
    }
  }

  joinroom(room: string) {
    if (this.socket) {
      this.socket.emit('joinRoom', room);
    }
  }

  getMessage(): Observable<any> {
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
}
