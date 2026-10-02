import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  addOptimisticMessage,
  updateMessageStatus,
  setError,
} from "../../store/chatSlice";
import { sendMessage } from "../../api/greenApi";
import "./styles.css";

export const MessageInput: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { idInstance, apiTokenInstance, currentChatId } = useSelector(
    (state: RootState) => state.chat,
  );
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim() || !currentChatId) return;

    const messageText = text.trim();
    setText("");

    const tempId = `temp-${Date.now()}`;
    dispatch(addOptimisticMessage({ text: messageText }));

    try {
      await sendMessage(
        idInstance,
        apiTokenInstance,
        currentChatId,
        messageText,
      );
      dispatch(updateMessageStatus({ id: tempId, status: "sent" }));
    } catch (err) {
      console.error(err);
      dispatch(updateMessageStatus({ id: tempId, status: "error" }));
      dispatch(setError("Не удалось отправить сообщение"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        disabled={!currentChatId}
        rows={1}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!currentChatId || !text.trim()}>
        Отправить
      </button>
    </div>
  );
};
