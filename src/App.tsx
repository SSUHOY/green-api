import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { setError } from "./store/chatSlice";
import {
  SettingsPanel,
  ChatSidebar,
  MessageList,
  MessageInput,
} from "./components";
import { useChatPolling } from "./hooks/useChatPolling";
import "./App.css";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentChatId, error } = useSelector(
    (state: RootState) => state.chat,
  );

  useChatPolling();

  return (
    <div className="app">
      <SettingsPanel />

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => dispatch(setError(""))}>✕</button>
        </div>
      )}

      <div className="chat-container">
        <ChatSidebar />

        <div className="chat-main">
          {currentChatId ? (
            <>
              <MessageList />
              <MessageInput />
            </>
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-icon"></div>
              <p>Введите номер телефона и начните чат</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
