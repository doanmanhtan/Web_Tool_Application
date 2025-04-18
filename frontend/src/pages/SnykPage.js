import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import SnykConfig from '../components/synk/SnykConfig';
import SnykResults from '../components/synk/SnykResults';

const SnykPage = () => {
  const { toolConfigs, updateToolConfig, results } = useAppContext();
  const [activeTab, setActiveTab] = useState('config');
  
  // If there are results, default to results tab
  useEffect(() => {
    if (results.snyk.length > 0) {
      setActiveTab('results');
    }
  }, [results.snyk]);
  
  return (
    <div className="tool-page snyk-page">
      <div className="tool-header">
        <h2>Snyk</h2>
        <p>Dependency and vulnerability scanning</p>
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
          Results {results.snyk.length > 0 && `(${results.snyk.length})`}
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'config' ? (
          <SnykConfig 
            config={toolConfigs.snyk} 
            updateConfig={(config) => updateToolConfig('snyk', config)} 
          />
        ) : (
          <SnykResults results={results.snyk} />
        )}
      </div>
    </div>
  );
};

export default SnykPage;