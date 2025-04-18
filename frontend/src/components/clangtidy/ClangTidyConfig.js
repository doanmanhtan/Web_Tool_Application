import React, { useState, useEffect } from 'react';

const ClangTidyConfig = ({ config, updateConfig }) => {
  const [checks, setChecks] = useState(config.checks || []);
  const [commandArgs, setCommandArgs] = useState(config.options?.commandArgs || '');
  const [compilerOptions, setCompilerOptions] = useState(config.options?.compilerOptions || '');
  const [availableChecks, setAvailableChecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate fetching available checks from the backend
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Mock data for available checks
      const mockChecks = [
        { id: 'check1', name: 'clang-analyzer-core.NullDereference', description: 'Check for null pointer dereferences' },
        { id: 'check2', name: 'clang-analyzer-security.insecureAPI.*', description: 'Check for insecure API usage' },
        { id: 'check3', name: 'bugprone-*', description: 'Check for bug-prone code patterns' },
        { id: 'check4', name: 'modernize-*', description: 'Suggest modern C++ alternatives' },
        { id: 'check5', name: 'performance-*', description: 'Check for performance issues' },
        { id: 'check6', name: 'readability-*', description: 'Check for readability improvements' },
        { id: 'check7', name: 'cert-*', description: 'CERT secure coding guidelines checks' }
      ];
      setAvailableChecks(mockChecks);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleCheckToggle = (checkId) => {
    setChecks(prev => {
      if (prev.includes(checkId)) {
        return prev.filter(id => id !== checkId);
      } else {
        return [...prev, checkId];
      }
    });
  };
  
  const handleSelectAll = () => {
    setChecks(availableChecks.map(check => check.id));
  };
  
  const handleDeselectAll = () => {
    setChecks([]);
  };
  
  const handleCommandArgsChange = (e) => {
    setCommandArgs(e.target.value);
  };
  
  const handleCompilerOptionsChange = (e) => {
    setCompilerOptions(e.target.value);
  };
  
  const handleSaveConfig = () => {
    updateConfig({
      checks,
      options: {
        commandArgs,
        compilerOptions
      }
    });
  };
  
  return (
    <div className="tool-config clangtidy-config">
      <div className="config-section">
        <h3>ClangTidy Configuration</h3>
        
        <div className="form-group">
          <label htmlFor="command-args">Command Arguments</label>
          <input 
            type="text" 
            id="command-args" 
            value={commandArgs} 
            onChange={handleCommandArgsChange}
            placeholder="Additional command line arguments"
          />
          <p className="help-text">Additional arguments to pass to clang-tidy command</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="compiler-options">Compiler Options</label>
          <input 
            type="text" 
            id="compiler-options" 
            value={compilerOptions} 
            onChange={handleCompilerOptionsChange}
            placeholder="e.g., -Wall -Wextra"
          />
          <p className="help-text">Compiler options to use during analysis</p>
        </div>
      </div>
      
      <div className="checks-section">
        <div className="checks-header">
          <h3>ClangTidy Checks</h3>
          <div className="checks-actions">
            <button className="select-all" onClick={handleSelectAll}>Select All</button>
            <button className="deselect-all" onClick={handleDeselectAll}>Deselect All</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-checks">
            <div className="spinner"></div>
            <p>Loading checks...</p>
          </div>
        ) : (
          <div className="checks-list">
            {availableChecks.map(check => (
              <div key={check.id} className="check-item">
                <div className="check-header">
                  <input
                    type="checkbox"
                    id={`check-${check.id}`}
                    checked={checks.includes(check.id)}
                    onChange={() => handleCheckToggle(check.id)}
                  />
                  <label htmlFor={`check-${check.id}`} className="check-name">{check.name}</label>
                </div>
                <p className="check-description">{check.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="config-actions">
        <button className="save-config" onClick={handleSaveConfig}>Save Configuration</button>
      </div>
    </div>
  );
};

export default ClangTidyConfig;