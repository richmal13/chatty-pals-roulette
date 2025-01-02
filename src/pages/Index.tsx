import { useState, useEffect } from "react";
import VideoPreview from "@/components/VideoPreview";
import VideoChatRoom from "@/components/VideoChatRoom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/utils/translations";
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

  useEffect(() => {
    // Создаем уникальный ID для пользователя
    const userId = Math.random().toString(36).substring(7);
    
    // Функция для обновления статуса
    const updateOnlineStatus = () => {
      const timestamp = new Date().getTime();
      localStorage.setItem('user_' + userId, timestamp.toString());
    };

    // Обновляем статус каждые 5 секунд
    const statusInterval = setInterval(updateOnlineStatus, 5000);
    updateOnlineStatus();

    // Функция для подсчета онлайн пользователей
    const countOnlineUsers = () => {
      const now = new Date().getTime();
      let count = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('user_')) {
          const timestamp = parseInt(localStorage.getItem(key) || '0');
          // Считаем пользователя онлайн, если его статус обновлялся в последние 10 секунд
          if (now - timestamp < 10000) {
            count++;
          } else {
            localStorage.removeItem(key);
          }
        }
      }
      
      setOnlineUsers(count);
    };

    // Проверяем количество онлайн пользователей каждые 5 секунд
    const countInterval = setInterval(countOnlineUsers, 5000);
    countOnlineUsers();

    // Очистка при размонтировании
    return () => {
      clearInterval(statusInterval);
      clearInterval(countInterval);
      localStorage.removeItem('user_' + userId);
    };
  }, []);

  const handleJoin = async (settings: { video: boolean; audio: boolean }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: settings.video,
        audio: settings.audio,
      });
      setLocalStream(stream);
      setIsInRoom(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const handleLeave = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setIsInRoom(false);
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