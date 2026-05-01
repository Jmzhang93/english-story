import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { exportData, importData } from '../utils/storage';
import './Settings.css';

export default function Settings({ isOpen, onClose, onImport }) {
  const [apiKey, setApiKey] = useLocalStorage('minimax_api_key', '');
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const fileInputRef = useRef(null);
  const [importMessage, setImportMessage] = useState('');

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isOpen]);

  const handleSave = () => {
    setApiKey(inputKey.trim());
    onClose();
  };

  const handleExport = () => {
    exportData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importData(file);
      setImportMessage(`成功导入 ${result.added} 个新短语`);
      if (onImport) onImport();
      setTimeout(() => setImportMessage(''), 3000);
    } catch (err) {
      setImportMessage(err.message);
      setTimeout(() => setImportMessage(''), 3000);
    }
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-content" onClick={e => e.stopPropagation()}>
        <h2>设置</h2>

        <div className="settings-group">
          <label>Minimax API Key</label>
          <p className="settings-hint">
            用于调用故事生成功能。请前往 Minimax 平台获取 API Key。
          </p>
          <div className="api-key-input">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="输入你的 API Key"
            />
            <button
              className="toggle-visibility"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-group">
          <label>数据管理</label>
          <p className="settings-hint">
            导出备份可防止数据丢失，换设备时可导入恢复。
          </p>
          <div className="data-buttons">
            <button className="data-btn export-btn" onClick={handleExport}>
              导出数据
            </button>
            <button className="data-btn import-btn" onClick={handleImportClick}>
              导入数据
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {importMessage && (
            <p className={`import-message ${importMessage.includes('成功') ? 'success' : 'error'}`}>
              {importMessage}
            </p>
          )}
        </div>

        <div className="settings-actions">
          <button className="cancel-btn" onClick={onClose}>
            关闭
          </button>
          <button className="save-btn" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
