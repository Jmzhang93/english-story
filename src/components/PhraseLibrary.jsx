import { useState } from 'react';
import { usePhrases } from '../hooks/usePhrases';
import PhraseCard from './PhraseCard';
import PhraseModal from './PhraseModal';
import './PhraseLibrary.css';

export default function PhraseLibrary() {
  const { phrases, addPhrase, updatePhrase, deletePhrase, searchPhrases } = usePhrases();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);

  const filteredPhrases = searchQuery
    ? searchPhrases(searchQuery)
    : phrases;

  const handleSave = (phrase, meaning) => {
    if (editingPhrase) {
      updatePhrase(editingPhrase.id, phrase, meaning);
    } else {
      addPhrase(phrase, meaning);
    }
    setEditingPhrase(null);
  };

  const handleEdit = (phrase) => {
    setEditingPhrase(phrase);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    deletePhrase(id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPhrase(null);
  };

  return (
    <div className="phrase-library">
      <div className="library-header">
        <h2>短语库</h2>
        <p className="library-count">{phrases.length} 个短语</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="搜索短语..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="phrases-list">
        {filteredPhrases.length > 0 ? (
          filteredPhrases.map(phrase => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="empty-state">
            {searchQuery ? (
              <>
                <div className="empty-icon">🔍</div>
                <p>没有找到匹配的短语</p>
              </>
            ) : (
              <>
                <div className="empty-icon">📝</div>
                <p>还没有短语</p>
                <p className="empty-hint">点击下方按钮添加第一个短语</p>
              </>
            )}
          </div>
        )}
      </div>

      <button
        className="fab"
        onClick={() => setShowModal(true)}
        aria-label="添加短语"
      >
        +
      </button>

      <PhraseModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editPhrase={editingPhrase}
      />
    </div>
  );
}
