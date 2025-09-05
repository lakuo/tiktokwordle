import React from 'react';
import { Card } from './Card';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  direction = 'up',
  delay = 0
}) => {
  const directionClasses = {
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right', 
    up: 'animate-slide-in-up',
    down: 'animate-slide-in-down'
  };

  return (
    <div 
      className={`${directionClasses[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card hover className="transform-gpu">
        {children}
      </Card>
    </div>
  );
};