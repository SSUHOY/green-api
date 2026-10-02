import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/chatSlice";
import { DEFAULT_ID_INSTANCE, DEFAULT_API_TOKEN } from "../../api/greenApi";
import "./styles.css";

export const SettingsPanel: React.FC = () => {
  const dispatch = useDispatch();
  const [idInstance, setIdInstance] = useState(DEFAULT_ID_INSTANCE);
  const [apiToken, setApiToken] = useState(DEFAULT_API_TOKEN);

  const handleSave = () => {
    dispatch(setCredentials({ idInstance, apiTokenInstance: apiToken }));
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Настройки GREEN-API</h2>
      </div>
      <div className="settings-form">
        <div className="form-group">
          <label htmlFor="idInstance">ID Instance</label>
          <input
            id="idInstance"
            type="text"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="Например: 1101000000"
          />
        </div>
        <div className="form-group">
          <label htmlFor="apiToken">API Token</label>
          <input
            id="apiToken"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Ваш apiTokenInstance"
          />
        </div>
        <button className="save-btn" onClick={handleSave}>
          Применить
        </button>
      </div>
    </div>
  );
};
