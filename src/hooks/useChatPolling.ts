// src/hooks/useChatPolling.ts
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { receiveNotification, deleteNotification } from '../api/greenApi';
import { addIncomingMessage, setPolling } from '../store/chatSlice';
import type { RootState } from '../store';

export const useChatPolling = () => {
  const dispatch = useDispatch();
  const { idInstance, apiTokenInstance, currentChatId } = useSelector(
    (state: RootState) => state.chat
  );
  
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!idInstance || !apiTokenInstance || !currentChatId) {
      isPollingRef.current = false;
      dispatch(setPolling(false));
      return;
    }

    dispatch(setPolling(true));
    isPollingRef.current = true;
    console.log('🟢 Опрос запущен. Ждем сообщения для чата:', currentChatId);
    
    const poll = async () => {
      while (isPollingRef.current) {
        try {
          const notification = await receiveNotification(idInstance, apiTokenInstance);
          
          if (!isPollingRef.current) break;

          if (notification && notification.receiptId) {
            console.log('📦 Получено уведомление, receiptId:', notification.receiptId);

            if (notification.body.typeWebhook === 'incomingMessageReceived') {
              const msgData = notification.body.messageData;
              console.log(msgData, 'test msgData')
              const senderChatId = notification.body.senderData.chatId;
              
              const cleanSenderNumber = senderChatId.replace(/\D/g, '');
              const cleanTargetNumber = currentChatId.replace(/\D/g, '');

              console.log(`📥 От: ${cleanSenderNumber} | 🎯 Ожидаем: ${cleanTargetNumber}`);

              if (msgData?.typeMessage === 'textMessage') {
                console.log('✅ Сообщение добавлено в чат!');
                dispatch(addIncomingMessage({
                  id: notification.body.idMessage,
                  text: msgData.textMessageData.textMessage,
                  timestamp: notification.body.timestamp * 1000,
                  type: 'incoming',
                }));
              } else {
                console.log('🚫 Сообщение проигнорировано (не тот чат или не текст)');
              }
            }

            // 🔥 ТЕПЕРЬ ЭТО СРАБОТАЕТ: удаляем по ID из URL
            console.log('🗑️ Удаляем уведомление из очереди...');
            await deleteNotification(idInstance, apiTokenInstance, notification.receiptId);
          }
          
          // Пауза 1 секунда перед следующим запросом
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (err) {
          console.error('🔴 Неожиданная ошибка в цикле опроса:', err);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    };

    poll();

    return () => {
      isPollingRef.current = false;
      dispatch(setPolling(false));
    };
  }, [idInstance, apiTokenInstance, currentChatId, dispatch]);
};