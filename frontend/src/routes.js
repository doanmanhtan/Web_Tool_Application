import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Layouts
import Layout from './components/common/Layout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SemgrepPage from './pages/SemgrepPage';
import SnykPage from './pages/SnykPage';
import ClangTidyPage from './pages/ClangTidyPage';
import Results from './pages/Results';
import Settings from './pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="semgrep" element={<SemgrepPage />} />
        <Route path="snyk" element={<SnykPage />} />
        <Route path="clangtidy" element={<ClangTidyPage />} />
        <Route path="results" element={<Results />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;