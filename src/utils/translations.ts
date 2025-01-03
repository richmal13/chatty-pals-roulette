export type Language = "en" | "es" | "pt" | "ru";

type TranslationKey =
  | "error"
  | "title"
  | "subtitle"
  | "onlineUsers"
  | "findingPartner"
  | "connected"
  | "connectedDesc"
  | "newPartner"
  | "joinNow"
  | "next"
  | "leave"
  | "noUsersOnline"
  | "mediaAccessError"
  | "connectionError";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    error: "Error",
    title: "Video Chat",
    subtitle: "Connect with people around the world",
    onlineUsers: "users online",
    findingPartner: "Finding a chat partner...",
    connected: "Connected!",
    connectedDesc: "You are now connected with a chat partner",
    newPartner: "Connected to a new partner",
    joinNow: "Join Now",
    next: "Next",
    leave: "Leave",
    noUsersOnline: "No users online",
    mediaAccessError: "Could not access camera or microphone",
    connectionError: "Failed to establish connection. Please try again.",
  },
  es: {
    error: "Error",
    title: "Video Chat",
    subtitle: "Conéctate con personas de todo el mundo",
    onlineUsers: "usuarios en línea",
    findingPartner: "Buscando un compañero de chat...",
    connected: "¡Conectado!",
    connectedDesc: "Ahora estás conectado con un compañero de chat",
    newPartner: "Conectado a un nuevo compañero",
    joinNow: "Unirse ahora",
    next: "Siguiente",
    leave: "Salir",
    noUsersOnline: "No hay usuarios en línea",
    mediaAccessError: "No se pudo acceder a la cámara o micrófono",
    connectionError: "Error al establecer la conexión. Por favor, inténtalo de nuevo.",
  },
  pt: {
    error: "Erro",
    title: "Video Chat",
    subtitle: "Conecte-se com pessoas ao redor do mundo",
    onlineUsers: "usuários online",
    findingPartner: "Procurando um parceiro de chat...",
    connected: "Conectado!",
    connectedDesc: "Você está agora conectado com um parceiro de chat",
    newPartner: "Conectado a um novo parceiro",
    joinNow: "Entrar Agora",
    next: "Próximo",
    leave: "Sair",
    noUsersOnline: "Nenhum usuário online",
    mediaAccessError: "Não foi possível acessar a câmera ou microfone",
    connectionError: "Falha ao estabelecer conexão. Por favor, tente novamente.",
  },
  ru: {
    error: "Ошибка",
    title: "Видеочат",
    subtitle: "Общайтесь с людьми со всего мира",
    onlineUsers: "пользователей онлайн",
    findingPartner: "Поиск собеседника...",
    connected: "Подключено!",
    connectedDesc: "Вы подключены к собеседнику",
    newPartner: "Подключен к новому собеседнику",
    joinNow: "Присоединиться",
    next: "Следующий",
    leave: "Выйти",
    noUsersOnline: "Нет пользователей онлайн",
    mediaAccessError: "Не удалось получить доступ к камере или микрофону",
    connectionError: "Не удалось установить соединение. Пожалуйста, попробуйте снова.",
  },
};