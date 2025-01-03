import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TestConnectionButtonProps {
  userId: string;
}

const TestConnectionButton = ({ userId }: TestConnectionButtonProps) => {
  const { toast } = useToast();

  const handleTestConnection = async () => {
    // Create a test partner
    const testPartnerId = 'test-partner-' + Math.random().toString(36).substring(7);
    const roomId = `test-room-${Math.random().toString(36).substring(7)}`;

    try {
      // Create test partner presence
      await supabase.from('presence').insert({
        id: testPartnerId,
        status: 'online',
        is_waiting: true,
        last_seen: new Date().toISOString()
      });

      // Update current user and partner to be in the same room
      await supabase.from('presence').update({
        room_id: roomId,
        is_waiting: false,
        partner_id: testPartnerId
      }).eq('id', userId);

      await supabase.from('presence').update({
        room_id: roomId,
        is_waiting: false,
        partner_id: userId
      }).eq('id', testPartnerId);

      toast({
        title: "Тестовое подключение",
        description: "Создан тестовый партнер и комната для проверки соединения",
      });
    } catch (error) {
      console.error('Error in test connection:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать тестовое подключение",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleTestConnection} variant="outline">
      Тестовое подключение
    </Button>
  );
};

export default TestConnectionButton;