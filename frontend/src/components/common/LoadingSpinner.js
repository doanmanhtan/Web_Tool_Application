import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const spinnerSize = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '4px' },
    large: { width: '60px', height: '60px', borderWidth: '6px' }
  };
  
  const { width, height, borderWidth } = spinnerSize[size] || spinnerSize.medium;
  
  return (
    <div className="loading-container">
      <div 
        className="spinner" 
        style={{ 
          width, 
          height, 
          borderWidth, 
          borderTopWidth: borderWidth 
        }}
      ></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;