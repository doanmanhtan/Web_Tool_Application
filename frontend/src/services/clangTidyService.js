/**
 * ClangTidy API service for interacting with ClangTidy endpoints
 */
import apiService from './api';

const CLANGTIDY_ENDPOINTS = {
  ANALYZE: '/clangtidy/analyze',
  CONFIG: '/clangtidy/config',
  CHECKS: '/clangtidy/checks',
};

/**
 * Service for interacting with ClangTidy-related API endpoints
 */
const clangTidyService = {
  /**
   * Fetches available ClangTidy checks
   * @returns {Promise<Array>} - List of available checks
   */
  getAvailableChecks: async () => {
    return apiService.get(CLANGTIDY_ENDPOINTS.CHECKS);
  },
  
  /**
   * Submits files for ClangTidy analysis
   * @param {FileList|File[]} files - Files to analyze
   * @param {Object} config - ClangTidy configuration options
   * @param {Array} config.checks - Selected checks to run
   * @param {Object} config.options - ClangTidy options
   * @returns {Promise<Object>} - Analysis results
   */
  analyzeFiles: async (files, config) => {
    return apiService.uploadFiles(CLANGTIDY_ENDPOINTS.ANALYZE, files, { config });
  },
  
  /**
   * Updates ClangTidy configuration
   * @param {Object} config - ClangTidy configuration
   * @param {Array} config.checks - IDs of selected checks
   * @param {Object} config.options - Additional options
   * @returns {Promise<Object>} - Updated configuration
   */
  updateConfig: async (config) => {
    return apiService.post(CLANGTIDY_ENDPOINTS.CONFIG, config);
  },
  
  /**
   * Gets details about a specific check
   * @param {string} checkId - The check ID
   * @returns {Promise<Object>} - Check details
   */
  getCheckDetails: async (checkId) => {
    return apiService.get(`${CLANGTIDY_ENDPOINTS.CHECKS}/${checkId}`);
  },
  
  /**
   * Tests ClangTidy with a sample code snippet
   * @param {string} code - The code to test
   * @param {Array} checks - The checks to apply
   * @returns {Promise<Object>} - Test results
   */
  testCode: async (code, checks) => {
    return apiService.post(`${CLANGTIDY_ENDPOINTS.ANALYZE}/test`, {
      code,
      checks,
    });
  },
  
  /**
   * Gets suggested fixes for an issue
   * @param {string} issueId - The issue ID
   * @returns {Promise<Object>} - Suggested fixes
   */
  getSuggestedFixes: async (issueId) => {
    return apiService.get(`${CLANGTIDY_ENDPOINTS.ANALYZE}/fixes/${issueId}`);
  },
};

export default clangTidyService;