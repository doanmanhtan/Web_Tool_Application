/**
 * Utility functions for formatting data
 */

/**
 * Formats a severity level to a standardized form
 * @param {string} severity - The original severity string
 * @returns {string} - Standardized severity format
 */
export const formatSeverity = (severity) => {
    if (!severity) return 'UNKNOWN';
    
    const severityUpper = severity.toUpperCase();
    
    // Map similar severities to standardized values
    if (severityUpper === 'ERROR') return 'HIGH';
    if (severityUpper === 'WARNING') return 'MEDIUM';
    if (severityUpper === 'INFO') return 'LOW';
    
    return severityUpper;
  };
  
  /**
   * Formats a file path to a shorter, more readable form
   * @param {string} filePath - The full file path
   * @returns {string} - Formatted file path
   */
  export const formatFilePath = (filePath) => {
    if (!filePath) return '';
    
    // Get the last 2-3 directories and filename
    const parts = filePath.split('/');
    if (parts.length <= 3) return filePath;
    
    return '...' + parts.slice(-3).join('/');
  };
  
  /**
   * Formats a date to a readable string
   * @param {string|Date} date - The date to format
   * @param {boolean} includeTime - Whether to include the time
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date, includeTime = false) => {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('en-US', options);
  };
  
  /**
   * Truncates a string to a specified length
   * @param {string} str - The string to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} - Truncated string with ellipsis if needed
   */
  export const truncateString = (str, maxLength = 50) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    
    return str.substring(0, maxLength) + '...';
  };
  
  /**
   * Formats a file size to a readable string
   * @param {number} bytes - File size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted file size
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };
  
  /**
   * Formats an issue ID or reference to a more readable form
   * @param {string} id - The issue ID or reference
   * @returns {string} - Formatted ID
   */
  export const formatIssueId = (id) => {
    if (!id) return '';
    
    // Handle CVE IDs
    if (id.startsWith('CVE-')) {
      return id;
    }
    
    // Handle long hash-like IDs
    if (id.length > 10 && /^[a-f0-9]+$/i.test(id)) {
      return id.substring(0, 8);
    }
    
    return id;
  };
  
  /**
   * Formats a tool name to a display-friendly version
   * @param {string} toolName - The tool name
   * @returns {string} - Formatted tool name
   */
  export const formatToolName = (toolName) => {
    if (!toolName) return '';
    
    switch (toolName.toLowerCase()) {
      case 'semgrep':
        return 'Semgrep';
      case 'snyk':
        return 'Snyk';
      case 'clangtidy':
        return 'ClangTidy';
      default:
        return toolName.charAt(0).toUpperCase() + toolName.slice(1);
    }
  };
  
  /**
   * Converts camelCase to Title Case
   * @param {string} camelCase - CamelCase string
   * @returns {string} - Title Case string
   */
  export const camelToTitleCase = (camelCase) => {
    if (!camelCase) return '';
    
    // Insert a space before all uppercase letters, then capitalize the first letter
    const result = camelCase
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    
    return result;
  };