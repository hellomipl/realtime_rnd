import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;

  constructor() {
    //this.socket = io('http://192.168.1.21:4000');
    this.socket = io('https://etabella.legal',{path:'/sharingapp/'});
  }
  public createRoom(roomId: string) {
    this.socket.emit('create-room', roomId);
  }

  public joinRoom(roomId: string) {
    console.log(`Emitting join-room for ${roomId}`);
    this.socket.emit('join-room', roomId);
  }

  public sendOffer(roomId: string, offer: any) {
    console.log(`Emitting offer for ${roomId}`);
    this.socket.emit('offer', { roomId, offer });
  }

  public sendAnswer(roomId: string, answer: any) {
    console.log(`Emitting answer for ${roomId}`);
    this.socket.emit('answer', { roomId, answer });
  }

  public sendCandidate(roomId: string, candidate: any) {
    console.log(`Emitting candidate for ${roomId}`);
    this.socket.emit('candidate', { roomId, candidate });
  }

  public onOffer(callback: (offer: any) => void) {
    this.socket.on('offer', (offer) => {
      console.log('Received offer');
      callback(offer);
    });
  }

  public onAnswer(callback: (answer: any) => void) {
    this.socket.on('answer', (answer) => {
      console.log('Received answer');
      callback(answer);
    });
  }

  public onCandidate(callback: (candidate: any) => void) {
    this.socket.on('candidate', (candidate) => {
      console.log('Received candidate');
      callback(candidate);
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

  public onViewerJoined(callback: (viewers: string[]) => void) {
    this.socket.on('viewer-joined', (viewers) => {
      console.log('A viewer joined the room');
      callback(viewers);
    });
  }

  public onViewerLeft(callback: (viewers: string[]) => void) {
    this.socket.on('viewer-left', (viewers) => {
      console.log('A viewer left the room');
      callback(viewers);
    });
  }
}