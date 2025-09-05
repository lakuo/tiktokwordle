import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false
}) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <button
          type="button"
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transform hover:scale-105 active:scale-95
            ${checked 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md' 
              : 'bg-gray-300 hover:bg-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 
              transition-all duration-200 ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
      <div className="flex-1">
        <label 
          className={`text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
        {description && (
          <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};