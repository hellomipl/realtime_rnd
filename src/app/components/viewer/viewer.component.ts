import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss'
})
export class ViewerComponent implements OnInit {

  private peerConnection: RTCPeerConnection | null = null;
  public roomId: string = '';

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.setupViewer();
  }

  ngOnDestroy(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }

  joinRoom() {
    console.log(`Joining room ${this.roomId}`);
    this.socketService.joinRoom(this.roomId);
  }

  setupViewer() {
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
      {
        urls: 'turn:<your-ip>:3478', // TURN server without SSL
        username: '<your-username>',
        credential: '<your-password>'
      }
    ];

    this.peerConnection = new RTCPeerConnection({ iceServers });

    this.peerConnection.ontrack = (event) => {
      console.log('Received track from presenter');
      const video = document.getElementById('remoteVideo') as HTMLVideoElement;
      video.srcObject = event.streams[0];
      video.play().then(() => {
        console.log('Video playback started');
      }).catch((error) => {
        console.error('Error attempting to play:', error);
      });
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        this.socketService.sendCandidate(this.roomId, event.candidate);
      }
    };

    this.socketService.onOffer((offer) => {
      if (offer) {
        console.log('Received offer from server');
        const remoteDesc = new RTCSessionDescription(offer);
        this.peerConnection?.setRemoteDescription(remoteDesc).then(() => {
          return this.peerConnection?.createAnswer();
        }).then((answer) => {
          this.peerConnection?.setLocalDescription(answer);
          this.socketService.sendAnswer(this.roomId, answer);
        }).catch((error) => {
          console.error('Error setting remote description or creating answer:', error);
        });
      } else {
        console.error('Received null offer');
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

    this.socketService.onRoomNotFound(() => {
      console.error('Room not found');
    });
  }
}