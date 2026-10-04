import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { setCredentials, setError } from "../../store/chatSlice";
import { DEFAULT_ID_INSTANCE, DEFAULT_API_TOKEN } from "../../api/greenApi";
import "./styles.css";

export const SettingsPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.chat);

  const [idInstance, setIdInstance] = useState(DEFAULT_ID_INSTANCE);
  const [apiToken, setApiToken] = useState(DEFAULT_API_TOKEN);

  const isFormValid = Boolean(idInstance.trim() && apiToken.trim());

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) {
        dispatch(setError(""));
      }
    };

  const handleSave = () => {
    const trimmedId = idInstance.trim();
    const trimmedToken = apiToken.trim();

    if (!trimmedId || !trimmedToken) {
      dispatch(setError("Заполните оба поля: ID Instance и API Token"));
      return;
    }

    dispatch(setCredentials({ idInstance: trimmedId, apiTokenInstance: trimmedToken }));
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
            onChange={handleInputChange(setIdInstance)}
            placeholder="Например: 1101000000"
          />
        </div>
        <div className="form-group">
          <label htmlFor="apiToken">API Token</label>
          <input
            id="apiToken"
            type="password"
            value={apiToken}
            onChange={handleInputChange(setApiToken)}
            placeholder="Ваш apiTokenInstance"
          />
        </div>
        <button
          className={`save-btn ${!isFormValid ? "btn-disabled" : ""}`}
          onClick={handleSave}
          disabled={!isFormValid}
          title={!isFormValid ? "Заполните оба поля для активации кнопки" : ""}
        >
          Применить
        </button>
      </div>
    </div>
  );
};