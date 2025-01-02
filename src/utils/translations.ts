export const translations = {
  en: {
    title: "Video Chat Roulette",
    subtitle: "Meet new people through random video chats",
    onlineUsers: "Users Online",
    findingPartner: "Finding a partner...",
    connected: "Connected!",
    connectedDesc: "You're now chatting with a stranger.",
    newPartner: "You're now chatting with a new stranger.",
    joinNow: "Join Now",
    next: "Next",
    leave: "Leave"
  },
  es: {
    title: "Ruleta de Video Chat",
    subtitle: "Conoce gente nueva a través de video chats aleatorios",
    onlineUsers: "Usuarios en línea",
    findingPartner: "Buscando pareja...",
    connected: "¡Conectado!",
    connectedDesc: "Ahora estás chateando con un desconocido.",
    newPartner: "Ahora estás chateando con un nuevo desconocido.",
    joinNow: "Unirse ahora",
    next: "Siguiente",
    leave: "Salir"
  },
  pt: {
    title: "Roleta de Video Chat",
    subtitle: "Conheça novas pessoas através de video chats aleatórios",
    onlineUsers: "Usuários Online",
    findingPartner: "Procurando parceiro...",
    connected: "Conectado!",
    connectedDesc: "Você está conversando com um desconhecido.",
    newPartner: "Você está conversando com um novo desconhecido.",
    joinNow: "Entrar Agora",
    next: "Próximo",
    leave: "Sair"
  },
  ru: {
    title: "Видеочат Рулетка",
    subtitle: "Встречайте новых людей через случайные видеочаты",
    onlineUsers: "Пользователей онлайн",
    findingPartner: "Поиск собеседника...",
    connected: "Подключено!",
    connectedDesc: "Вы общаетесь с незнакомцем.",
    newPartner: "Вы общаетесь с новым незнакомцем.",
    joinNow: "Присоединиться",
    next: "Следующий",
    leave: "Выйти"
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;