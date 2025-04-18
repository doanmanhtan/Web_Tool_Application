/**
 * Semgrep API service for interacting with Semgrep endpoints
 */
import apiService from './api';

const SEMGREP_ENDPOINTS = {
  RULES: '/semgrep/rules',
  ANALYZE: '/semgrep/analyze',
  CONFIG: '/semgrep/config',
};

/**
 * Service for interacting with Semgrep-related API endpoints
 */
const semgrepService = {
  /**
   * Fetches available Semgrep rules from the specified directory
   * @param {string} rulesPath - Path to the rules directory
   * @returns {Promise<Array>} - List of available rules
   */
  getRules: async (rulesPath) => {
    return apiService.get(SEMGREP_ENDPOINTS.RULES, { path: rulesPath });
  },
  
  /**
   * Submits files for Semgrep analysis
   * @param {FileList|File[]} files - Files to analyze
   * @param {Object} config - Semgrep configuration options
   * @param {Array} config.selectedRules - IDs of selected rules to apply
   * @param {string} config.rulesPath - Path to the rules directory
   * @returns {Promise<Object>} - Analysis results
   */
  analyzeFiles: async (files, config) => {
    return apiService.uploadFiles(SEMGREP_ENDPOINTS.ANALYZE, files, { config });
  },
  
  /**
   * Updates Semgrep configuration
   * @param {Object} config - Semgrep configuration
   * @param {string} config.rulesPath - Path to the rules directory
   * @param {Array} config.selectedRules - IDs of the selected rules
   * @returns {Promise<Object>} - Updated configuration
   */
  updateConfig: async (config) => {
    return apiService.post(SEMGREP_ENDPOINTS.CONFIG, config);
  },
  
  /**
   * Loads a specific Semgrep rule file
   * @param {string} rulePath - Path to the rule file
   * @returns {Promise<Object>} - Rule content
   */
  getRuleContent: async (rulePath) => {
    return apiService.get(`${SEMGREP_ENDPOINTS.RULES}/content`, { path: rulePath });
  },
  
  /**
   * Validates a Semgrep rule file
   * @param {Object} ruleContent - The rule content to validate
   * @returns {Promise<Object>} - Validation results
   */
  validateRule: async (ruleContent) => {
    return apiService.post(`${SEMGREP_ENDPOINTS.RULES}/validate`, { rule: ruleContent });
  },
};

export default semgrepService;