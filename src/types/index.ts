export interface IMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
  status?:  "sent" | "delivered" | "read" | "error" | "pending"; 
}

export interface IChatState {
  idInstance: string;
  apiTokenInstance: string;
  currentChatId: string | null;
  messages: IMessage[];
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  chatCreatedAt: number | null;
  selectedChatId: number | null;
}

export interface INotification {
  receiptId: number;
  body: {
    typeWebhook: string;
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
      senderPhoneNumber: number;
    };
    messageData: {
      typeMessage: string;
      textMessageData: {
        textMessage: string;
      };
    };
  };
}