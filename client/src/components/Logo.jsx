import React from 'react';

const Logo = ({ className = '', textClassName = 'text-blue-950' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Medical Cross + Ascending Graph SVG */}
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        className="w-8 h-8 flex-shrink-0 text-blue-900"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="#1e3a8a" fillOpacity="0.1" />
        <path 
          d="M16 8V24M8 16H24" 
          stroke="#1e3a8a" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <path 
          d="M10 20L14 16L18 19L24 13" 
          stroke="#2563eb" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      <span className={`font-bold tracking-tight text-xl ${textClassName}`}>
        SGT San Jorge
      </span>
    </div>
  );
};

export default Logo;
