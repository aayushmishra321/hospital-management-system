import React from 'react';
import { Loader2, Heart, Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'medical' | 'pulse';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  message, 
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const getIcon = () => {
    switch (variant) {
      case 'medical':
        return <Heart className={`${sizeClasses[size]} text-red-500 animate-pulse`} />;
      case 'pulse':
        return <Activity className={`${sizeClasses[size]} text-blue-500 animate-bounce`} />;
      default:
        return <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {getIcon()}
      {message && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Skeleton loader for content
export function LoadingSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded h-4 mb-3 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-200 rounded h-6 w-32"></div>
        <div className="bg-gray-200 rounded-full h-8 w-8"></div>
      </div>
      <div className="bg-gray-200 rounded h-8 w-20 mb-2"></div>
      <div className="bg-gray-200 rounded h-4 w-full mb-2"></div>
      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
    </div>
  );
}

// Table skeleton for data tables
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded h-4 flex-1"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={`bg-gray-200 rounded h-4 flex-1 ${
                colIndex === 0 ? 'w-1/4' : colIndex === columns - 1 ? 'w-1/6' : ''
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}