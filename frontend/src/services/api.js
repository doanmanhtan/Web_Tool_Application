/**
 * Base API service for making HTTP requests to the backend
 */

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * Makes a fetch request with the given options
 * @param {string} url - The URL to fetch
 * @param {Object} options - The fetch options
 * @returns {Promise<any>} - The parsed response data
 */
const fetchWithOptions = async (url, options) => {
  try {
    const response = await fetch(url, options);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * API service methods for making HTTP requests
 */
const apiService = {
  /**
   * Makes a GET request to the given endpoint
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} params - Query parameters to include
   * @returns {Promise<any>} - The parsed response data
   */
  get: async (endpoint, params = {}) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    return fetchWithOptions(url.toString(), {
      method: 'GET',
      headers: defaultHeaders,
    });
  },
  
  /**
   * Makes a POST request to the given endpoint
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} data - The data to send in the request body
   * @returns {Promise<any>} - The parsed response data
   */
  post: async (endpoint, data = {}) => {
    return fetchWithOptions(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Makes a PUT request to the given endpoint
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} data - The data to send in the request body
   * @returns {Promise<any>} - The parsed response data
   */
  put: async (endpoint, data = {}) => {
    return fetchWithOptions(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Makes a DELETE request to the given endpoint
   * @param {string} endpoint - The API endpoint to request
   * @returns {Promise<any>} - The parsed response data
   */
  delete: async (endpoint) => {
    return fetchWithOptions(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
  },
  
  /**
   * Uploads files to the given endpoint
   * @param {string} endpoint - The API endpoint to upload to
   * @param {FileList|File[]} files - The files to upload
   * @param {Object} additionalData - Additional data to include in the request
   * @returns {Promise<any>} - The parsed response data
   */
  uploadFiles: async (endpoint, files, additionalData = {}) => {
    const formData = new FormData();
    
    // Append files to FormData
    if (files instanceof FileList) {
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
    } else if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }
    
    // Append additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, 
        typeof additionalData[key] === 'object' 
          ? JSON.stringify(additionalData[key]) 
          : additionalData[key]
      );
    });
    
    return fetchWithOptions(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      // Do not set Content-Type header when using FormData, browser will set it correctly with boundary
      headers: {},
    });
  },
};

export default apiService;