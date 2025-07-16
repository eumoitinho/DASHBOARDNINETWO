"use client";
import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Carregando...' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
      <div className="text-center">
        <div className={`spinner-border ${sizeClasses[size]}`} style={{color: '#D00054'}} role="status">
          <span className="visually-hidden">{text}</span>
        </div>
        {text && (
          <p className="mt-3 text-muted">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 