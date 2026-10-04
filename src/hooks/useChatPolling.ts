import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { receiveNotification, deleteNotification } from "../api/greenApi";
import { addIncomingMessage, setPolling } from "../store/chatSlice";
import type { RootState } from "../store";

const normalizePhone = (phone: string | number | undefined): string => {
  if (!phone) return "";

  let digits = String(phone).replace(/\D/g, "");

  if (digits.startsWith("8") && digits.length === 11) {
    digits = "7" + digits.slice(1);
  }

  return digits;
};

export const useChatPolling = () => {
  const dispatch = useDispatch();
  const { idInstance, apiTokenInstance, currentChatId, chatCreatedAt } =
    useSelector((state: RootState) => state.chat);

  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!idInstance || !apiTokenInstance || !currentChatId) {
      isPollingRef.current = false;
      dispatch(setPolling(false));
      return;
    }

    dispatch(setPolling(true));
    isPollingRef.current = true;

    const poll = async () => {
      while (isPollingRef.current) {
        try {
          const notification = await receiveNotification(
            idInstance,
            apiTokenInstance,
          );

          if (!isPollingRef.current) break;

          if (notification && notification.receiptId) {

            if (notification.body.typeWebhook === "incomingMessageReceived") {
              const msgData = notification.body.messageData;

              const incomingRawChatId = notification.body.senderData.senderPhoneNumber;
              const messageTimestamp = notification.body.timestamp * 1000;

              const normalizedIncoming = normalizePhone(incomingRawChatId);
              const normalizedCurrent = normalizePhone(currentChatId);

              const isCorrectChat = normalizedIncoming === normalizedCurrent;
              const isTextMessage = msgData?.typeMessage === "textMessage";
              const isAfterCreation = chatCreatedAt
                ? messageTimestamp > chatCreatedAt
                : true;

              if (isCorrectChat && isTextMessage && isAfterCreation) {
                dispatch(
                  addIncomingMessage({
                    id: notification.body.idMessage,
                    text: msgData.textMessageData.textMessage,
                    timestamp: messageTimestamp,
                    type: "incoming",
                  }),
                );
              } else {
                console.warn(
                  "🚫 Сообщение отфильтровано (не тот чат, не текст или старое)",
                );
              }
            }

            await deleteNotification(
              idInstance,
              apiTokenInstance,
              notification.receiptId,
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err) {
          console.error("🔴 Неожиданная ошибка в цикле опроса:", err);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    };

    poll();

    return () => {
      isPollingRef.current = false;
      dispatch(setPolling(false));
    };
  }, [idInstance, apiTokenInstance, currentChatId, dispatch, chatCreatedAt]);
};
