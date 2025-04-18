import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const Navbar = () => {
  const { startAnalysis, isAnalyzing, selectedFiles } = useAppContext();
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h1>Code Analysis Suite</h1>
        </Link>
      </div>
      
      <div className="navbar-file-info">
        {selectedFiles.length > 0 ? (
          <span>{selectedFiles.length} files selected for analysis</span>
        ) : (
          <span>No files selected</span>
        )}
      </div>
      
      <div className="navbar-actions">
        <button 
          className="analyze-btn" 
          onClick={startAnalysis} 
          disabled={isAnalyzing || selectedFiles.length === 0}
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
        
        <Link to="/settings" className="settings-link">
          <span className="settings-icon">⚙️</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;