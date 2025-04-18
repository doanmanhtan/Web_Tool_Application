import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import FileUploader from '../common/FileUploader';

const Dashboard = () => {
  const { results, selectedFiles } = useAppContext();
  
  // Calculate total issues
  const totalIssues = results.semgrep.length + results.snyk.length + results.clangTidy.length;
  
  // Calculate statistics
  const statistics = {
    critical: results.semgrep.filter(issue => issue.severity === 'CRITICAL').length + 
              results.snyk.filter(issue => issue.severity === 'CRITICAL').length + 
              results.clangTidy.filter(issue => issue.severity === 'CRITICAL').length,
    high: results.semgrep.filter(issue => issue.severity === 'HIGH' || issue.severity === 'ERROR').length + 
          results.snyk.filter(issue => issue.severity === 'HIGH').length + 
          results.clangTidy.filter(issue => issue.severity === 'HIGH' || issue.severity === 'ERROR').length,
    medium: results.semgrep.filter(issue => issue.severity === 'MEDIUM' || issue.severity === 'WARNING').length + 
            results.snyk.filter(issue => issue.severity === 'MEDIUM').length + 
            results.clangTidy.filter(issue => issue.severity === 'MEDIUM' || issue.severity === 'WARNING').length,
    low: results.semgrep.filter(issue => issue.severity === 'LOW' || issue.severity === 'INFO').length + 
         results.snyk.filter(issue => issue.severity === 'LOW').length + 
         results.clangTidy.filter(issue => issue.severity === 'LOW' || issue.severity === 'INFO').length,
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Code Analysis Dashboard</h2>
        <p>Integrated analysis with Semgrep, Snyk, and ClangTidy</p>
      </div>
      
      {selectedFiles.length === 0 ? (
        <div className="upload-section">
          <h3>Get Started</h3>
          <p>Upload or select files to begin code analysis</p>
          <FileUploader />
        </div>
      ) : (
        <>
          <div className="stats-overview">
            <div className="stat-card total">
              <h3>Total Issues</h3>
              <div className="stat-value">{totalIssues}</div>
            </div>
            <div className="stat-card critical">
              <h3>Critical</h3>
              <div className="stat-value">{statistics.critical}</div>
            </div>
            <div className="stat-card high">
              <h3>High</h3>
              <div className="stat-value">{statistics.high}</div>
            </div>
            <div className="stat-card medium">
              <h3>Medium</h3>
              <div className="stat-value">{statistics.medium}</div>
            </div>
            <div className="stat-card low">
              <h3>Low</h3>
              <div className="stat-value">{statistics.low}</div>
            </div>
          </div>
          
          <div className="tool-summary">
            <h3>Tool Summary</h3>
            <div className="tool-cards">
              <div className="tool-card">
                <div className="tool-header">
                  <h4>Semgrep</h4>
                  <span className="issue-count">{results.semgrep.length}</span>
                </div>
                <p>Static code analysis for security vulnerabilities</p>
                <Link to="/semgrep" className="tool-link">Configure & View Results</Link>
              </div>
              
              <div className="tool-card">
                <div className="tool-header">
                  <h4>Snyk</h4>
                  <span className="issue-count">{results.snyk.length}</span>
                </div>
                <p>Dependency vulnerability scanning</p>
                <Link to="/snyk" className="tool-link">Configure & View Results</Link>
              </div>
              
              <div className="tool-card">
                <div className="tool-header">
                  <h4>ClangTidy</h4>
                  <span className="issue-count">{results.clangTidy.length}</span>
                </div>
                <p>C/C++ linting and static analysis</p>
                <Link to="/clangtidy" className="tool-link">Configure & View Results</Link>
              </div>
            </div>
          </div>
          
          <div className="recent-issues">
            <h3>Recent Issues</h3>
            {totalIssues > 0 ? (
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>File</th>
                    <th>Issue</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {[...results.semgrep, ...results.snyk, ...results.clangTidy]
                    .sort((a, b) => {
                      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'ERROR': 1, 'MEDIUM': 2, 'WARNING': 2, 'LOW': 3, 'INFO': 3 };
                      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
                    })
                    .slice(0, 5)
                    .map((issue, index) => {
                      // Determine which tool this issue is from
                      let tool = 'Unknown';
                      if (results.semgrep.includes(issue)) tool = 'Semgrep';
                      else if (results.snyk.includes(issue)) tool = 'Snyk';
                      else if (results.clangTidy.includes(issue)) tool = 'ClangTidy';
                      
                      return (
                        <tr key={index}>
                          <td>{tool}</td>
                          <td>{issue.file}</td>
                          <td>{issue.message || issue.description || issue.rule || issue.vulnerability || issue.check}</td>
                          <td className={`severity ${issue.severity?.toLowerCase()}`}>{issue.severity}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <p className="no-issues">No issues found yet. Run an analysis to see results.</p>
            )}
            {totalIssues > 5 && (
              <Link to="/results" className="view-all">View All Issues</Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;