import { useState, useEffect } from 'react';
import './PhraseModal.css';

export default function PhraseModal({ isOpen, onClose, onSave, editPhrase }) {
  const [phrase, setPhrase] = useState('');
  const [meaning, setMeaning] = useState('');

  useEffect(() => {
    if (editPhrase) {
      setPhrase(editPhrase.phrase);
      setMeaning(editPhrase.meaning);
    } else {
      setPhrase('');
      setMeaning('');
    }
  }, [editPhrase, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phrase.trim() && meaning.trim()) {
      onSave(phrase, meaning);
      setPhrase('');
      setMeaning('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{editPhrase ? '编辑短语' : '添加短语'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>英文短语 / 句子</label>
            <textarea
              value={phrase}
              onChange={e => setPhrase(e.target.value)}
              placeholder="e.g. as free as a bird"
              rows={2}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>中文释义</label>
            <textarea
              value={meaning}
              onChange={e => setMeaning(e.target.value)}
              placeholder="e.g. 像鸟儿一样自由"
              rows={2}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!phrase.trim() || !meaning.trim()}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
