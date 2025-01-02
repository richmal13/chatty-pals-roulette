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