import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Add type definitions for the Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface VoiceTranslationProps {
  targetLanguage: string;
  onTranslatedText: (text: string) => void;
}

const VoiceTranslation: React.FC<VoiceTranslationProps> = ({
  targetLanguage,
  onTranslatedText,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === "en" ? "en-US" : 
                        language === "es" ? "es-ES" :
                        language === "pt" ? "pt-BR" : "ru-RU";

      recognition.onresult = async (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;

        if (event.results[last].isFinal) {
          try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                q: text,
                source: language,
                target: targetLanguage,
              }),
            });

            const data = await response.json();
            if (data.data?.translations?.[0]?.translatedText) {
              onTranslatedText(data.data.translations[0].translatedText);
            }
          } catch (error) {
            console.error("Translation error:", error);
            toast({
              title: "Translation Error",
              description: "Failed to translate the speech",
              variant: "destructive",
            });
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Failed to recognize speech",
          variant: "destructive",
        });
      };

      setRecognition(recognition);
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language, targetLanguage]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={isListening ? "bg-primary text-primary-foreground" : ""}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

export default VoiceTranslation;