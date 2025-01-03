import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VideoPreviewProps {
  onJoin: (settings: { video: boolean; audio: boolean }) => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ onJoin }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const initStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !hasVideo;
        setHasVideo(!hasVideo);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !hasAudio;
        setHasAudio(!hasAudio);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-muted">
        <video
          ref={videoRef}
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
        <Button
          variant="outline"
          size="icon"
          onClick={toggleAudio}
          className={!hasAudio ? "bg-muted" : ""}
        >
          {hasAudio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          onClick={() => onJoin({ video: hasVideo, audio: hasAudio })}
          className="px-8"
        >
          {t("joinNow")}
        </Button>
      </div>
    </div>
  );
};

export default VideoPreview;