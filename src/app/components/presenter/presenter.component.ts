import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-presenter',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './presenter.component.html',
  styleUrl: './presenter.component.scss'
})
export class PresenterComponent implements OnInit {
  private peerConnection: RTCPeerConnection | null = null;
  public roomId: string = '';
  public viewers: string[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.onRoomCreated((roomId) => {
      this.roomId = roomId;
      this.startSharing();
    });

    this.socketService.onViewerJoined((viewers) => {
      this.viewers = viewers;
      this.sendOffer();
    });

    this.socketService.onViewerLeft((viewers) => {
      this.viewers = viewers;
    });
  }

  ngOnDestroy(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }

  createRoom() {
    this.roomId = this.generateRoomId();
    console.log(`Creating room ${this.roomId}`);
    this.socketService.createRoom(this.roomId);
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 10);
  }

  startSharing() {
    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
      const video = document.getElementById('localVideo') as HTMLVideoElement;
      video.srcObject = stream;
  
      const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
        {
          urls: 'turn:161.97.153.182:3478', // TURN server without SSL
          username: 'turnuser',
          credential: 'turnpassword'
        }
      ];
  
      this.peerConnection = new RTCPeerConnection({ iceServers });
  
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          this.socketService.sendCandidate(this.roomId, event.candidate);
        }
      };
  
      stream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, stream);
      });
  
      this.sendOffer();
    }).catch((error) => {
      console.error('Error accessing display media:', error);
    });
  }
  

  sendOffer() {
    if (!this.peerConnection) return;

    this.peerConnection.createOffer().then((offer) => {
      this.peerConnection?.setLocalDescription(offer);
      this.socketService.sendOffer(this.roomId, offer);
    }).catch((error) => {
      console.error('Error creating offer:', error);
    });

    this.socketService.onAnswer((answer) => {
      if (this.peerConnection?.signalingState === "have-local-offer") {
        const remoteDesc = new RTCSessionDescription(answer);
        this.peerConnection.setRemoteDescription(remoteDesc).catch((error) => {
          console.error('Error setting remote description:', error);
        });
      } else {
        console.warn('Ignoring answer because signaling state is', this.peerConnection?.signalingState);
      }
    });

    this.socketService.onCandidate((candidate) => {
      if (candidate && candidate.sdpMid !== null && candidate.sdpMLineIndex !== null) {
        console.log('Received ICE candidate from server');
        const rtcCandidate = new RTCIceCandidate(candidate);
        this.peerConnection?.addIceCandidate(rtcCandidate).catch((error) => {
          console.error('Error adding ICE candidate:', error);
        });
      } else {
        console.error('Received invalid candidate:', candidate);
      }
    });
  }
}