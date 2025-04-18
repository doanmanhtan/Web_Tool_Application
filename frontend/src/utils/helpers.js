/**
 * General utility helper functions
 */

/**
 * Groups an array of objects by a specified property
 * @param {Array} array - The array to group
 * @param {string} key - The property to group by
 * @returns {Object} - Grouped object with keys as property values
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  };
  
  /**
   * Debounces a function to prevent excessive calls
   * @param {Function} func - The function to debounce
   * @param {number} wait - The time to wait in milliseconds
   * @returns {Function} - Debounced function
   */
  export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Deep clones an object or array
   * @param {Object|Array} obj - The object to clone
   * @returns {Object|Array} - Cloned object
   */
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  /**
   * Sorts an array of objects by a property
   * @param {Array} array - The array to sort
   * @param {string} property - The property to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} - Sorted array
   */
  export const sortByProperty = (array, property, direction = 'asc') => {
    const sortOrder = direction === 'asc' ? 1 : -1;
    
    return [...array].sort((a, b) => {
      if (a[property] < b[property]) return -1 * sortOrder;
      if (a[property] > b[property]) return 1 * sortOrder;
      return 0;
    });
  };
  
  /**
   * Filters an array of objects by a search term across multiple properties
   * @param {Array} array - The array to filter
   * @param {string} searchTerm - The search term
   * @param {Array} properties - Properties to search within
   * @returns {Array} - Filtered array
   */
  export const filterBySearchTerm = (array, searchTerm, properties) => {
    if (!searchTerm || !properties.length) return array;
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
      return properties.some(prop => {
        const value = item[prop];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  };
  
  /**
   * Generates a unique ID
   * @param {string} prefix - Optional prefix for the ID
   * @returns {string} - Unique ID
   */
  export const generateId = (prefix = '') => {
    return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Checks if an object is empty
   * @param {Object} obj - The object to check
   * @returns {boolean} - True if the object is empty
   */
  export const isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0;
  };
  
  /**
   * Converts a file object to a base64 string
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - Base64 encoded string
   */
  export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };
  
  /**
   * Checks if a file is of a valid type
   * @param {File} file - The file to check
   * @param {Array} allowedTypes - Array of allowed MIME types
   * @returns {boolean} - True if the file is valid
   */
  export const isValidFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Formats error messages from API responses
   * @param {Object|string} error - The error object or message
   * @returns {string} - Formatted error message
   */
  export const formatErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    if (typeof error === 'string') return error;
    
    if (error.message) return error.message;
    
    if (error.error) return error.error;
    
    return 'An error occurred while processing your request';
  };
  
  /**
   * Creates a download from data
   * @param {string} filename - Name for the download file
   * @param {string} content - File content
   * @param {string} type - MIME type
   */
  export const downloadFile = (filename, content, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  };