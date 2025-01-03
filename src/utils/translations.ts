export type Language = "en" | "ru" | "es" | "pt";

export type TranslationKey =
  | "joinNow"
  | "next"
  | "leave"
  | "waitingForPartner"
  | "linkCopied"
  | "linkCopiedDesc"
  | "error"
  | "mediaAccessError"
  | "connected"
  | "connectedDesc"
  | "newPartner"
  | "onlineUsers";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    joinNow: "Join Now",
    next: "Next",
    leave: "Leave",
    waitingForPartner: "Waiting for partner to join...",
    linkCopied: "Link Copied",
    linkCopiedDesc: "Invite link has been copied to clipboard",
    error: "Error",
    mediaAccessError: "Error accessing media devices",
    connected: "Connected",
    connectedDesc: "You are now connected with a partner",
    newPartner: "Connected to a new partner",
    onlineUsers: "users online"
  },
  ru: {
    joinNow: "Присоединиться",
    next: "Следующий",
    leave: "Выйти",
    waitingForPartner: "Ожидание присоединения собеседника...",
    linkCopied: "Ссылка скопирована",
    linkCopiedDesc: "Ссылка для приглашения скопирована в буфер обмена",
    error: "Ошибка",
    mediaAccessError: "Ошибка доступа к медиа-устройствам",
    connected: "Подключено",
    connectedDesc: "Вы подключены к собеседнику",
    newPartner: "Подключен новый собеседник",
    onlineUsers: "пользователей онлайн"
  },
  es: {
    joinNow: "Unirse Ahora",
    next: "Siguiente",
    leave: "Salir",
    waitingForPartner: "Esperando a que se una un compañero...",
    linkCopied: "Enlace Copiado",
    linkCopiedDesc: "El enlace de invitación se ha copiado al portapapeles",
    error: "Error",
    mediaAccessError: "Error al acceder a los dispositivos multimedia",
    connected: "Conectado",
    connectedDesc: "Ahora estás conectado con un compañero",
    newPartner: "Conectado a un nuevo compañero",
    onlineUsers: "usuarios en línea"
  },
  pt: {
    joinNow: "Entrar Agora",
    next: "Próximo",
    leave: "Sair",
    waitingForPartner: "Aguardando parceiro entrar...",
    linkCopied: "Link Copiado",
    linkCopiedDesc: "Link de convite foi copiado para a área de transferência",
    error: "Erro",
    mediaAccessError: "Erro ao acessar dispositivos de mídia",
    connected: "Conectado",
    connectedDesc: "Você está conectado com um parceiro",
    newPartner: "Conectado a um novo parceiro",
    onlineUsers: "usuários online"
  }
};
