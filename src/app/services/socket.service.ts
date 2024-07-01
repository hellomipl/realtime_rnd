import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;
  private viewerId: string = '';

  constructor() {
    //this.socket = io('https://etabella.legal', { path: '/sharingapp/' });
    this.socket = io('http://localhost:4000');
    this.viewerId = this.generateViewerId();
  }

  private generateViewerId() {
    return Math.random().toString(36).substring(2, 10);
  }

  public getViewerId() {
    return this.viewerId;
  }

  public createRoom(roomId: string) {
    this.socket.emit('create-room', roomId);
  }

  public joinRoom(roomId: string) {
    this.socket.emit('join-room', { roomId, viewerId: this.viewerId });
  }

  public sendOffer(roomId: string, viewerId: string, offer: any) {
    this.socket.emit('offer', { roomId, viewerId, offer });
  }

  public sendAnswer(roomId: string, viewerId: string, answer: any) {
    this.socket.emit('answer', { roomId, viewerId, answer });
  }

  public sendCandidate(roomId: string, viewerId: string, candidate: any) {
    this.socket.emit('candidate', { roomId, viewerId, candidate });
  }

  public onOffer(callback: (data: { viewerId: string, offer: any }) => void) {
    this.socket.on('offer', (data) => {
      callback(data);
    });
  }

  public onAnswer(callback: (data: { viewerId: string, answer: any }) => void) {
    this.socket.on('answer', (data) => {
      callback(data);
    });
  }

  public onCandidate(callback: (data: { viewerId: string, candidate: any }) => void) {
    this.socket.on('candidate', (data) => {
      callback(data);
    });
  }

  public onRoomNotFound(callback: () => void) {
    this.socket.on('room-not-found', () => {
      callback();
    });
  }

  public onRoomCreated(callback: (roomId: string) => void) {
    this.socket.on('room-created', (roomId) => {
      callback(roomId);
    });
  }

  public onViewerJoined(callback: (data: { viewers: string[], viewerId: string }) => void) {
    this.socket.on('viewer-joined', (data) => {
      callback(data);
    });
  }

  public onViewerLeft(callback: (viewers: string[]) => void) {
    this.socket.on('viewer-left', (viewers) => {
      callback(viewers);
    });
  }
}
