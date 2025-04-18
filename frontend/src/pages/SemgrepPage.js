import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import SemgrepConfig from '../components/semgrep/SemgrepConfig';
import SemgrepResults from '../components/semgrep/SemgrepResults';

const SemgrepPage = () => {
  const { toolConfigs, updateToolConfig, results } = useAppContext();
  const [activeTab, setActiveTab] = useState('config');
  
  // If there are results, default to results tab
  useEffect(() => {
    if (results.semgrep.length > 0) {
      setActiveTab('results');
    }
  }, [results.semgrep]);
  
  return (
    <div className="tool-page semgrep-page">
      <div className="tool-header">
        <h2>Semgrep</h2>
        <p>Static code analysis with custom rules</p>
      </div>
      
      <div className="tool-tabs">
        <button 
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button 
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Results {results.semgrep.length > 0 && `(${results.semgrep.length})`}
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'config' ? (
          <SemgrepConfig 
            config={toolConfigs.semgrep} 
            updateConfig={(config) => updateToolConfig('semgrep', config)} 
          />
        ) : (
          <SemgrepResults results={results.semgrep} />
        )}
      </div>
    </div>
  );
};

export default SemgrepPage;