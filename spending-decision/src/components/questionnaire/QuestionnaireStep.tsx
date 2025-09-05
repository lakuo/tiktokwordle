import React from 'react';
import { Card } from '../ui/Card';

interface QuestionnaireStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isVisible?: boolean;
}

export const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  title,
  description,
  children,
  isVisible = true
}) => {
  if (!isVisible) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl transform-gpu animate-fade-in-scale">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </Card>
    </div>
  );
};