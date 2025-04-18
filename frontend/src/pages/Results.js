import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const Results = () => {
  const { results } = useAppContext();
  const [sortBy, setSortBy] = useState('severity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTool, setFilterTool] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const getSortIcon = (field) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  // Combine all results into a single array with tool information
  const allResults = [
    ...results.semgrep.map(item => ({ ...item, tool: 'semgrep' })),
    ...results.snyk.map(item => ({ ...item, tool: 'snyk' })),
    ...results.clangTidy.map(item => ({ ...item, tool: 'clangTidy' }))
  ];
  
  // Calculate statistics
  const stats = {
    total: allResults.length,
    bySeverity: {
      critical: allResults.filter(item => 
        item.severity === 'CRITICAL').length,
      high: allResults.filter(item => 
        ['HIGH', 'ERROR'].includes(item.severity)).length,
      medium: allResults.filter(item => 
        ['MEDIUM', 'WARNING'].includes(item.severity)).length,
      low: allResults.filter(item => 
        ['LOW', 'INFO'].includes(item.severity)).length
    },
    byTool: {
      semgrep: results.semgrep.length,
      snyk: results.snyk.length,
      clangTidy: results.clangTidy.length
    }
  };
  
  // Filter and sort results
  const filteredResults = allResults
    .filter(result => {
      let matches = true;
      
      if (filterTool !== 'all') {
        matches = matches && result.tool === filterTool;
      }
      
      if (filterSeverity !== 'all') {
        // Group similar severities
        if (filterSeverity === 'CRITICAL') {
          matches = matches && result.severity === 'CRITICAL';
        } else if (filterSeverity === 'HIGH') {
          matches = matches && ['HIGH', 'ERROR'].includes(result.severity);
        } else if (filterSeverity === 'MEDIUM') {
          matches = matches && ['MEDIUM', 'WARNING'].includes(result.severity);
        } else if (filterSeverity === 'LOW') {
          matches = matches && ['LOW', 'INFO'].includes(result.severity);
        }
      }
      
      return matches;
    })
    .sort((a, b) => {
      const severityOrder = {
        'CRITICAL': 0,
        'HIGH': 1, 'ERROR': 1,
        'MEDIUM': 2, 'WARNING': 2,
        'LOW': 3, 'INFO': 3
      };
      
      if (sortBy === 'severity') {
        const aValue = severityOrder[a.severity] || 4;
        const bValue = severityOrder[b.severity] || 4;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortBy === 'tool') {
        return sortOrder === 'asc' 
          ? a.tool.localeCompare(b.tool)
          : b.tool.localeCompare(a.tool);
      }
      
      if (sortBy === 'file') {
        return sortOrder === 'asc' 
          ? a.file.localeCompare(b.file)
          : b.file.localeCompare(a.file);
      }
      
      return 0;
    });
  
  // Helper function to get a standardized issue description based on tool
  const getIssueDescription = (result) => {
    if (result.tool === 'semgrep') {
      return `${result.rule}: ${result.message}`;
    } else if (result.tool === 'snyk') {
      return `${result.vulnerability}: ${result.description}`;
    } else if (result.tool === 'clangTidy') {
      return `${result.check}: ${result.message}`;
    }
    return 'Unknown issue';
  };
  
  // Format tool name for display
  const formatToolName = (tool) => {
    if (tool === 'semgrep') return 'Semgrep';
    if (tool === 'snyk') return 'Snyk';
    if (tool === 'clangTidy') return 'ClangTidy';
    return tool;
  };
  
  return (
    <div className="results-page">
      <div className="results-header">
        <h2>Analysis Results</h2>
        <p>Combined results from all tools</p>
      </div>
      
      <div className="results-summary">
        <div className="summary-stats">
          <div className="stat-card total">
            <h3>Total Issues</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card critical">
            <h3>Critical</h3>
            <div className="stat-value">{stats.bySeverity.critical}</div>
          </div>
          <div className="stat-card high">
            <h3>High</h3>
            <div className="stat-value">{stats.bySeverity.high}</div>
          </div>
          <div className="stat-card medium">
            <h3>Medium</h3>
            <div className="stat-value">{stats.bySeverity.medium}</div>
          </div>
          <div className="stat-card low">
            <h3>Low</h3>
            <div className="stat-value">{stats.bySeverity.low}</div>
          </div>
        </div>
        
        <div className="summary-by-tool">
          <h3>Issues by Tool</h3>
          <div className="tool-stats">
            <div className="tool-stat semgrep">
              <h4>Semgrep</h4>
              <div className="stat-value">{stats.byTool.semgrep}</div>
            </div>
            <div className="tool-stat snyk">
              <h4>Snyk</h4>
              <div className="stat-value">{stats.byTool.snyk}</div>
            </div>
            <div className="tool-stat clangtidy">
              <h4>ClangTidy</h4>
              <div className="stat-value">{stats.byTool.clangTidy}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="results-filters">
        <div className="filter-group">
          <label htmlFor="tool-filter">Filter by Tool:</label>
          <select 
            id="tool-filter" 
            value={filterTool}
            onChange={(e) => setFilterTool(e.target.value)}
          >
            <option value="all">All Tools</option>
            <option value="semgrep">Semgrep</option>
            <option value="snyk">Snyk</option>
            <option value="clangTidy">ClangTidy</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="severity-filter">Filter by Severity:</label>
          <select 
            id="severity-filter" 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High/Error</option>
            <option value="MEDIUM">Medium/Warning</option>
            <option value="LOW">Low/Info</option>
          </select>
        </div>
      </div>
      
      {filteredResults.length > 0 ? (
        <table className="results-table combined-results">
          <thead>
            <tr>
              <th onClick={() => handleSort('tool')}>
                Tool {getSortIcon('tool')}
              </th>
              <th onClick={() => handleSort('severity')}>
                Severity {getSortIcon('severity')}
              </th>
              <th onClick={() => handleSort('file')}>
                File {getSortIcon('file')}
              </th>
              <th>Line</th>
              <th>Issue</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index} className={`severity-${result.severity?.toLowerCase()}`}>
                <td>{formatToolName(result.tool)}</td>
                <td>{result.severity}</td>
                <td>{result.file}</td>
                <td>{result.line || '-'}</td>
                <td>{getIssueDescription(result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          <p>No issues found with the current filters.</p>
        </div>
      )}
      
      {filteredResults.length > 0 && (
        <div className="export-actions">
          <button className="export-btn">Export Results as CSV</button>
          <button className="export-btn">Export Results as PDF</button>
        </div>
      )}
    </div>
  );
};

export default Results;