import { useState, useEffect } from 'react';

const IMPORT_EVENT = 'english_story_import';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      console.error(`Error reading localStorage key "${key}":`, e);
      return initialValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (err) {
          console.error(`Error parsing localStorage change:`, err);
        }
      }
    };

    const handleImportEvent = (e) => {
      if (e.detail && e.detail[key]) {
        setStoredValue(e.detail[key]);
      } else if (key === 'english_story_phrases') {
        setStoredValue(e.detail.phrases);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(IMPORT_EVENT, handleImportEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(IMPORT_EVENT, handleImportEvent);
    };
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (e) {
      console.error(`Error setting localStorage key "${key}":`, e);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
