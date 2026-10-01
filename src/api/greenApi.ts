// src/api/greenApi.ts
import { type INotification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.green-api.com';
const BASE_URL = import.meta.env.DEV ? '/api' : API_URL;

export const DEFAULT_ID_INSTANCE = import.meta.env.VITE_ID_INSTANCE || '';
export const DEFAULT_API_TOKEN = import.meta.env.VITE_API_TOKEN_INSTANCE || '';
export const DEFAULT_MESSENGER_TYPE = import.meta.env.VITE_MESSENGER_TYPE || 'telegram';

export const sendMessage = async (
  idInstance: string,
  apiTokenInstance: string,
  chatId: string,
  message: string
) => {
  const response = await fetch(`${BASE_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка отправки: ${response.status}`);
  }
  return response.json();
};

export const receiveNotification = async (
  idInstance: string,
  apiTokenInstance: string
): Promise<INotification | null> => {
  try {
    // receiveTimeout=5 (по умолчанию 5 секунд, как в доке)
    const url = `${BASE_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`;
    
    const response = await fetch(url);
    
    // 1. Штатный таймаут (сообщений нет)
    if (response.status === 204 || response.status === 408) {
      return null;
    }

    // 2. Критическая ошибка: включен Webhook
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message?.includes('webhook url is set')) {
        console.error('🚨 ОШИБКА: Зайдите в кабинет Green-API и очистите поле "Webhook URL"!');
      }
      return null;
    }

    if (!response.ok) {
      return null;
    }
    
    // 3. Успешный ответ (используем text(), чтобы избежать ошибки парсинга пустого ответа)
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }
    
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
};

export const deleteNotification = async (
  idInstance: string,
  apiTokenInstance: string,
  receiptId: number
) => {
  try {
    // 🔥 ВАЖНО: receiptId передается В URL, а не в body, согласно документации!
    const url = `${BASE_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      // Body здесь НЕ нужен
    });

    if (!response.ok) {
      console.warn(`⚠️ Не удалось удалить уведомление ${receiptId}. Статус: ${response.status}`);
    }
    
    return response.json().catch(() => ({}));
  } catch (err) {
    console.error('Ошибка при удалении уведомления:', err);
  }
};