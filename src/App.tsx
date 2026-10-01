// src/App.tsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { setCredentials, setChatId, addOptimisticMessage, updateMessageStatus, setError } from './store/chatSlice';
import { DEFAULT_API_TOKEN, DEFAULT_ID_INSTANCE, sendMessage } from './api/greenApi';
import { useChatPolling } from './hooks/useChatPolling';
import './App.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { idInstance, apiTokenInstance, currentChatId, messages, isLoading, error } = useSelector(
    (state: RootState) => state.chat
  );
console.log(messages, 'messages')
  const [tempId, setTempId] = useState(DEFAULT_ID_INSTANCE);
  const [tempToken, setTempToken] = useState(DEFAULT_API_TOKEN);
  const [phoneInput, setPhoneInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Запускаем хук опроса
  useChatPolling();

  const handleSaveCredentials = () => {
    dispatch(setCredentials({ idInstance: tempId, apiTokenInstance: tempToken }));
  };

  const handleStartChat = () => {
    if (phoneInput.length < 10) {
      dispatch(setError('Введите корректный номер телефона'));
      return;
    }
    dispatch(setChatId(phoneInput));
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentChatId) return;

    const textToSend = messageInput.trim();
    setMessageInput(''); // Очищаем поле сразу
    
    // 1. Оптимистичное добавление
    const tempId = `temp-${Date.now()}`;
    dispatch(addOptimisticMessage({ text: textToSend }));

    try {
      // 2. Реальный запрос к API
      await sendMessage(idInstance, apiTokenInstance, currentChatId, textToSend);
      // 3. Обновляем статус на "отправлено"
      dispatch(updateMessageStatus({ id: tempId, status: 'sent' }));
    } catch (err) {
      console.error(err);
      dispatch(updateMessageStatus({ id: tempId, status: 'error' }));
      dispatch(setError('Не удалось отправить сообщение. Проверьте токены.'));
    }
  };

  return (
    <div className="app-container">
      {/* Панель настроек */}
      <div className="settings-panel">
        <input 
          placeholder="idInstance (например, 1101000000)" 
          value={tempId} 
          onChange={(e) => setTempId(e.target.value)} 
        />
        <input 
          placeholder="apiTokenInstance" 
          value={tempToken} 
          onChange={(e) => setTempToken(e.target.value)} 
        />
        <button onClick={handleSaveCredentials}>Применить учетные данные</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-wrapper">
        {/* Левая колонка: выбор чата */}
        <div className="sidebar">
          <h3>Новый чат</h3>
          <input 
            placeholder="Номер телефона (79991234567)" 
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
          />
          <button onClick={handleStartChat} disabled={!idInstance}>Начать чат</button>
          
          {currentChatId && (
            <div className="active-chat-info">
              Активный чат: <br/>
              <strong>{currentChatId.replace('@t.me', '')}</strong>
            </div>
          )}
        </div>

        {/* Правая колонка: сообщения */}
        <div className="chat-area">
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-state">Сообщений пока нет. Напишите первое!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.type === 'outgoing' ? (
                      <span className={`status ${msg.status}`}>
                        {msg.status === 'pending' ? '⏳' : msg.status === 'error' ? '❌' : '✓'}
                      </span>
                    ):  (<span className={`status ${msg.status}`}>
                        {msg.status === 'pending' ? '⏳' : msg.status === 'error' ? '❌' : '✓'}
                      </span>)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="input-area">
            <input 
              placeholder="Введите сообщение..." 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!currentChatId || isLoading}
            />
            <button onClick={handleSendMessage} disabled={!currentChatId || !messageInput.trim()}>
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;