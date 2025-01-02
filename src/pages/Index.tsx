import { useState, useEffect } from "react";
import VideoPreview from "@/components/VideoPreview";
import VideoChatRoom from "@/components/VideoChatRoom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isInRoom, setIsInRoom] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userId] = useState(() => Math.random().toString(36).substring(7));
  const { toast } = useToast();

  useEffect(() => {
    const updatePresence = async () => {
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
            .gte('last_seen', new Date(Date.now() - 60000).toISOString());
          
          if (!error && data) {
            setOnlineUsers(data.length);
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

  const findPartner = async () => {
    // Ищем пользователя, который ожидает партнера
    const { data: waitingUsers, error: findError } = await supabase
      .from('presence')
      .select('*')
      .eq('is_waiting', true)
      .neq('id', userId)
      .gte('last_seen', new Date(Date.now() - 30000).toISOString())
      .limit(1);

    if (findError) {
      console.error('Error finding partner:', findError);
      return null;
    }

    if (waitingUsers && waitingUsers.length > 0) {
      const partner = waitingUsers[0];
      const roomId = `room_${Math.random().toString(36).substring(7)}`;

      // Обновляем статус обоих пользователей
      const updates = [
        {
          id: userId,
          room_id: roomId,
          is_waiting: false,
          partner_id: partner.id
        },
        {
          id: partner.id,
          room_id: roomId,
          is_waiting: false,
          partner_id: userId
        }
      ];

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('presence')
          .update(update)
          .eq('id', update.id);

        if (updateError) {
          console.error('Error updating user status:', updateError);
          return null;
        }
      }

      return { roomId, partnerId: partner.id };
    }

    // Если партнер не найден, устанавливаем статус ожидания
    const { error: waitError } = await supabase
      .from('presence')
      .update({ 
        is_waiting: true,
        room_id: null,
        partner_id: null
      })
      .eq('id', userId);

    if (waitError) {
      console.error('Error updating waiting status:', waitError);
    }

    return null;
  };

  const handleJoin = async (settings: { video: boolean; audio: boolean }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: settings.video,
        audio: settings.audio,
      });
      setLocalStream(stream);
      setIsInRoom(true);

      const partnerInfo = await findPartner();
      if (partnerInfo) {
        toast({
          title: t("connected"),
          description: t("connectedDesc"),
        });
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const handleLeave = async () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setIsInRoom(false);

    const { error } = await supabase
      .from('presence')
      .update({ 
        status: 'online',
        is_waiting: false,
        room_id: null,
        partner_id: null
      })
      .eq('id', userId);

    if (error) console.error('Error updating status:', error);
  };

  const handleNext = async () => {
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
      <header className="p-4 text-center relative">
        <div className="absolute right-4 top-4 flex gap-2">
          <Select
            value={language}
            onValueChange={(value: Language) => setLanguage(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Globe2 className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        <p className="text-primary mt-2">
          {onlineUsers} {t("onlineUsers")}
        </p>
      </header>

      <main className="container mx-auto">
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