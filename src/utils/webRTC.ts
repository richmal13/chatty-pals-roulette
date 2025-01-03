import { supabase } from "@/integrations/supabase/client";

export class WebRTCConnection {
  private client: any; // dTelecom client instance
  private roomId: string | null = null;
  private userId: string;
  private token: string | null = null;

  constructor(
    userId: string,
    private onRemoteStream: (stream: MediaStream) => void
  ) {
    this.userId = userId;
  }

  async initialize() {
    try {
      // Create a room using our Edge Function
      const { data: roomData, error: roomError } = await supabase.functions.invoke('dtelecom', {
        body: { action: 'create-room' }
      });

      if (roomError) throw roomError;
      this.roomId = roomData.room_id;

      // Get access token
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('dtelecom', {
        body: { 
          action: 'get-token',
          roomId: this.roomId,
          userId: this.userId
        }
      });

      if (tokenError) throw tokenError;
      this.token = tokenData.token;

      // Initialize dTelecom client
      this.client = new DTelecomClient({
        url: 'wss://rtc.dtelecom.org',
        token: this.token
      });

      // Set up event listeners
      this.client.on('track', (track: MediaStreamTrack, stream: MediaStream) => {
        this.onRemoteStream(stream);
      });

      await this.client.connect();
      console.log('Connected to dTelecom room:', this.roomId);

    } catch (error) {
      console.error('Error initializing dTelecom:', error);
      throw error;
    }
  }

  async addLocalStream(stream: MediaStream) {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      await this.client.publish(stream);
      console.log('Local stream published');
    } catch (error) {
      console.error('Error publishing stream:', error);
      throw error;
    }
  }

  cleanup() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.roomId = null;
    this.token = null;
  }
}