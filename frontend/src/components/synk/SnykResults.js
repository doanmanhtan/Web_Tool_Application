import React, { useState } from 'react';

const SnykResults = ({ results }) => {
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
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      
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
      
      if (sortBy === 'vulnerability') {
        return sortOrder === 'asc' 
          ? a.vulnerability.localeCompare(b.vulnerability)
          : b.vulnerability.localeCompare(a.vulnerability);
      }
      
      return 0;
    });
  
  return (
    <div className="tool-results snyk-results">
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
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
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
              <th onClick={() => handleSort('vulnerability')}>
                Vulnerability {getSortIcon('vulnerability')}
              </th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index} className={`severity-${result.severity.toLowerCase()}`}>
                <td>{result.severity}</td>
                <td>{result.file}</td>
                <td>{result.vulnerability}</td>
                <td>{result.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          <p>No vulnerabilities found{filterSeverity !== 'all' ? ` with ${filterSeverity} severity` : ''}.</p>
        </div>
      )}
    </div>
  );
};

export default SnykResults;