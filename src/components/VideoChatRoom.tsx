import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, SkipForward, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import VoiceTranslation from "./VoiceTranslation";
import { WebRTCConnection } from "@/utils/webRTC";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useLocation } from "react-router-dom";

type PresenceRow = Database['public']['Tables']['presence']['Row'];

interface VideoChatRoomProps {
  localStream: MediaStream | null;
  onNext: () => void;
  onLeave: () => void;
  onlineUsers: number;
}

const VideoChatRoom: React.FC<VideoChatRoomProps> = ({
  localStream,
  onNext,
  onLeave,
  onlineUsers,
}) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [isSearching, setIsSearching] = useState(true);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const webRTCRef = useRef<WebRTCConnection | null>(null);
  const [userId] = useState(() => Math.random().toString(36).substring(7));
  const [roomId] = useState(() => `room_${Math.random().toString(36).substring(7)}`);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const inviteLink = `${window.location.origin}?room=${roomId}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: t("linkCopied"),
      description: t("linkCopiedDesc"),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      
      webRTCRef.current = new WebRTCConnection(userId, (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          setIsSearching(false);
        }
      });
      webRTCRef.current.addLocalStream(localStream);

      // Create or join room
      const searchParams = new URLSearchParams(location.search);
      const joinRoomId = searchParams.get('room');
      
      if (joinRoomId) {
        // Joining existing room
        supabase
          .from('presence')
          .select('*')
          .eq('room_id', joinRoomId)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              webRTCRef.current?.setRoomInfo(joinRoomId, data.id);
              webRTCRef.current?.createOffer();
            }
          });
      } else {
        // Creating new room
        supabase
          .from('presence')
          .insert({
            id: userId,
            room_id: roomId,
            is_waiting: true,
            last_seen: new Date().toISOString()
          });
      }
    }

    return () => {
      webRTCRef.current?.cleanup();
    };
  }, [localStream, userId, roomId, location.search]);

  useEffect(() => {
    if (!webRTCRef.current) return;

    const channel = supabase
      .channel('presence_rtc')
      .on<PresenceRow>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence',
        },
        async (payload: RealtimePostgresChangesPayload<PresenceRow>) => {
          const newData = payload.new as PresenceRow;
          if (!newData) return;
          
          if (newData.partner_id === userId) {
            if (newData.sdp_offer && !newData.sdp_answer) {
              await webRTCRef.current?.handleOffer(JSON.parse(newData.sdp_offer));
            }
            if (newData.ice_candidate) {
              await webRTCRef.current?.handleIceCandidate(JSON.parse(newData.ice_candidate));
            }
          }

          if (newData.id === userId && newData.partner_id) {
            webRTCRef.current?.setRoomInfo(newData.room_id || '', newData.partner_id);
            await webRTCRef.current?.createOffer();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !hasVideo;
        setHasVideo(!hasVideo);
      }
    }
  };

  const handleNext = () => {
    setIsSearching(true);
    webRTCRef.current?.cleanup();
    onNext();
  };

  const handleRecognizedText = (text: string) => {
    setRecognizedText(text);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="w-full max-w-xl bg-card p-4 rounded-lg shadow mb-4">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={inviteLink} 
            readOnly 
            className="flex-1 px-3 py-2 rounded bg-muted text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyInviteLink}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="relative w-full max-w-6xl grid grid-cols-2 gap-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <VideoOff className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          {recognizedText && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
              {recognizedText}
            </div>
          )}
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {isSearching ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <p className="text-muted-foreground">{t("waitingForPartner")}</p>
              </div>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleVideo}
          className={!hasVideo ? "bg-muted" : ""}
        >
          {hasVideo ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>
        <VoiceTranslation
          targetLanguage={language}
          onTranslatedText={handleRecognizedText}
        />
        <Button onClick={handleNext} className="gap-2">
          <SkipForward className="h-5 w-5" />
          {t("next")}
        </Button>
        <Button variant="destructive" onClick={onLeave}>
          {t("leave")}
        </Button>
      </div>
    </div>
  );
};

export default VideoChatRoom;