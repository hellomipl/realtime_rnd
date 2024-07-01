import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {
  private peerConnection: RTCPeerConnection | null = null;
  public roomId: string = '';
  public viewerId: string = '';

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.viewerId = this.socketService.getViewerId();
    this.setupViewer();
  }

  ngOnDestroy(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }

  joinRoom() {
    this.socketService.joinRoom(this.roomId);
    this.log(`Joining room with ID: ${this.roomId} as viewer: ${this.viewerId}`);
  }

  setupViewer() {
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:161.97.153.182:3478',
        username: 'turnuser',
        credential: 'turnpassword'
      }
    ];

    this.peerConnection = new RTCPeerConnection({ iceServers });

    this.peerConnection.ontrack = (event) => {
      const video = document.getElementById('remoteVideo') as HTMLVideoElement;
      video.srcObject = event.streams[0];
      this.log(`Received track`);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.sendCandidate(this.roomId, this.viewerId, event.candidate);
        this.log(`Sending ICE candidate: ${JSON.stringify(event.candidate)}`);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      this.log(`ICE connection state: ${this.peerConnection?.iceConnectionState}`);
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.log(`Connection state change: ${this.peerConnection?.connectionState}`);
      if (this.peerConnection?.connectionState === 'connected') {
        this.log(`Peers connected`);
      }
    };

    this.socketService.onOffer(({ viewerId, offer }) => {
      this.log(`Received offer from presenter: ${JSON.stringify(offer)}`);
      if (offer) {
        this.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
          return this.peerConnection?.createAnswer();
        }).then((answer) => {
          return this.peerConnection?.setLocalDescription(answer);
        }).then(() => {
          this.socketService.sendAnswer(this.roomId, this.viewerId, this.peerConnection?.localDescription);
          this.log(`Sending answer to presenter: ${JSON.stringify(this.peerConnection?.localDescription)}`);
        }).catch((error) => {
          this.log(`Error setting remote description or creating answer: ${error}`);
        });
      }
    });

    this.socketService.onCandidate(({ viewerId, candidate }) => {
      this.log(`Received ICE candidate from presenter: ${JSON.stringify(candidate)}`);
      if (candidate) {
        this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate)).catch((error) => {
          this.log(`Error adding ICE candidate: ${error}`);
        });
      }
    });

    this.socketService.onRoomNotFound(() => {
      this.log(`Room not found`);
    });
  }

  log(message: string) {
    const logElement = document.getElementById('log');
    if (logElement) {
      logElement.innerHTML += `<p>${message}</p>`;
    }
    console.log(message);
  }
}
