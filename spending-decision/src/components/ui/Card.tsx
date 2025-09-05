import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out cursor-pointer' 
    : '';
  
  return (
    <div className={`
      bg-white rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm
      ${paddingClasses[padding]} ${hoverClasses} ${className}
    `}>
      {children}
    </div>
  );
};