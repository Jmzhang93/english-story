import { useState } from 'react';
import TabBar from './components/TabBar';
import PhraseLibrary from './components/PhraseLibrary';
import StoryGenerator from './components/StoryGenerator';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('phrases');
  const [showSettings, setShowSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImport = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>EnglishStory</h1>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          aria-label="设置"
        >
          ⚙️
        </button>
      </header>

      <main className="app-content" key={refreshKey}>
        {activeTab === 'phrases' && <PhraseLibrary />}
        {activeTab === 'generate' && <StoryGenerator />}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onImport={handleImport}
      />
    </div>
  );
}

export default App;
