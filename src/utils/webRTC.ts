import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PresenceRow = Database['public']['Tables']['presence']['Row'];

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
        {
          urls: "turn:numb.viagenie.ca",
          username: "webrtc@live.com",
          credential: "muazkh"
        }
      ],
    });

    this.peerConnection.ontrack = (event) => {
      console.log("Received remote track", event.streams[0]);
      this.onRemoteStream(event.streams[0]);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate", event.candidate);
        this.sendIceCandidate(event.candidate);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", this.peerConnection.iceConnectionState);
    };
  }

  private async sendIceCandidate(candidate: RTCIceCandidate) {
    if (!this.userId) return;
    
    console.log("Sending ICE candidate for user", this.userId);
    await supabase.from("presence").update({
      ice_candidate: JSON.stringify(candidate),
      ice_candidate_timestamp: new Date().toISOString(),
    }).eq("id", this.userId);
  }

  async addLocalStream(stream: MediaStream) {
    console.log("Adding local stream", stream.id);
    stream.getTracks().forEach((track) => {
      console.log("Adding track to peer connection", track.kind);
      this.peerConnection.addTrack(track, stream);
    });
  }

  async createOffer() {
    try {
      console.log("Creating offer");
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      console.log("Setting local description");
      await this.peerConnection.setLocalDescription(offer);

      console.log("Sending offer for user", this.userId);
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
      console.log("Setting remote description (answer)");
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      console.log("Adding ICE candidate", candidate);
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      console.log("Setting remote description (offer)");
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      console.log("Creating answer");
      const answer = await this.peerConnection.createAnswer();
      
      console.log("Setting local description");
      await this.peerConnection.setLocalDescription(answer);

      console.log("Sending answer for user", this.userId);
      await supabase.from("presence").update({
        sdp_answer: JSON.stringify(answer),
        sdp_answer_timestamp: new Date().toISOString(),
      }).eq("id", this.userId);
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  setRoomInfo(roomId: string, partnerId: string) {
    console.log("Setting room info", { roomId, partnerId });
    this.roomId = roomId;
    this.partnerId = partnerId;
  }

  cleanup() {
    console.log("Cleaning up WebRTC connection");
    this.peerConnection.close();
  }
}