import React, { useState, useEffect } from 'react';
import RulesList from './RulesList';

const SemgrepConfig = ({ config, updateConfig }) => {
  const [rulesPath, setRulesPath] = useState(config.rulesPath);
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState(config.selectedRules);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate fetching available rules from the backend
  useEffect(() => {
    // In a real application, this would make an API call to get rules
    setIsLoading(true);
    setTimeout(() => {
      // Mock data for available rules
      const mockRules = [
        { id: 'rule1', name: 'buffer-overflow.yml', description: 'Detects potential buffer overflow vulnerabilities' },
        { id: 'rule2', name: 'command-injection.yml', description: 'Finds command injection vulnerabilities' },
        { id: 'rule3', name: 'sql-injection.yml', description: 'Identifies SQL injection risks' },
        { id: 'rule4', name: 'use-after-free.yml', description: 'Detects use-after-free memory issues' },
        { id: 'rule5', name: 'format-string.yml', description: 'Finds format string vulnerabilities' },
        { id: 'rule6', name: 'integer-overflow.yml', description: 'Detects integer overflow vulnerabilities' },
        { id: 'rule7', name: 'null-pointer.yml', description: 'Identifies null pointer dereference issues' }
      ];
      setAvailableRules(mockRules);
      setIsLoading(false);
    }, 1000);
  }, [rulesPath]);
  
  const handlePathChange = (e) => {
    setRulesPath(e.target.value);
  };
  
  const handleRuleToggle = (ruleId) => {
    setSelectedRules(prev => {
      if (prev.includes(ruleId)) {
        return prev.filter(id => id !== ruleId);
      } else {
        return [...prev, ruleId];
      }
    });
  };
  
  const handleSelectAll = () => {
    setSelectedRules(availableRules.map(rule => rule.id));
  };
  
  const handleDeselectAll = () => {
    setSelectedRules([]);
  };
  
  const handleSaveConfig = () => {
    updateConfig({
      rulesPath,
      selectedRules
    });
  };
  
  return (
    <div className="tool-config semgrep-config">
      <div className="config-section">
        <h3>Semgrep Configuration</h3>
        
        <div className="form-group">
          <label htmlFor="rules-path">Rules Directory</label>
          <div className="path-input">
            <input 
              type="text" 
              id="rules-path" 
              value={rulesPath} 
              onChange={handlePathChange}
              placeholder="/path/to/semgrep/rules"
            />
            <button className="browse-btn">Browse</button>
          </div>
          <p className="help-text">Directory containing Semgrep YAML rule files</p>
        </div>
        
        <div className="form-actions">
          <button 
            className="refresh-btn"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
          >
            Refresh Rules
          </button>
        </div>
      </div>
      
      <div className="rules-section">
        <div className="rules-header">
          <h3>Available Rules</h3>
          <div className="rules-actions">
            <button className="select-all" onClick={handleSelectAll}>Select All</button>
            <button className="deselect-all" onClick={handleDeselectAll}>Deselect All</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-rules">
            <div className="spinner"></div>
            <p>Loading rules...</p>
          </div>
        ) : (
          <RulesList 
            rules={availableRules} 
            selectedRules={selectedRules} 
            onRuleToggle={handleRuleToggle}
          />
        )}
      </div>
      
      <div className="config-actions">
        <button className="save-config" onClick={handleSaveConfig}>Save Configuration</button>
      </div>
    </div>
  );
};

export default SemgrepConfig;