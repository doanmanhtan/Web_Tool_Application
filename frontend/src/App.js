import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';

// Layouts
import Layout from './components/common/Layout';

// Pages
// import Dashboard from './pages/Dashboard';
import Dashboard from './components/dashboard/Dashboard';
import SemgrepPage from './pages/SemgrepPage';
import SnykPage from './pages/SnykPage';
import ClangTidyPage from './pages/ClangTidyPage';
import Results from './pages/Results';
import Settings from './pages/Settings';


function App() {
  const { isAnalyzing } = useAppContext();

  return (
    <div className="app">
      {isAnalyzing && (
        <div className="analysis-overlay">
          <div className="spinner"></div>
          <p>Analyzing your code...</p>
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="semgrep" element={<SemgrepPage />} />
          <Route path="snyk" element={<SnykPage />} />
          <Route path="clangtidy" element={<ClangTidyPage />} />
          <Route path="results" element={<Results />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;