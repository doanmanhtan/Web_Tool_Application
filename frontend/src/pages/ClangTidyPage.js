import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import ClangTidyConfig from '../components/clangtidy/ClangTidyConfig';
import ClangTidyResults from '../components/clangtidy/ClangTidyResults';

const ClangTidyPage = () => {
  const { toolConfigs, updateToolConfig, results } = useAppContext();
  const [activeTab, setActiveTab] = useState('config');
  
  // If there are results, default to results tab
  useEffect(() => {
    if (results.clangTidy.length > 0) {
      setActiveTab('results');
    }
  }, [results.clangTidy]);
  
  return (
    <div className="tool-page clangtidy-page">
      <div className="tool-header">
        <h2>ClangTidy</h2>
        <p>C/C++ static code analysis and linting</p>
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
          Results {results.clangTidy.length > 0 && `(${results.clangTidy.length})`}
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'config' ? (
          <ClangTidyConfig 
            config={toolConfigs.clangTidy} 
            updateConfig={(config) => updateToolConfig('clangTidy', config)} 
          />
        ) : (
          <ClangTidyResults results={results.clangTidy} />
        )}
      </div>
    </div>
  );
};

export default ClangTidyPage;