/**
 * Utility functions for form and data validation
 */

/**
 * Validates if a string is not empty
 * @param {string} value - The value to check
 * @returns {boolean} - True if the value is not empty
 */
export const isNotEmpty = (value) => {
    return value !== null && value !== undefined && value.trim() !== '';
  };
  
  /**
   * Validates if a value is a valid number
   * @param {any} value - The value to check
   * @returns {boolean} - True if the value is a valid number
   */
  export const isNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    return !isNaN(Number(value));
  };
  
  /**
   * Validates if a value is a valid file path
   * @param {string} path - The path to validate
   * @returns {boolean} - True if the path is valid
   */
  export const isValidPath = (path) => {
    if (!isNotEmpty(path)) return false;
    
    // Basic path validation - this is a simplified check
    // In a real application, you would want more sophisticated validation
    return path.trim() !== '' && !path.includes('..') && !path.includes('*');
  };
  
  /**
   * Validates if a string is a valid URL
   * @param {string} url - The URL to validate
   * @returns {boolean} - True if the URL is valid
   */
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Validates a form object against a validation schema
   * @param {Object} data - The form data to validate
   * @param {Object} validationSchema - Schema defining validation rules
   * @returns {Object} - Object with errors and isValid properties
   */
  export const validateForm = (data, validationSchema) => {
    const errors = {};
    
    for (const field in validationSchema) {
      const value = data[field];
      const rules = validationSchema[field];
      
      for (const rule of rules) {
        const { test, message } = rule;
        const isValid = test(value);
        
        if (!isValid) {
          errors[field] = message;
          break;
        }
      }
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  /**
   * Validates if a file is below the maximum size
   * @param {File} file - The file to check
   * @param {number} maxSizeInBytes - Maximum file size in bytes
   * @returns {boolean} - True if the file is valid
   */
  export const isValidFileSize = (file, maxSizeInBytes) => {
    return file.size <= maxSizeInBytes;
  };
  
  /**
   * Validates if a path points to a YAML file
   * @param {string} path - The file path
   * @returns {boolean} - True if the path points to a YAML file
   */
  export const isYamlFile = (path) => {
    if (!isNotEmpty(path)) return false;
    return path.toLowerCase().endsWith('.yaml') || path.toLowerCase().endsWith('.yml');
  };
  
  /**
   * Validates if a path points to a C/C++ source file
   * @param {string} path - The file path
   * @returns {boolean} - True if the path points to a C/C++ file
   */
  export const isCppFile = (path) => {
    if (!isNotEmpty(path)) return false;
    const lowerPath = path.toLowerCase();
    return lowerPath.endsWith('.c') || 
           lowerPath.endsWith('.cpp') || 
           lowerPath.endsWith('.cc') || 
           lowerPath.endsWith('.cxx') || 
           lowerPath.endsWith('.h') || 
           lowerPath.endsWith('.hpp');
  };
  
  /**
   * Validates if a string contains only alphanumeric characters and underscores
   * @param {string} value - The string to validate
   * @returns {boolean} - True if the string is valid
   */
  export const isAlphanumeric = (value) => {
    if (!isNotEmpty(value)) return false;
    return /^[a-zA-Z0-9_]+$/.test(value);
  };
  
  /**
   * Gets a validation schema for Semgrep configuration
   * @returns {Object} - Validation schema
   */
  export const getSemgrepValidationSchema = () => {
    return {
      rulesPath: [
        {
          test: isNotEmpty,
          message: 'Rules path is required'
        },
        {
          test: isValidPath,
          message: 'Invalid path format'
        }
      ],
      selectedRules: [
        {
          test: (value) => Array.isArray(value) && value.length > 0,
          message: 'At least one rule must be selected'
        }
      ]
    };
  };
  
  /**
   * Gets a validation schema for Snyk configuration
   * @returns {Object} - Validation schema
   */
  export const getSnykValidationSchema = () => {
    return {
      path: [
        {
          test: isNotEmpty,
          message: 'Snyk path is required'
        },
        {
          test: isValidPath,
          message: 'Invalid path format'
        }
      ]
    };
  };
  
  /**
   * Gets a validation schema for ClangTidy configuration
   * @returns {Object} - Validation schema
   */
  export const getClangTidyValidationSchema = () => {
    return {
      checks: [
        {
          test: (value) => Array.isArray(value) && value.length > 0,
          message: 'At least one check must be selected'
        }
      ]
    };
  };