import { supabase } from "@/integrations/supabase/client";

export const usePartnerMatching = (userId: string) => {
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

    return null;
  };

  return { findPartner };
};