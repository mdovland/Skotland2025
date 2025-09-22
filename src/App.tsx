import React, { useState } from 'react';
import TripInfo from './components/TripInfo';
import Competition from './components/Competition';
import Results from './components/Results';
import './App.css';

type TabType = 'info' | 'competition' | 'results';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('info');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏴󐁧󐁢󐁳󐁣󐁴󐁿 Scotland Golf Trip 2025 ⛳</h1>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'info' ? 'active' : ''}
            onClick={() => setActiveTab('info')}
          >
            Trip Info
          </button>
          <button
            className={activeTab === 'competition' ? 'active' : ''}
            onClick={() => setActiveTab('competition')}
          >
            Competition
          </button>
          <button
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => setActiveTab('results')}
          >
            Results
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === 'info' && <TripInfo />}
        {activeTab === 'competition' && <Competition />}
        {activeTab === 'results' && <Results />}
      </main>
    </div>
  );
}

export default App;
