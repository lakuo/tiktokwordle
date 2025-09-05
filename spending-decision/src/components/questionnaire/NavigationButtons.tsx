import React from 'react';
import { Button } from '../ui/Button';

interface NavigationButtonsProps {
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  nextDisabled?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  loading?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onPrevious,
  nextLabel = 'Continue',
  previousLabel = 'Back',
  nextDisabled = false,
  isFirstStep = false,
  isLastStep = false,
  loading = false
}) => {
  return (
    <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100">
      {!isFirstStep ? (
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevious}
          disabled={loading}
          className="group"
        >
          <svg 
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {previousLabel}
        </Button>
      ) : (
        <div />
      )}
      
      <Button
        variant="primary"
        size="lg"
        onClick={onNext}
        disabled={nextDisabled || loading}
        loading={loading}
        className="group min-w-[120px]"
      >
        {nextLabel}
        {!isLastStep && (
          <svg 
            className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </Button>
    </div>
  );
};