import React from "react";
import { VideoOff } from "lucide-react";

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isLocal?: boolean;
  hasVideo?: boolean;
  recognizedText?: string;
  isSearching?: boolean;
  waitingMessage?: string;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoRef,
  isLocal = false,
  hasVideo = true,
  recognizedText,
  isSearching,
  waitingMessage,
}) => {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
      {isSearching ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <p className="text-muted-foreground">{waitingMessage}</p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
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
        </>
      )}
    </div>
  );
};

export default VideoDisplay;