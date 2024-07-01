import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket;

  constructor() {
  this.socket = io('http://192.168.1.21:4000');
    //this.socket = io('https://etabella.legal',{path:'/sharingapp/'});
  }
  public createRoom(roomId: string) {
    this.socket.emit('create-room', roomId);
  }

  public joinRoom(roomId: string) {
    console.log(`Emitting join-room for ${roomId}`);
    this.socket.emit('join-room', roomId);
  }

  public sendOffer(roomId: string, viewerId: string, offer: any) {
    console.log(`Emitting offer for ${roomId} to viewer ${viewerId}`);
    this.socket.emit('offer', { roomId, viewerId, offer });
  }

  public sendAnswer(roomId: string, answer: any) {
    console.log(`Emitting answer for ${roomId}`);
    this.socket.emit('answer', { roomId, answer });
  }

  public sendCandidate(roomId: string, viewerId: string, candidate: any) {
    console.log(`Emitting candidate for ${roomId} to viewer ${viewerId}`);
    this.socket.emit('candidate', { roomId, viewerId, candidate });
  }

  public onOffer(callback: (offer: any) => void) {
    this.socket.on('offer', (offer) => {
      console.log('Received offer');
      callback(offer);
    });
  }

  public onAnswer(callback: (viewerId: string, answer: any) => void) {
    this.socket.on('answer', (viewerId, answer) => {
      console.log(`Received answer from viewer ${viewerId}`);
      callback(viewerId, answer);
    });
  }

  public onCandidate(callback: (viewerId: string, candidate: any) => void) {
    this.socket.on('candidate', (viewerId, candidate) => {
      console.log(`Received candidate from viewer ${viewerId}`);
      callback(viewerId, candidate);
    });
  }

  public onRoomNotFound(callback: () => void) {
    this.socket.on('room-not-found', () => {
      console.log('Received room-not-found');
      callback();
    });
  }

  public onRoomCreated(callback: (roomId: string) => void) {
    this.socket.on('room-created', (roomId) => {
      console.log(`Room created: ${roomId}`);
      callback(roomId);
    });
  }

  public onViewerJoined(callback: (viewerId: string) => void) {
    this.socket.on('viewer-joined', (viewerId) => {
      console.log(`Viewer joined: ${viewerId}`);
      callback(viewerId);
    });
  }

  public onViewerLeft(callback: (viewerId: string) => void) {
    this.socket.on('viewer-left', (viewerId) => {
      console.log(`Viewer left: ${viewerId}`);
      callback(viewerId);
    });
  }
}