export interface IMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
  status?: 'sent' | 'pending' | 'error'; // Для оптимистичного UI
}

export interface IChatState {
  idInstance: string;
  apiTokenInstance: string;
  currentChatId: string | null; // Например, "79991234567@c.us"
  messages: IMessage[];
  isLoading: boolean;
  error: string | null;
  isPolling: boolean; // Флаг, запущен ли опрос сообщений
}

// Тип ответа от Green-API при получении уведомлений
export interface INotification {
  receiptId: number;
  body: {
    typeWebhook: string; // 'incomingMessageReceived'
    instanceData: {
      idInstance: number;
      wid: string;
      typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    senderData: {
      chatId: string;
      sender: string;
      senderName: string;
    };
    messageData: {
      typeMessage: string; // 'textMessage'
      textMessageData: {
        textMessage: string;
      };
    };
  };
}