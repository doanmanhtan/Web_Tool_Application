import React, { useState } from 'react';

const SnykConfig = ({ config, updateConfig }) => {
  const [path, setPath] = useState(config.path);
  const [scanDependencies, setScanDependencies] = useState(config.options?.scanDependencies || true);
  const [scanCode, setScanCode] = useState(config.options?.scanCode || true);
  const [severity, setSeverity] = useState(config.options?.severity || 'medium');
  
  const handlePathChange = (e) => {
    setPath(e.target.value);
  };
  
  const handleSaveConfig = () => {
    updateConfig({
      path,
      options: {
        scanDependencies,
        scanCode,
        severity
      }
    });
  };
  
  return (
    <div className="tool-config snyk-config">
      <div className="config-section">
        <h3>Snyk Configuration</h3>
        
        <div className="form-group">
          <label htmlFor="snyk-path">Snyk Directory</label>
          <div className="path-input">
            <input 
              type="text" 
              id="snyk-path" 
              value={path} 
              onChange={handlePathChange}
              placeholder="/path/to/snyk"
            />
            <button className="browse-btn">Browse</button>
          </div>
          <p className="help-text">Directory containing Snyk configuration</p>
        </div>
        
        <div className="form-group">
          <h4>Scan Options</h4>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="scan-dependencies" 
              checked={scanDependencies}
              onChange={() => setScanDependencies(!scanDependencies)}
            />
            <label htmlFor="scan-dependencies">Scan Dependencies</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="scan-code" 
              checked={scanCode}
              onChange={() => setScanCode(!scanCode)}
            />
            <label htmlFor="scan-code">Scan Code</label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="severity">Minimum Severity Level</label>
          <select 
            id="severity" 
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="critical">Critical only</option>
            <option value="high">High and above</option>
            <option value="medium">Medium and above</option>
            <option value="low">Low and above</option>
          </select>
          <p className="help-text">Only report vulnerabilities at or above this severity</p>
        </div>
      </div>
      
      <div className="config-actions">
        <button className="save-config" onClick={handleSaveConfig}>Save Configuration</button>
      </div>
    </div>
  );
};

export default SnykConfig;