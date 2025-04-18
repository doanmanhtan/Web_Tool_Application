/**
 * Snyk API service for interacting with Snyk endpoints
 */
import apiService from './api';

const SNYK_ENDPOINTS = {
  ANALYZE: '/snyk/analyze',
  CONFIG: '/snyk/config',
  VULNERABILITIES: '/snyk/vulnerabilities',
};

/**
 * Service for interacting with Snyk-related API endpoints
 */
const snykService = {
  /**
   * Submits files for Snyk vulnerability analysis
   * @param {FileList|File[]} files - Files to analyze
   * @param {Object} config - Snyk configuration options
   * @param {boolean} config.scanDependencies - Whether to scan dependencies
   * @param {boolean} config.scanCode - Whether to scan code
   * @param {string} config.severity - Minimum severity level to report
   * @returns {Promise<Object>} - Analysis results
   */
  analyzeFiles: async (files, config) => {
    return apiService.uploadFiles(SNYK_ENDPOINTS.ANALYZE, files, { config });
  },
  
  /**
   * Updates Snyk configuration
   * @param {Object} config - Snyk configuration
   * @param {string} config.path - Path to the Snyk directory
   * @param {Object} config.options - Snyk options
   * @returns {Promise<Object>} - Updated configuration
   */
  updateConfig: async (config) => {
    return apiService.post(SNYK_ENDPOINTS.CONFIG, config);
  },
  
  /**
   * Gets vulnerability details for a specific vulnerability ID
   * @param {string} vulnId - The vulnerability ID
   * @returns {Promise<Object>} - Vulnerability details
   */
  getVulnerabilityDetails: async (vulnId) => {
    return apiService.get(`${SNYK_ENDPOINTS.VULNERABILITIES}/${vulnId}`);
  },
  
  /**
   * Gets suggested fixes for a vulnerability
   * @param {string} vulnId - The vulnerability ID
   * @returns {Promise<Array>} - List of suggested fixes
   */
  getSuggestedFixes: async (vulnId) => {
    return apiService.get(`${SNYK_ENDPOINTS.VULNERABILITIES}/${vulnId}/fixes`);
  },
  
  /**
   * Tests a specific package for vulnerabilities
   * @param {string} packageName - The package name
   * @param {string} version - The package version
   * @returns {Promise<Object>} - Vulnerability results
   */
  testPackage: async (packageName, version) => {
    return apiService.get(`${SNYK_ENDPOINTS.VULNERABILITIES}/package`, {
      name: packageName,
      version,
    });
  },
};

export default snykService;