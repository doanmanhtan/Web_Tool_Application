import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const Settings = () => {
  const { toolConfigs, updateToolConfig } = useAppContext();
  
  // General settings
  const [theme, setTheme] = useState('light');
  const [autoRunAnalysis, setAutoRunAnalysis] = useState(false);
  
  // Path settings
  const [semgrepPath, setSemgrepPath] = useState(toolConfigs.semgrep.rulesPath);
  const [snykPath, setSnykPath] = useState(toolConfigs.snyk.path);
  const [clangTidyPath, setClangTidyPath] = useState('/usr/bin/clang-tidy');
  
  const handleSaveSettings = () => {
    // Update paths for each tool
    updateToolConfig('semgrep', { rulesPath: semgrepPath });
    updateToolConfig('snyk', { path: snykPath });
    
    // Display a success message (this could be improved with a proper toast/notification system)
    alert('Settings saved successfully');
  };
  
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Application Settings</h2>
        <p>Configure global settings for the application</p>
      </div>
      
      <div className="settings-section">
        <h3>General Settings</h3>
        
        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select 
            id="theme" 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        
        <div className="form-group">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="auto-run" 
              checked={autoRunAnalysis}
              onChange={() => setAutoRunAnalysis(!autoRunAnalysis)}
            />
            <label htmlFor="auto-run">Automatically run analysis when files are selected</label>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Tool Paths</h3>
        <p>Configure the file system paths for each analysis tool</p>
        
        <div className="form-group">
          <label htmlFor="semgrep-path">Semgrep Rules Path</label>
          <div className="path-input">
            <input 
              type="text" 
              id="semgrep-path" 
              value={semgrepPath} 
              onChange={(e) => setSemgrepPath(e.target.value)}
              placeholder="/path/to/semgrep/rules"
            />
            <button className="browse-btn">Browse</button>
          </div>
          <p className="help-text">Directory containing Semgrep YAML rule files</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="snyk-path">Snyk Path</label>
          <div className="path-input">
            <input 
              type="text" 
              id="snyk-path" 
              value={snykPath} 
              onChange={(e) => setSnykPath(e.target.value)}
              placeholder="/path/to/snyk"
            />
            <button className="browse-btn">Browse</button>
          </div>
          <p className="help-text">Directory containing Snyk configuration</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="clangtidy-path">ClangTidy Executable Path</label>
          <div className="path-input">
            <input 
              type="text" 
              id="clangtidy-path" 
              value={clangTidyPath} 
              onChange={(e) => setClangTidyPath(e.target.value)}
              placeholder="/usr/bin/clang-tidy"
            />
            <button className="browse-btn">Browse</button>
          </div>
          <p className="help-text">Path to the ClangTidy executable</p>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="save-settings" onClick={handleSaveSettings}>Save Settings</button>
        <button className="reset-settings">Reset to Defaults</button>
      </div>
    </div>
  );
};

export default Settings;