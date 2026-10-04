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
  const { idInstance, apiTokenInstance, currentChatId, error } = useSelector(
    (state: RootState) => state.chat,
  );
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (error) {
      dispatch(setError(""));
    }
  };

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || !currentChatId || isSending) return;

    setIsSending(true);
    setText("");

    const tempId = `temp-${Date.now()}`;
    dispatch(addOptimisticMessage({ id: tempId, text: trimmedText }));

    try {
      await sendMessage(idInstance, apiTokenInstance, currentChatId, trimmedText);
      dispatch(updateMessageStatus({ id: tempId, status: "sent" }));
    } catch (err) {
      console.error(err);
      dispatch(updateMessageStatus({ id: tempId, status: "error" }));
      dispatch(setError("Не удалось отправить сообщение. Проверьте соединение."));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        disabled={!currentChatId || isSending}
        rows={1}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!currentChatId || !text.trim() || isSending}
      >
        {isSending ? "Отправка..." : "Отправить"}
      </button>
    </div>
  );
};