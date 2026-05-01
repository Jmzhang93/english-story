import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/storage';

export const usePhrases = () => {
  const [phrases, setPhrases] = useLocalStorage('english_story_phrases', []);

  const addPhrase = useCallback((phrase, meaning) => {
    const newPhrase = {
      id: generateId(),
      phrase: phrase.trim(),
      meaning: meaning.trim(),
      createdAt: new Date().toISOString(),
    };
    setPhrases(prev => [newPhrase, ...prev]);
    return newPhrase;
  }, [setPhrases]);

  const updatePhrase = useCallback((id, phrase, meaning) => {
    setPhrases(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, phrase: phrase.trim(), meaning: meaning.trim() }
          : p
      )
    );
  }, [setPhrases]);

  const deletePhrase = useCallback((id) => {
    setPhrases(prev => prev.filter(p => p.id !== id));
  }, [setPhrases]);

  const searchPhrases = useCallback((query) => {
    if (!query || !query.trim()) return phrases;
    const lowerQuery = query.toLowerCase();
    return phrases.filter(
      p =>
        p.phrase.toLowerCase().includes(lowerQuery) ||
        p.meaning.toLowerCase().includes(lowerQuery)
    );
  }, [phrases]);

  return {
    phrases,
    addPhrase,
    updatePhrase,
    deletePhrase,
    searchPhrases,
  };
};
