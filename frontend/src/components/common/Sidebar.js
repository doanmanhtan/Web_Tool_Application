import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const Sidebar = () => {
  const { activeTool, switchTool, results } = useAppContext();
  
  // Helper to count issues
  const countIssues = (toolResults) => {
    return toolResults.length;
  };
  
  return (
    <aside className="sidebar">
      <div className="tools-section">
        <h3>Analysis Tools</h3>
        <ul className="tool-list">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => switchTool('dashboard')}
            >
              <div className="tool-icon">📊</div>
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/semgrep" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => switchTool('semgrep')}
            >
              <div className="tool-icon">🔍</div>
              <span>Semgrep</span>
              {results.semgrep.length > 0 && (
                <span className="issue-count">{countIssues(results.semgrep)}</span>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/snyk" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => switchTool('snyk')}
            >
              <div className="tool-icon">🔐</div>
              <span>Snyk</span>
              {results.snyk.length > 0 && (
                <span className="issue-count">{countIssues(results.snyk)}</span>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/clangtidy" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => switchTool('clangTidy')}
            >
              <div className="tool-icon">🛠️</div>
              <span>ClangTidy</span>
              {results.clangTidy.length > 0 && (
                <span className="issue-count">{countIssues(results.clangTidy)}</span>
              )}
            </NavLink>
          </li>
        </ul>
      </div>
      
      <div className="results-section">
        <NavLink 
          to="/results" 
          className={({ isActive }) => isActive ? 'active' : ''}
          onClick={() => switchTool('results')}
        >
          <div className="tool-icon">📝</div>
          <span>Results Summary</span>
          {(results.semgrep.length + results.snyk.length + results.clangTidy.length > 0) && (
            <span className="issue-count total">
              {results.semgrep.length + results.snyk.length + results.clangTidy.length}
            </span>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;