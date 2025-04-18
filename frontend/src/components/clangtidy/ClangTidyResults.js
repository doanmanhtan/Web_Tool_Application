import React, { useState } from 'react';

const ClangTidyResults = ({ results }) => {
  const [sortBy, setSortBy] = useState('severity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCheck, setFilterCheck] = useState('');
  
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
  
  // Get unique check categories for filtering
  const checkCategories = [...new Set(results.map(item => {
    const parts = item.check.split('-');
    return parts.length > 0 ? parts[0] : item.check;
  }))];
  
  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      let matches = true;
      
      if (filterSeverity !== 'all') {
        matches = matches && result.severity === filterSeverity;
      }
      
      if (filterCheck !== '') {
        matches = matches && result.check.startsWith(filterCheck);
      }
      
      return matches;
    })
    .sort((a, b) => {
      const severityOrder = { 'ERROR': 0, 'WARNING': 1, 'INFO': 2 };
      
      if (sortBy === 'severity') {
        const aValue = severityOrder[a.severity] || 3;
        const bValue = severityOrder[b.severity] || 3;
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
      
      if (sortBy === 'check') {
        return sortOrder === 'asc' 
          ? a.check.localeCompare(b.check)
          : b.check.localeCompare(a.check);
      }
      
      return 0;
    });
  
  return (
    <div className="tool-results clangtidy-results">
      <div className="results-filters">
        <div className="filter-group">
          <label htmlFor="severity-filter">Filter by Severity:</label>
          <select 
            id="severity-filter" 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="ERROR">Error</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="check-filter">Filter by Check Category:</label>
          <select 
            id="check-filter" 
            value={filterCheck}
            onChange={(e) => setFilterCheck(e.target.value)}
          >
            <option value="">All Checks</option>
            {checkCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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
              <th onClick={() => handleSort('check')}>
                Check {getSortIcon('check')}
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
                <td>{result.check}</td>
                <td>{result.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          <p>No issues found with the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ClangTidyResults;