import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, SkipForward } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import VoiceTranslation from "./VoiceTranslation";

interface VideoChatRoomProps {
  localStream: MediaStream | null;
  onNext: () => void;
  onLeave: () => void;
}

const VideoChatRoom: React.FC<VideoChatRoomProps> = ({
  localStream,
  onNext,
  onLeave,
}) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [isSearching, setIsSearching] = useState(true);
  const [translatedText, setTranslatedText] = useState<string>("");

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    const timeout = setTimeout(() => {
      setIsSearching(false);
      toast({
        title: t("connected"),
        description: t("connectedDesc"),
      });
    }, Math.random() * 2000 + 1000);

    return () => clearTimeout(timeout);
  }, [localStream]);

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
    onNext();
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: t("connected"),
        description: t("newPartner"),
      });
    }, Math.random() * 2000 + 1000);
  };

  const handleTranslatedText = (text: string) => {
    setTranslatedText(text);
    // Here you would typically send this translated text to the other participant
    // through your WebRTC data channel
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
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {isSearching ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t("findingPartner")}</p>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {translatedText && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
                  {translatedText}
                </div>
              )}
            </>
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
          onTranslatedText={handleTranslatedText}
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