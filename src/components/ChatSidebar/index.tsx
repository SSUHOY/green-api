import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { setChatId, setError, setLoading } from "../../store/chatSlice";
import { clearNotificationQueue } from "../../api/greenApi";
import "./styles.css";

export const ChatSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentChatId, apiTokenInstance, idInstance, isLoading, error } =
    useSelector((state: RootState) => state.chat);
  const [phoneInput, setPhoneInput] = useState("");

  const hasCredentials = Boolean(idInstance && apiTokenInstance);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneInput(e.target.value);
    if (error) {
      dispatch(setError(""));
    }
  };

  const handleStartChat = async () => {
    if (!hasCredentials) {
      dispatch(
        setError("Сначала введите ID Instance и API Token в настройках сверху"),
      );
      return;
    }

    if (phoneInput.length < 10) {
      dispatch(setError("Введите корректный номер телефона (минимум 10 цифр)"));
      return;
    }

    dispatch(setLoading(true));

    try {
      await clearNotificationQueue(idInstance, apiTokenInstance);
      dispatch(setChatId(phoneInput));
    } catch (err) {
      console.error("Ошибка при очистке очереди:", err);
      dispatch(setError("Не удалось подготовить чат. Проверьте соединение."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStartChat();
    }
  };

  return (
    <div className="chat-sidebar">
      <h3>Новый чат</h3>
      <div className="new-chat-form">
        <input
          type="tel"
          placeholder="Номер телефона (79991234567)"
          value={phoneInput}
          onChange={handlePhoneChange}
          onKeyDown={handleKeyDown}
          disabled={!hasCredentials || isLoading}
        />
        <button
          onClick={handleStartChat}
          disabled={!hasCredentials || isLoading}
          className={(!hasCredentials || isLoading) ? "btn-disabled" : ""}
        >
          {isLoading ? "Подготовка чата..." : "Начать чат"}
        </button>
      </div>

      {currentChatId && (
        <div className="active-chat">
          <div className="active-chat-label">Активный чат:</div>
          <div className="active-chat-number">
            {currentChatId.split("@")[0]}
          </div>
        </div>
      )}

      {!hasCredentials && (
        <div className="credentials-warning">
          ⚠️ Введите учетные данные GREEN-API в панели сверху, чтобы начать
          работу.
        </div>
      )}
    </div>
  );
};