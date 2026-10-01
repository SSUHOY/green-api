import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type IChatState, type IMessage } from '../types';

const initialState: IChatState = {
  idInstance: '',
  apiTokenInstance: '',
  currentChatId: null,
  messages: [],
  isLoading: false,
  error: null,
  isPolling: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ idInstance: string; apiTokenInstance: string }>) => {
      state.idInstance = action.payload.idInstance.trim();
      state.apiTokenInstance = action.payload.apiTokenInstance.trim();
      state.error = null;
    },
    setChatId: (state, action: PayloadAction<string>) => {
      // Нормализация номера: убираем +, пробелы, скобки, добавляем @c.us
      const cleanNumber = action.payload.replace(/\D/g, '');
      state.currentChatId = `${cleanNumber}@c.us`;
      state.messages = []; // Очищаем сообщения при смене чата
    },
    addOptimisticMessage: (state, action: PayloadAction<{ text: string }>) => {
      const newMessage: IMessage = {
        id: `temp-${Date.now()}`,
        text: action.payload.text,
        timestamp: Date.now(),
        type: 'outgoing',
        status: 'pending',
      };
      state.messages.push(newMessage);
    },
    updateMessageStatus: (state, action: PayloadAction<{ id: string; status: 'sent' | 'error' }>) => {
      const msg = state.messages.find((m) => m.id === action.payload.id);
      if (msg) msg.status = action.payload.status;
    },
    addIncomingMessage: (state, action: PayloadAction<IMessage>) => {
      state.messages.push(action.payload);
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload;
    },
  },
});

export const {
  setCredentials,
  setChatId,
  addOptimisticMessage,
  updateMessageStatus,
  addIncomingMessage,
  setError,
  setLoading,
  setPolling,
} = chatSlice.actions;

export default chatSlice.reducer;
