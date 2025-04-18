import React from 'react';
import { Navigate } from 'react-router-dom';

// Home page just redirects to Dashboard
const Home = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Home;