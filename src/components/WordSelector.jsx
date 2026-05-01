import { useState } from 'react';
import { usePhrases } from '../hooks/usePhrases';
import './WordSelector.css';

export default function WordSelector({ story, onClose, onAddPhrases }) {
  const { addPhrase } = usePhrases();
  const [selectedWords, setSelectedWords] = useState([]);
  const [inputWord, setInputWord] = useState('');
  const [inputMeaning, setInputMeaning] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [pendingWord, setPendingWord] = useState('');

  const words = story.match(/\b[a-zA-Z][a-zA-Z'-]*\b/g) || [];

  const handleWordClick = (word) => {
    const lowerWord = word.toLowerCase();
    if (selectedWords.includes(lowerWord)) {
      setSelectedWords(selectedWords.filter(w => w !== lowerWord));
    } else {
      setSelectedWords([...selectedWords, lowerWord]);
    }
  };

  const handleStartAdd = (word) => {
    setPendingWord(word);
    setInputMeaning('');
    setShowInput(true);
  };

  const handleConfirmAdd = () => {
    if (pendingWord && inputMeaning.trim()) {
      addPhrase(pendingWord, inputMeaning.trim());
      setSelectedWords(selectedWords.filter(w => w !== pendingWord.toLowerCase()));
      setShowInput(false);
      setPendingWord('');
      setInputMeaning('');
    }
  };

  const handleAddAllSelected = () => {
    setShowInput(true);
    setPendingWord(selectedWords.join(', '));
    setInputMeaning('');
  };

  const getUniqueWords = () => {
    const unique = [...new Set(words.map(w => w.toLowerCase()))];
    return unique.filter(w => w.length > 2);
  };

  return (
    <div className="word-selector">
      <div className="word-selector-header">
        <button className="back-btn" onClick={onClose}>
          ← 返回
        </button>
        <h2>新词回收</h2>
      </div>

      <p className="selector-hint">点击单词选中，然后添加中文释义加入短语库</p>

      <div className="story-review">
        <h3>故事原文</h3>
        <div className="story-with-words">
          {story.split(/(\s+)/).map((part, index) => {
            if (part.trim() === '') return <span key={index}>{part}</span>;
            const word = part.match(/^[a-zA-Z][a-zA-Z'-]*$/);
            if (word) {
              const isSelected = selectedWords.includes(word[0].toLowerCase());
              return (
                <span
                  key={index}
                  className={`clickable-word ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleWordClick(word[0])}
                >
                  {part}
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      </div>

      {selectedWords.length > 0 && (
        <div className="selected-words">
          <div className="selected-header">
            <span>已选中 {selectedWords.length} 个单词</span>
            <button className="add-all-btn" onClick={handleAddAllSelected}>
              一键添加
            </button>
          </div>
          <div className="selected-list">
            {selectedWords.map(word => (
              <button
                key={word}
                className="selected-chip"
                onClick={() => handleStartAdd(word)}
              >
                {word}
                <span className="chip-meaning">{inputMeaning || '添加释义'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="all-words">
        <h3>可选单词（点击添加）</h3>
        <div className="words-cloud">
          {getUniqueWords().map(word => (
            <button
              key={word}
              className={`word-chip ${selectedWords.includes(word) ? 'selected' : ''}`}
              onClick={() => handleWordClick(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {showInput && (
        <div className="meaning-input-modal">
          <div className="meaning-input-content">
            <h3>添加释义</h3>
            <div className="pending-word">{pendingWord}</div>
            <textarea
              value={inputMeaning}
              onChange={e => setInputMeaning(e.target.value)}
              placeholder="输入中文释义"
              rows={2}
              autoFocus
            />
            <div className="input-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowInput(false)}
              >
                取消
              </button>
              <button
                className="confirm-btn"
                onClick={handleConfirmAdd}
                disabled={!inputMeaning.trim()}
              >
                添加到短语库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
