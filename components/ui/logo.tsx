import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const AIALogo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 48,
  showText = true 
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Icon */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="mb-1"
      >
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="#ff6b35"
          stroke="#ff6b35"
          strokeWidth="2"
        />
        
        {/* Inner Circular Elements */}
        <circle
          cx="35"
          cy="35"
          r="15"
          fill="none"
          stroke="#7cb342"
          strokeWidth="3"
          opacity="0.8"
        />
        
        <circle
          cx="65"
          cy="35"
          r="12"
          fill="none"
          stroke="#7cb342"
          strokeWidth="3"
          opacity="0.6"
        />
        
        <circle
          cx="50"
          cy="65"
          r="18"
          fill="none"
          stroke="#7cb342"
          strokeWidth="3"
          opacity="0.7"
        />
        
        {/* Connecting Lines */}
        <path
          d="M 30 40 Q 50 30 70 40"
          fill="none"
          stroke="#7cb342"
          strokeWidth="2"
          opacity="0.8"
        />
        
        <path
          d="M 40 50 Q 60 45 75 55"
          fill="none"
          stroke="#7cb342"
          strokeWidth="2"
          opacity="0.7"
        />
        
        <path
          d="M 25 55 Q 45 60 55 75"
          fill="none"
          stroke="#7cb342"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Center Dots */}
        <circle cx="45" cy="45" r="2" fill="#7cb342" />
        <circle cx="60" cy="50" r="2" fill="#ff6b35" />
        <circle cx="40" cy="60" r="2" fill="#7cb342" />
      </svg>
      
      {/* Text */}
      {showText && (
        <div className="text-center leading-tight">
          <div 
            className="text-lg font-bold tracking-wide"
            style={{ color: '#7cb342', fontSize: `${size * 0.25}px` }}
          >
            AIA
          </div>
          <div 
            className="text-xs font-semibold tracking-widest"
            style={{ color: '#ff6b35', fontSize: `${size * 0.12}px` }}
          >
            AUTOMATE
          </div>
        </div>
      )}
    </div>
  );
};

export default AIALogo; 