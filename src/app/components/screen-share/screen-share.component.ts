import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalingService } from '../../services/signaling.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-screen-share',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './screen-share.component.html',
  styleUrl: './screen-share.component.scss'
})
export class ScreenShareComponent implements OnInit, OnDestroy{
  private peerConnections: { [key: string]: RTCPeerConnection } = {};
  private localStream: MediaStream | null = null;
  roomId: string | null = null;
  userId: string = 'user-' + Math.random().toString(36).substr(2, 9);
  isScreenSharing: boolean = false;
  users: string[] = [];

  constructor(private signalingService: SignalingService) {
    this.signalingService.onSignal(this.handleSignal.bind(this));
    this.signalingService.onUserConnected(this.handleUserConnected.bind(this));
    this.signalingService.onUserDisconnected(this.handleUserDisconnected.bind(this));
  }

  ngOnInit() {
    console.log('ScreenShareComponent initialized');
  }

  ngOnDestroy() {
    this.stopScreenShare();
  }

  createRoom() {
    this.signalingService.createRoom((roomId: string) => {
      this.roomId = roomId;
      console.log(`Room created with ID: ${roomId}`);
    });
  }

  joinRoom() {
    if (this.roomId) {
      console.log(`Joining room with ID: ${this.roomId}`);
      this.signalingService.joinRoom(this.roomId, this.userId);
    }
  }

  async startScreenShare() {
    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      this.isScreenSharing = true;
      console.log('Screen sharing started');
      const localVideoElement = document.getElementById('localVideo') as HTMLVideoElement;
      localVideoElement.srcObject = this.localStream;
      this.broadcastStream();
    } catch (error) {
      console.error('Error accessing display media.', error);
    }
  }

  stopScreenShare() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      this.isScreenSharing = false;
      console.log('Screen sharing stopped');
    }
  }

  async broadcastStream() {
    if (!this.localStream || !this.roomId) return;

    console.log(`Broadcasting stream to ${Object.keys(this.peerConnections).length} peers`);
    for (let userId in this.peerConnections) {
      let peerConnection = this.peerConnections[userId];
      this.localStream.getTracks().forEach(track => {
        if (!peerConnection.getSenders().find(sender => sender.track === track)) {
          peerConnection.addTrack(track, this.localStream!);
          console.log(`Track added to peer connection with userId: ${userId}`);
        } else {
          console.log(`Track already exists in peer connection with userId: ${userId}`);
        }
      });
    }

    this.signalingService.sendSignal({
      type: 'new-stream',
      room: this.roomId,
      userId: this.userId
    });
  }

  async handleSignal(data: any) {
    console.log(`Signal received: ${JSON.stringify(data)}`);
    let peerConnection: RTCPeerConnection | undefined = this.peerConnections[data.userId];

    if (!peerConnection) {
      peerConnection = this.createPeerConnection(data.userId);
      this.peerConnections[data.userId] = peerConnection;
    }

    if (data.offer) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      console.log('Remote description set');
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log('Local description set with answer');
      this.signalingService.sendSignal({ room: data.room, answer, userId: this.userId });
    } else if (data.answer) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log('Remote description set with answer');
    } else if (data.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      console.log('ICE candidate added');
    } else if (data.type === 'new-stream' && this.isScreenSharing && this.localStream) {
      console.log('Adding tracks to new peer connection');
      this.localStream.getTracks().forEach(track => {
        if (!peerConnection!.getSenders().find(sender => sender.track === track)) {
          peerConnection!.addTrack(track, this.localStream!);
          console.log(`Track added to peer connection with userId: ${data.userId}`);
        } else {
          console.log(`Track already exists in peer connection with userId: ${data.userId}`);
        }
      });
    }
  }

  handleUserConnected(data: any) {
    console.log(`User connected: ${data.userId}, Users: ${data.users.join(', ')}`);
    this.users = data.users;
    this.updatePeerConnections(data.users);
  }

  handleUserDisconnected(data: any) {
    console.log(`User disconnected: ${data.userId}, Users: ${data.users.join(', ')}`);
    this.users = data.users;
  }

  updatePeerConnections(users: string[]) {
    console.log(`Updating peer connections for users: ${users.join(', ')}`);
    users.forEach(userId => {
      if (!this.peerConnections[userId]) {
        this.peerConnections[userId] = this.createPeerConnection(userId);
      }
    });
  }

  createPeerConnection(userId: string): RTCPeerConnection {
    console.log(`Creating peer connection for userId: ${userId}`);
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:your.turn.server', username: 'user', credential: 'pass' }
      ]
    });

    this.peerConnections[userId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`ICE candidate generated for userId: ${userId}`);
        this.signalingService.sendSignal({ candidate: event.candidate, room: this.roomId, userId: this.userId });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log(`Track received from userId: ${userId}`);
      const remoteVideoElement = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (!remoteVideoElement.srcObject || remoteVideoElement.srcObject !== event.streams[0]) {
        remoteVideoElement.srcObject = event.streams[0];
        console.log(`Remote video stream set for userId: ${userId}`);
      } else {
        console.log(`Remote video stream already set for userId: ${userId}`);
      }
    };

    return peerConnection;
  }
}