import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, SkipForward } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    // Simulate finding a partner after a random delay (1-3 seconds)
    const timeout = setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Connected!",
        description: "You're now chatting with a stranger.",
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

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !hasAudio;
        setHasAudio(!hasAudio);
      }
    }
  };

  const handleNext = () => {
    setIsSearching(true);
    onNext();
    // Simulate finding a new partner
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Connected!",
        description: "You're now chatting with a new stranger.",
      });
    }, Math.random() * 2000 + 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="relative w-full max-w-6xl grid grid-cols-2 gap-4">
        {/* Local Video */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
          {isSearching ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Finding a partner...</p>
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
          className={!hasVideo ? "bg-gray-200" : ""}
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
          className={!hasAudio ? "bg-gray-200" : ""}
        >
          {hasAudio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button onClick={handleNext} className="gap-2">
          <SkipForward className="h-5 w-5" />
          Next
        </Button>
        <Button variant="destructive" onClick={onLeave}>
          Leave
        </Button>
      </div>
    </div>
  );
};

export default VideoChatRoom;