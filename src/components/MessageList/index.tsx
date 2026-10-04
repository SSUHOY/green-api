import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { IMessage } from "../../types";
import "./styles.css";

export const MessageList: React.FC = () => {
  const messages = useSelector((state: RootState) => state.chat.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 const getStatusIcon = (status?: 'pending' | 'sent' | 'error') => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'error':
        return '❌';
      default:
        return '';
    }
  };

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <div className="empty-icon"></div>
        <p>Начните диалог, отправив первое сообщение</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((msg: IMessage) => (
        <div key={msg.id} className={`message ${msg.type}`}>
          <div className="message-content">
            <div className="message-text">{msg.text}</div>
            <div className="message-meta">
              <span className="message-time">{formatTime(msg.timestamp)}</span>
              {msg.type === "outgoing" && (
                <span className={`message-status ${msg.status}`}>
                  {getStatusIcon(msg.status)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
