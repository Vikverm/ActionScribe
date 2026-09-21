import React, { useState } from 'react';
import logoImage from '../assets/images/actionscribe_clean_logo_1789724989077.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showBadge?: boolean;
  tagline?: string;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  tagline = 'Listen • Scribe • Act',
  className = '',
  onClick,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-14 h-14 rounded-2xl',
  };

  const titleSizes = {
    sm: 'text-xs font-bold',
    md: 'text-sm sm:text-base font-extrabold',
    lg: 'text-lg sm:text-xl font-extrabold',
    xl: 'text-2xl sm:text-3xl font-extrabold',
  };

  return (
    <div 
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Logo Icon Mark - Clean White/Light Container with Crisp Border, Never Black */}
      <div 
        className={`relative ${iconSizes[size]} overflow-hidden shadow-xs border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 group p-0.5`}
      >
        {!imageError ? (
          <img
            src={logoImage}
            alt="ActionScribe Logo"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Crisp vector fallback symbol with vibrant indigo/blue styling (No Black) */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center p-1 rounded-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M4 19L12 4L20 19M8 15H16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 13.5L12 16.5L18 10.5"
                stroke="#38BDF8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Brand Text without AI badge for clean professional appearance */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center leading-none">
          <span className={`${titleSizes[size]} tracking-tight text-slate-900 dark:text-neutral-100 font-display font-black`}>
            ActionScribe
          </span>
        </div>

        {showTagline && size !== 'sm' && (
          <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium tracking-normal mt-0.5 leading-none">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
