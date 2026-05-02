import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePhrases } from '../hooks/usePhrases';
import { generateStory, explainStory } from '../utils/api';
import WordSelector from './WordSelector';
import './StoryGenerator.css';

const WORD_OPTIONS = [
  { label: '50字', value: 50 },
  { label: '100字', value: 100 },
  { label: '200字', value: 200 },
];

const TYPE_OPTIONS = [
  { label: '冒险故事', value: 'adventure' },
  { label: '爱情故事', value: 'romance' },
  { label: '日常生活', value: 'daily' },
  { label: '奇幻故事', value: 'fantasy' },
  { label: '悬疑故事', value: 'mystery' },
];

export default function StoryGenerator() {
  const { phrases } = usePhrases();
  const [apiKey] = useLocalStorage('minimax_api_key', '');
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(200);
  const [storyType, setStoryType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [story, setStory] = useState('');
  const [usedPhrases, setUsedPhrases] = useState([]);
  const [showWordSelector, setShowWordSelector] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setStory('');
    setExplanation('');
    setShowExplanation(false);

    try {
      const result = await generateStory(topic, phrases, apiKey, wordCount, storyType);
      setStory(result.story);
      setUsedPhrases(result.usedPhrases);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!story || isExplaining) return;

    setIsExplaining(true);
    try {
      const result = await explainStory(story, apiKey);
      setExplanation(result);
      setShowExplanation(true);
    } catch (err) {
      setError(err.message);
    }
    setIsExplaining(false);
  };

  const handleRecycleClick = () => {
    setShowWordSelector(true);
  };

  if (showWordSelector) {
    return (
      <WordSelector
        story={story}
        onClose={() => setShowWordSelector(false)}
        onAddPhrases={() => {
          setShowWordSelector(false);
          setStory('');
          setUsedPhrases([]);
        }}
      />
    );
  }

  return (
    <div className="story-generator">
      <div className="generator-header">
        <h2>故事生成</h2>
        <p className="generator-hint">输入一个话题，从你的短语库中挑选素材，生成英语小故事</p>
      </div>

      <div className="topic-input-section">
        <input
          type="text"
          className="topic-input"
          placeholder="例如：今天去东湖跑步"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          disabled={loading}
        />

        <div className="settings-row">
          <div className="setting-group">
            <label>字数</label>
            <div className="option-buttons">
              {WORD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`option-btn ${wordCount === opt.value ? 'active' : ''}`}
                  onClick={() => setWordCount(opt.value)}
                  disabled={loading}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>类型</label>
            <div className="option-buttons">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`option-btn ${storyType === opt.value ? 'active' : ''}`}
                  onClick={() => setStoryType(opt.value)}
                  disabled={loading}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          className={`generate-btn ${loading ? 'loading' : ''}`}
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
        >
          {loading ? (
            <span className="loading-dots">生成中...</span>
          ) : (
            '生成故事'
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {story && (
        <div className="story-result">
          <div className="story-content">
            <h3>生成的故事</h3>
            <div className="story-text">{story}</div>
          </div>

          {usedPhrases.length > 0 && (
            <div className="used-phrases">
              <h4>用到的短语</h4>
              <div className="phrases-list">
                {usedPhrases.map((phrase, index) => (
                  <span key={index} className="phrase-tag">{phrase}</span>
                ))}
              </div>
            </div>
          )}

          {!showExplanation && (
            <button className="explain-btn" onClick={handleExplain} disabled={isExplaining}>
              {isExplaining ? '✨ AI 讲解中...' : '✨ AI 讲解'}
            </button>
          )}

          {showExplanation && explanation && (
            <div className="story-explanation">
              <h4>✨ AI 讲解</h4>
              <div className="explanation-text">{explanation}</div>
            </div>
          )}

          <div className="story-actions">
            <button className="recycle-btn" onClick={handleRecycleClick}>
              回收新词
            </button>
            <button className="reset-btn" onClick={() => {
              setStory('');
              setUsedPhrases([]);
              setTopic('');
              setExplanation('');
              setShowExplanation(false);
            }}>
              新故事
            </button>
          </div>
        </div>
      )}

      {!story && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <p>输入话题，开始生成你的英语故事</p>
        </div>
      )}
    </div>
  );
}