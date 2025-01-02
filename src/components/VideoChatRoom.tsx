import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, SkipForward } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import VoiceTranslation from "./VoiceTranslation";
import { WebRTCConnection } from "@/utils/webRTC";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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
    }

    return () => {
      webRTCRef.current?.cleanup();
    };
  }, [localStream, userId]);

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
          const newData = payload.new;
          
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
                {onlineUsers <= 1 ? (
                  <p className="text-muted-foreground">{t("noUsersOnline")}</p>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t("findingPartner")}</p>
                  </>
                )}
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
