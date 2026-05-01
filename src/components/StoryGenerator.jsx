import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePhrases } from '../hooks/usePhrases';
import { generateStory } from '../utils/api';
import WordSelector from './WordSelector';
import './StoryGenerator.css';

export default function StoryGenerator() {
  const { phrases } = usePhrases();
  const [apiKey] = useLocalStorage('minimax_api_key', '');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [story, setStory] = useState('');
  const [usedPhrases, setUsedPhrases] = useState([]);
  const [showWordSelector, setShowWordSelector] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setStory('');

    try {
      const result = await generateStory(topic, phrases, apiKey);
      setStory(result.story);
      setUsedPhrases(result.usedPhrases);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecycleClick = () => {
    setShowWordSelector(true);
  };

  if (showWordSelector) {
    return (
      <WordSelector
        story={story}
        onClose={() => setShowWordSelector(false)}
        onAddPhrases={(newPhrases) => {
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

          <div className="story-actions">
            <button className="recycle-btn" onClick={handleRecycleClick}>
              回收新词
            </button>
            <button className="reset-btn" onClick={() => {
              setStory('');
              setUsedPhrases([]);
              setTopic('');
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
