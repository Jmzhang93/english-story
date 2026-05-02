import { useState } from 'react';
import { usePhrases } from '../hooks/usePhrases';
import { explainWord } from '../utils/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './WordSelector.css';

export default function WordSelector({ story, onClose, onAddPhrases }) {
  const { addPhrase } = usePhrases();
  const [apiKey] = useLocalStorage('minimax_api_key', '');
  const [selectedWords, setSelectedWords] = useState([]);
  const [inputMeaning, setInputMeaning] = useState('');
  const [inputExample, setInputExample] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [pendingWord, setPendingWord] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

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
    setInputExample('');
    setShowInput(true);
  };

  const handleAIExplain = async () => {
    if (!pendingWord || isExplaining) return;

    setIsExplaining(true);
    try {
      const result = await explainWord(pendingWord, apiKey);
      setInputMeaning(result.meaning);
      setInputExample(result.example ? `${result.example}\n${result.translation}` : '');
    } catch (err) {
      console.error('Explain error:', err);
      setInputMeaning('（AI解释失败，请手动输入）');
    }
    setIsExplaining(false);
  };

  const handleConfirmAdd = () => {
    if (pendingWord && inputMeaning.trim()) {
      const finalExample = inputExample.trim() ? `\n例句：${inputExample}` : '';
      addPhrase(pendingWord, inputMeaning.trim() + finalExample);
      setSelectedWords(selectedWords.filter(w => w !== pendingWord.toLowerCase()));
      setShowInput(false);
      setPendingWord('');
      setInputMeaning('');
      setInputExample('');
    }
  };

  const handleAddAllSelected = () => {
    if (selectedWords.length === 1) {
      handleStartAdd(selectedWords[0]);
    } else {
      setShowInput(true);
      setPendingWord(selectedWords.join(', '));
      setInputMeaning('');
      setInputExample('');
    }
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
            <div className="ai-explain-row">
              <button
                className="ai-explain-btn"
                onClick={handleAIExplain}
                disabled={isExplaining}
              >
                {isExplaining ? 'AI 解释中...' : '✨ AI 帮我写释义'}
              </button>
            </div>
            <textarea
              value={inputMeaning}
              onChange={e => setInputMeaning(e.target.value)}
              placeholder="输入中文释义"
              rows={2}
            />
            <textarea
              value={inputExample}
              onChange={e => setInputExample(e.target.value)}
              placeholder="（可选）输入例句和翻译"
              rows={2}
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