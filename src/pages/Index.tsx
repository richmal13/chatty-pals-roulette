import { useState, useEffect } from "react";
import VideoPreview from "@/components/VideoPreview";
import VideoChatRoom from "@/components/VideoChatRoom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { usePartnerMatching } from "@/hooks/usePartnerMatching";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import TestConnectionButton from "@/components/TestConnectionButton";

const Index = () => {
  const [isInRoom, setIsInRoom] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const { t } = useLanguage();
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userId] = useState(() => Math.random().toString(36).substring(7));
  const { toast } = useToast();
  const { findPartner } = usePartnerMatching(userId);

  useEffect(() => {
    const updatePresence = async () => {
      // Удаляем старые записи
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      await supabase
        .from('presence')
        .delete()
        .lt('last_seen', tenMinutesAgo);

      // Обновляем или создаем нашу запись
      const { error } = await supabase
        .from('presence')
        .upsert({ 
          id: userId,
          last_seen: new Date().toISOString(),
          status: 'online',
          is_waiting: false
        });

      if (error) console.error('Error updating presence:', error);
    };

    const interval = setInterval(updatePresence, 30000);
    updatePresence();

    const presenceChannel = supabase
      .channel('presence_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence'
        },
        async () => {
          const { data, error } = await supabase
            .from('presence')
            .select('*')
            .gte('last_seen', new Date(Date.now() - 30000).toISOString());
          
          if (!error && data) {
            const activeUsers = data.filter(user => 
              user.status === 'online' && 
              new Date(user.last_seen).getTime() > Date.now() - 30000
            );
            setOnlineUsers(activeUsers.length);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      presenceChannel.unsubscribe();
      supabase
        .from('presence')
        .delete()
        .match({ id: userId })
        .then(({ error }) => {
          if (error) console.error('Error removing presence:', error);
        });
    };
  }, [userId]);

  const handleJoin = async (settings: { video: boolean; audio: boolean }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: settings.video,
        audio: settings.audio,
      });
      setLocalStream(stream);
      setIsInRoom(true);

      await supabase
        .from('presence')
        .update({ 
          status: 'online',
          is_waiting: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);

      const partnerInfo = await findPartner();
      if (partnerInfo) {
        toast({
          title: t("connected"),
          description: t("connectedDesc"),
        });
      }

    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: t("error"),
        description: t("mediaAccessError"),
        variant: "destructive",
      });
    }
  };

  const handleLeave = async () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setIsInRoom(false);

    await supabase
      .from('presence')
      .update({ 
        status: 'online',
        is_waiting: false,
        room_id: null,
        partner_id: null
      })
      .eq('id', userId);
  };

  const handleNext = async () => {
    await supabase
      .from('presence')
      .update({ 
        is_waiting: true,
        room_id: null,
        partner_id: null
      })
      .eq('id', userId);

    const partnerInfo = await findPartner();
    if (partnerInfo) {
      toast({
        title: t("connected"),
        description: t("newPartner"),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="container mx-auto">
        <div className="flex justify-center mb-4">
          <p className="text-primary">
            {onlineUsers} {t("onlineUsers")}
          </p>
        </div>
        
        <div className="flex justify-center mb-4">
          <TestConnectionButton userId={userId} />
        </div>

        {!isInRoom ? (
          <VideoPreview onJoin={handleJoin} />
        ) : (
          <VideoChatRoom
            localStream={localStream}
            onNext={handleNext}
            onLeave={handleLeave}
            onlineUsers={onlineUsers}
          />
        )}
      </main>
    </div>
  );
};

export default Index;