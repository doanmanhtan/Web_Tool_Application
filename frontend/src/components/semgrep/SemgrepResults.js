import React, { useState } from 'react';

const SemgrepResults = ({ results }) => {
  const [sortBy, setSortBy] = useState('severity');
  const [sortOrder, setSortOrder] = useState('desc');
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
  
  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      if (filterSeverity === 'all') return true;
      return result.severity === filterSeverity;
    })
    .sort((a, b) => {
      const severityOrder = { 'CRITICAL': 0, 'ERROR': 1, 'HIGH': 1, 'WARNING': 2, 'MEDIUM': 2, 'INFO': 3, 'LOW': 3 };
      
      if (sortBy === 'severity') {
        const aValue = severityOrder[a.severity] || 4;
        const bValue = severityOrder[b.severity] || 4;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortBy === 'file') {
        return sortOrder === 'asc' 
          ? a.file.localeCompare(b.file)
          : b.file.localeCompare(a.file);
      }
      
      if (sortBy === 'line') {
        return sortOrder === 'asc' 
          ? a.line - b.line
          : b.line - a.line;
      }
      
      if (sortBy === 'rule') {
        return sortOrder === 'asc' 
          ? a.rule.localeCompare(b.rule)
          : b.rule.localeCompare(a.rule);
      }
      
      return 0;
    });
  
  return (
    <div className="tool-results semgrep-results">
      <div className="results-filters">
        <div className="filter-group">
          <label htmlFor="severity-filter">Filter by Severity:</label>
          <select 
            id="severity-filter" 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="ERROR">Error</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>
      
      {filteredResults.length > 0 ? (
        <table className="results-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('severity')}>
                Severity {getSortIcon('severity')}
              </th>
              <th onClick={() => handleSort('file')}>
                File {getSortIcon('file')}
              </th>
              <th onClick={() => handleSort('line')}>
                Line {getSortIcon('line')}
              </th>
              <th onClick={() => handleSort('rule')}>
                Rule {getSortIcon('rule')}
              </th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index} className={`severity-${result.severity.toLowerCase()}`}>
                <td>{result.severity}</td>
                <td>{result.file}</td>
                <td>{result.line}</td>
                <td>{result.rule}</td>
                <td>{result.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          <p>No results found{filterSeverity !== 'all' ? ` with ${filterSeverity} severity` : ''}.</p>
        </div>
      )}
    </div>
  );
};

export default SemgrepResults;