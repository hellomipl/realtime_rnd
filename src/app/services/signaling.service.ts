import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://192.168.1.21:3000';

  constructor() {
    this.socket = io(this.SERVER_URL);
  }

  createRoom(callback: (roomId: string) => void) {
    this.socket.emit('create-room', callback);
  }

  joinRoom(roomId: string, userId: string) {
    this.socket.emit('join-room', roomId, userId);
  }

  onUserConnected(callback: (data: any) => void) {
    this.socket.on('user-connected', callback);
  }

  onUserDisconnected(callback: (data: any) => void) {
    this.socket.on('user-disconnected', callback);
  }

  sendSignal(data: any) {
    this.socket.emit('signal', data);
  }

  onSignal(callback: (data: any) => void) {
    this.socket.on('signal', callback);
  }
}
