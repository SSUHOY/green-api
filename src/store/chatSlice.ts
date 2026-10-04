import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type IChatState, type IMessage } from "../types";

const initialState: IChatState = {
  idInstance: "",
  apiTokenInstance: "",
  currentChatId: null,
  messages: [],
  isLoading: false,
  error: null,
  isPolling: false,
  chatCreatedAt: null,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ idInstance: string; apiTokenInstance: string }>,
    ) => {
      state.idInstance = action.payload.idInstance.trim();
      state.apiTokenInstance = action.payload.apiTokenInstance.trim();
      state.error = null;
    },

    setChatId: (state, action: PayloadAction<string>) => {
      let cleanNumber = action.payload.replace(/\D/g, "");

      if (cleanNumber.startsWith("8") && cleanNumber.length === 11) {
        cleanNumber = "7" + cleanNumber.slice(1);
      }

      const suffix = "@c.us";
      const perfectChatId = `${cleanNumber}${suffix}`;

      state.currentChatId = perfectChatId;
      state.messages = [];
      state.chatCreatedAt = Date.now();
    },
    addOptimisticMessage: (state, action: PayloadAction<{ text: string }>) => {
      const newMessage: IMessage = {
        id: `temp-${Date.now()}`,
        text: action.payload.text,
        timestamp: Date.now(),
        type: "outgoing",
        status: "pending",
      };
      state.messages.push(newMessage);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: "pending" | "sent" | "error";
      }>,
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.id);
      if (msg) {
        msg.status = action.payload.status;
      }
    },
    addIncomingMessage: (state, action: PayloadAction<IMessage>) => {
      state.messages = [...state.messages, action.payload];
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
