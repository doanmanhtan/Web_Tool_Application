import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State for active tool selection
  const [activeTool, setActiveTool] = useState('dashboard');
  
  // State for files to analyze
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // State for analysis results
  const [results, setResults] = useState({
    semgrep: [],
    snyk: [],
    clangTidy: []
  });
  
  // State for tool configurations
  const [toolConfigs, setToolConfigs] = useState({
    semgrep: {
      rules: [],
      rulesPath: '/home/kali/Desktop/Semgrep/semgrep-rules/c/lang/security/',
      selectedRules: []
    },
    snyk: {
      path: '/home/kali/Desktop/synk',
      options: {}
    },
    clangTidy: {
      checks: [],
      options: {}
    }
  });
  
  // State for tracking analysis progress
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Toggle active tool
  const switchTool = (tool) => {
    setActiveTool(tool);
  };
  
  // Update tool configuration
  const updateToolConfig = (tool, config) => {
    setToolConfigs(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        ...config
      }
    }));
  };
  
  // Start analysis
  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // This would normally call the backend API
    // Mock implementation for now
    setTimeout(() => {
      setResults({
        semgrep: [{id: 1, file: 'example.c', line: 42, rule: 'buffer-overflow', severity: 'ERROR', message: 'Potential buffer overflow detected'}],
        snyk: [{id: 1, file: 'package.json', vulnerability: 'CVE-2023-1234', severity: 'HIGH', description: 'Library X has a vulnerability'}],
        clangTidy: [{id: 1, file: 'main.cpp', line: 27, check: 'clang-analyzer-core.NullDereference', message: 'Null pointer dereference'}]
      });
      setIsAnalyzing(false);
    }, 2000);
  };
  
  const value = {
    activeTool,
    switchTool,
    selectedFiles,
    setSelectedFiles,
    results,
    toolConfigs,
    updateToolConfig,
    isAnalyzing,
    startAnalysis
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};