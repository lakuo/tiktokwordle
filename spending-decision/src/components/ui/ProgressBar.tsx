import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showSteps?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showSteps = true,
  className = ''
}) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className={`w-full ${className}`}>
      {showSteps && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Step {current} of {total}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}% complete
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="w-full h-full bg-white bg-opacity-20 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex justify-between mt-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i < current ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};