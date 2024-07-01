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
  private peerConnections: { [viewerId: string]: RTCPeerConnection } = {};
  public roomId: string = '';
  public viewers: string[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.onRoomCreated((roomId) => {
      this.roomId = roomId;
      this.startSharing();
    });

    this.socketService.onViewerJoined((viewerId) => {
      this.viewers.push(viewerId);
      this.createPeerConnection(viewerId);
    });

    this.socketService.onViewerLeft((viewerId) => {
      this.viewers = this.viewers.filter(id => id !== viewerId);
      if (this.peerConnections[viewerId]) {
        this.peerConnections[viewerId].close();
        delete this.peerConnections[viewerId];
      }
    });

    this.socketService.onAnswer((data:any) => {
      const { viewerId, answer } = data;
      const peerConnection = this.peerConnections[viewerId];
      if (peerConnection) {
        const remoteDesc = new RTCSessionDescription(answer);
        peerConnection.setRemoteDescription(remoteDesc).catch((error) => {
          console.error('Error setting remote description:', error);
        });
      } else {
        console.error('PeerConnection not found for viewer', viewerId);
      }
    });

    this.socketService.onCandidate((data:any) => {
      const { viewerId, candidate } = data;
      const peerConnection = this.peerConnections[viewerId];
      if (peerConnection) {
        const rtcCandidate = new RTCIceCandidate(candidate);
        peerConnection.addIceCandidate(rtcCandidate).catch((error) => {
          console.error('Error adding ICE candidate:', error);
        });
      } else {
        console.error('PeerConnection not found for viewer', viewerId);
      }
    });
  }

  ngOnDestroy(): void {
    for (let viewerId in this.peerConnections) {
      this.peerConnections[viewerId].close();
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

      this.viewers.forEach(viewerId => {
        this.createPeerConnection(viewerId);
        stream.getTracks().forEach(track => {
          this.peerConnections[viewerId].addTrack(track, stream);
        });
      });
    }).catch((error) => {
      console.error('Error accessing display media:', error);
    });
  }

  createPeerConnection(viewerId: string) {
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:161.97.153.182:3478',
        username: 'turnuser',
        credential: 'turnpassword'
      }
    ];

    const peerConnection = new RTCPeerConnection({ iceServers });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.sendCandidate(this.roomId, viewerId, event.candidate);
      }
    };

    this.peerConnections[viewerId] = peerConnection;

    peerConnection.createOffer().then((offer) => {
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
      this.socketService.sendOffer(this.roomId, viewerId, peerConnection.localDescription);
    }).catch((error) => {
      console.error('Error creating offer:', error);
    });
  }
}