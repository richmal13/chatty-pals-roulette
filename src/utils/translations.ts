export type Language = 'en' | 'es' | 'pt' | 'ru';

export type TranslationKey = 
  | 'error'
  | 'onlineUsers'
  | 'title'
  | 'subtitle'
  | 'findingPartner'
  | 'connected'
  | 'connectedDesc'
  | 'newPartner'
  | 'joinNow'
  | 'next'
  | 'leave'
  | 'noUsersOnline'
  | 'mediaAccessError'
  | 'connectionError';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    error: 'Error',
    onlineUsers: 'users online',
    title: 'Random Video Chat',
    subtitle: 'Meet new people through video chat',
    findingPartner: 'Finding a chat partner...',
    connected: 'Connected!',
    connectedDesc: 'You are now connected with a partner',
    newPartner: 'Connected to a new partner',
    joinNow: 'Join Now',
    next: 'Next',
    leave: 'Leave',
    noUsersOnline: 'No users online',
    mediaAccessError: 'Could not access camera or microphone',
    connectionError: 'Connection error occurred'
  },
  es: {
    error: 'Error',
    onlineUsers: 'usuarios en línea',
    title: 'Chat de Video Aleatorio',
    subtitle: 'Conoce nuevas personas por video chat',
    findingPartner: 'Buscando pareja de chat...',
    connected: '¡Conectado!',
    connectedDesc: 'Estás conectado con una pareja',
    newPartner: 'Conectado a una nueva pareja',
    joinNow: 'Unirse Ahora',
    next: 'Siguiente',
    leave: 'Salir',
    noUsersOnline: 'No hay usuarios en línea',
    mediaAccessError: 'No se pudo acceder a la cámara o micrófono',
    connectionError: 'Ocurrió un error de conexión'
  },
  pt: {
    error: 'Erro',
    onlineUsers: 'usuários online',
    title: 'Chat de Vídeo Aleatório',
    subtitle: 'Conheça novas pessoas por video chat',
    findingPartner: 'Procurando parceiro de chat...',
    connected: 'Conectado!',
    connectedDesc: 'Você está conectado com um parceiro',
    newPartner: 'Conectado a um novo parceiro',
    joinNow: 'Entrar Agora',
    next: 'Próximo',
    leave: 'Sair',
    noUsersOnline: 'Nenhum usuário online',
    mediaAccessError: 'Não foi possível acessar câmera ou microfone',
    connectionError: 'Ocorreu um erro de conexão'
  },
  ru: {
    error: 'Ошибка',
    onlineUsers: 'пользователей онлайн',
    title: 'Случайный Видеочат',
    subtitle: 'Знакомьтесь с новыми людьми через видеочат',
    findingPartner: 'Поиск собеседника...',
    connected: 'Подключено!',
    connectedDesc: 'Вы подключены к собеседнику',
    newPartner: 'Подключен к новому собеседнику',
    joinNow: 'Присоединиться',
    next: 'Следующий',
    leave: 'Выйти',
    noUsersOnline: 'Нет пользователей онлайн',
    mediaAccessError: 'Не удалось получить доступ к камере или микрофону',
    connectionError: 'Произошла ошибка подключения'
  }
};