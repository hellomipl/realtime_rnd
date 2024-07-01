import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-presenter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.scss']
})
export class PresenterComponent implements OnInit, OnDestroy {
  private peerConnections: { [key: string]: RTCPeerConnection } = {};
  public roomId: string = '';
  public viewers: string[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.onRoomCreated((roomId) => {
      this.roomId = roomId;
      this.startSharing();
      this.log(`Room created with ID: ${roomId}`);
    });

    this.socketService.onViewerJoined(({ viewers, viewerId }) => {
      this.viewers = viewers;
      this.log(`Viewers joined: ${viewers.join(', ')} (Current viewer: ${viewerId})`);
      this.createPeerConnection(viewerId);
      this.sendOffer(viewerId);
    });

    this.socketService.onViewerLeft((viewers) => {
      this.viewers = viewers;
      this.log(`Viewers left: ${viewers.join(', ')}`);
      viewers.forEach(viewerId => {
        if (this.peerConnections[viewerId]) {
          this.peerConnections[viewerId].close();
          delete this.peerConnections[viewerId];
        }
      });
    });

    this.socketService.onAnswer(({ viewerId, answer }) => {
      this.log(`Received answer from viewer ${viewerId}: ${JSON.stringify(answer)}`);
      const peerConnection = this.peerConnections[viewerId];
      if (peerConnection && peerConnection.signalingState === "have-local-offer") {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          .then(() => this.log(`Set remote description for viewer ${viewerId}`))
          .catch(error => this.log(`Error setting remote description for viewer ${viewerId}: ${error}`));
      } else {
        this.log(`Skipping setting remote description for viewer ${viewerId}, signaling state: ${peerConnection?.signalingState}`);
      }
    });

    this.socketService.onCandidate(({ viewerId, candidate }) => {
      this.log(`Received ICE candidate from viewer ${viewerId}: ${JSON.stringify(candidate)}`);
      const peerConnection = this.peerConnections[viewerId];
      if (peerConnection && candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => this.log(`Added ICE candidate for viewer ${viewerId}`))
          .catch(error => this.log(`Error adding ICE candidate for viewer ${viewerId}: ${error}`));
      }
    });
  }

  ngOnDestroy(): void {
    Object.values(this.peerConnections).forEach(pc => pc.close());
  }

  createRoom() {
    this.roomId = this.generateRoomId();
    this.log(`Creating room with ID: ${this.roomId}`);
    this.socketService.createRoom(this.roomId);
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 10);
  }

  startSharing() {
    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
      const video = document.getElementById('localVideo') as HTMLVideoElement;
      video.srcObject = stream;
      this.log(`Started sharing screen`);

      this.viewers.forEach(viewerId => {
        this.createPeerConnection(viewerId, stream);
        this.sendOffer(viewerId);
      });
    }).catch((error) => {
      this.log(`Error accessing display media: ${error}`);
    });
  }

  createPeerConnection(viewerId: string, stream?: MediaStream) {
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:161.97.153.182:3478',
        username: 'turnuser',
        credential: 'turnpassword'
      }
    ];

    const peerConnection = new RTCPeerConnection({ iceServers });
    this.peerConnections[viewerId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.sendCandidate(this.roomId, viewerId, event.candidate);
        this.log(`Sending ICE candidate to viewer ${viewerId}: ${JSON.stringify(event.candidate)}`);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      this.log(`ICE connection state for viewer ${viewerId}: ${peerConnection.iceConnectionState}`);
    };

    if (stream) {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
        this.log(`Added track ${track.kind} to peer connection for viewer ${viewerId}`);
      });
    }

    peerConnection.onconnectionstatechange = () => {
      this.log(`Connection state change: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'connected') {
        this.log(`Peers connected for viewer ${viewerId}`);
      }
    };
  }

  sendOffer(viewerId: string) {
    const peerConnection = this.peerConnections[viewerId];
    if (!peerConnection) return;

    peerConnection.createOffer().then((offer) => {
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
      this.socketService.sendOffer(this.roomId, viewerId, peerConnection.localDescription);
      this.log(`Sending offer to viewer ${viewerId}: ${JSON.stringify(peerConnection.localDescription)}`);
    }).catch((error) => {
      this.log(`Error creating offer: ${error}`);
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
