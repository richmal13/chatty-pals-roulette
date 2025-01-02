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

const Index = () => {
  const [isInRoom, setIsInRoom] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    const updatePresence = async () => {
      const { error } = await supabase
        .from('presence')
        .upsert({ 
          id: userId,
          last_seen: new Date().toISOString(),
          status: 'online'
        });

      if (error) console.error('Error updating presence:', error);
    };

    // Обновляем статус каждые 30 секунд
    const interval = setInterval(updatePresence, 30000);
    updatePresence();

    // Подписываемся на изменения в таблице presence
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
          // При любом изменении получаем актуальное количество онлайн пользователей
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
      // Удаляем пользователя при выходе
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

      // Обновляем статус пользователя как "ready"
      const { error } = await supabase
        .from('presence')
        .update({ status: 'ready' })
        .match({ id: userId });

      if (error) console.error('Error updating status:', error);
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

    // Обновляем статус пользователя обратно на "online"
    const { error } = await supabase
      .from('presence')
      .update({ status: 'online' })
      .match({ id: userId });

    if (error) console.error('Error updating status:', error);
  };

  const handleNext = () => {
    console.log("Looking for next partner...");
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