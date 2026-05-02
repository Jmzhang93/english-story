import { useState } from 'react';
import './PhraseCard.css';

export default function PhraseCard({ phrase, onDelete, onEdit }) {
  const [showDelete, setShowDelete] = useState(false);
  const [startX, setStartX] = useState(0);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const diff = startX - e.touches[0].clientX;
    if (diff > 50) {
      setShowDelete(true);
    } else if (diff < -50) {
      setShowDelete(false);
    }
  };

  const handleDelete = () => {
    onDelete(phrase.id);
    setShowDelete(false);
  };

  return (
    <div className={`phrase-card-container ${showDelete ? 'show-delete' : ''}`}>
      <div
        className="phrase-card"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={() => showDelete && setShowDelete(false)}
      >
        <div className="phrase-english">{phrase.phrase}</div>
        <div className="phrase-meaning">{phrase.meaning}</div>
        <div className="phrase-date">{formatDate(phrase.created_at)}</div>
        <button
          className="edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(phrase);
          }}
        >
          编辑
        </button>
      </div>
      <button className="delete-btn" onClick={handleDelete}>
        删除
      </button>
    </div>
  );
}