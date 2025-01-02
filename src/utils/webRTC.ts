import { supabase } from "@/integrations/supabase/client";

export class WebRTCConnection {
  private peerConnection: RTCPeerConnection;
  private roomId: string | null = null;
  private userId: string;
  private partnerId: string | null = null;

  constructor(
    userId: string,
    private onRemoteStream: (stream: MediaStream) => void
  ) {
    this.userId = userId;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    this.peerConnection.ontrack = (event) => {
      this.onRemoteStream(event.streams[0]);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(event.candidate);
      }
    };
  }

  async addLocalStream(stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });
  }

  private async sendIceCandidate(candidate: RTCIceCandidate) {
    if (!this.roomId) return;

    await supabase.from("presence").update({
      ice_candidate: JSON.stringify(candidate),
      ice_candidate_timestamp: new Date().toISOString(),
    }).eq("id", this.userId);
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      await supabase.from("presence").update({
        sdp_offer: JSON.stringify(offer),
        sdp_offer_timestamp: new Date().toISOString(),
      }).eq("id", this.userId);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      await supabase.from("presence").update({
        sdp_answer: JSON.stringify(answer),
        sdp_answer_timestamp: new Date().toISOString(),
      }).eq("id", this.userId);
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  setRoomInfo(roomId: string, partnerId: string) {
    this.roomId = roomId;
    this.partnerId = partnerId;
  }

  async cleanup() {
    this.peerConnection.close();
    if (this.userId) {
      await supabase.from("presence").update({
        sdp_offer: null,
        sdp_answer: null,
        ice_candidate: null,
        sdp_offer_timestamp: null,
        sdp_answer_timestamp: null,
        ice_candidate_timestamp: null,
      }).eq("id", this.userId);
    }
  }
}