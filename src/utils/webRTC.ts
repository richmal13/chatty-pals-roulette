import { supabase } from "@/integrations/supabase/client";

export class WebRTCConnection {
  private peerConnection: RTCPeerConnection;
  private roomId: string | null = null;
  private userId: string;
  private partnerId: string | null = null;

  constructor(
    userId: string,
    private onRemoteStream: (stream: MediaStream) => void,
    private onError: (error: string) => void
  ) {
    this.userId = userId;
    this.initialize();
  }

  private async initialize() {
    try {
      const { data, error } = await supabase.functions.invoke('dtelecom', {
        body: { action: 'createRoom' }
      });

      if (error) {
        console.error('Error initializing dTelecom:', error);
        this.onError('Failed to initialize video chat');
        return;
      }

      this.roomId = data.roomId;
      this.setupWebRTC(data.configuration);
    } catch (error) {
      console.error('Error initializing dTelecom:', error);
      this.onError('Failed to initialize video chat');
    }
  }

  private setupWebRTC(configuration: RTCConfiguration) {
    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.ontrack = (event) => {
      this.onRemoteStream(event.streams[0]);
    };

    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          await this.sendIceCandidate(event.candidate);
        } catch (error) {
          console.error('Error sending ICE candidate:', error);
        }
      }
    };
  }

  private async sendIceCandidate(candidate: RTCIceCandidate) {
    if (!this.roomId) return;

    try {
      await supabase.functions.invoke('dtelecom', {
        body: {
          action: 'sendCandidate',
          roomId: this.roomId,
          candidate
        }
      });
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }

  async addLocalStream(stream: MediaStream) {
    if (!this.peerConnection) return;
    
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });
  }

  async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const { error } = await supabase.functions.invoke('dtelecom', {
        body: {
          action: 'sendOffer',
          roomId: this.roomId,
          offer
        }
      });

      if (error) {
        console.error('Error sending offer:', error);
        this.onError('Failed to establish connection');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      this.onError('Failed to establish connection');
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      this.onError('Failed to establish connection');
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      const { error } = await supabase.functions.invoke('dtelecom', {
        body: {
          action: 'sendAnswer',
          roomId: this.roomId,
          answer
        }
      });

      if (error) {
        console.error('Error sending answer:', error);
        this.onError('Failed to establish connection');
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      this.onError('Failed to establish connection');
    }
  }

  setRoomInfo(roomId: string, partnerId: string) {
    this.roomId = roomId;
    this.partnerId = partnerId;
  }

  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }
}