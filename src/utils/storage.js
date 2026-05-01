const STORAGE_KEY = 'english_story_phrases';
const IMPORT_EVENT = 'english_story_import';

export const getPhrases = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return [];
  }
};

export const savePhrases = (phrases) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const exportData = () => {
  const phrases = getPhrases();
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    phrases,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `english-story-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.phrases || !Array.isArray(data.phrases)) {
          reject(new Error('文件格式错误'));
          return;
        }
        const existingPhrases = getPhrases();
        const existingIds = new Set(existingPhrases.map(p => p.id));
        const newPhrases = data.phrases.filter(p => !existingIds.has(p.id));
        const merged = [...newPhrases, ...existingPhrases];
        savePhrases(merged);
        window.dispatchEvent(new CustomEvent(IMPORT_EVENT, { detail: { phrases: merged } }));
        resolve({ added: newPhrases.length, total: merged.length });
      } catch (err) {
        reject(new Error('文件解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};

export const subscribeToImport = (callback) => {
  const handler = (e) => callback(e.detail.phrases);
  window.addEventListener(IMPORT_EVENT, handler);
  return () => window.removeEventListener(IMPORT_EVENT, handler);
};
