import React, { useState, useCallback } from 'react';
import type { Inputs, QuestionStep } from '../../types/questionnaire';
import { QuestionnaireStep } from './QuestionnaireStep';
import { NavigationButtons } from './NavigationButtons';
import { ResultsScreen } from './ResultsScreen';
import { ProgressBar } from '../ui/ProgressBar';
import { ItemBasicsQuestion } from '../questions/ItemBasicsQuestion';
import { FastGatesQuestion } from '../questions/FastGatesQuestion';
import { BenefitsQuestion } from '../questions/BenefitsQuestion';
import { SettingsQuestion } from '../questions/SettingsQuestion';
import { AlternativesQuestion } from '../questions/AlternativesQuestion';
import { useSpendingDecision } from '../../hooks/useSpendingDecision';

const DEFAULT_INPUTS: Inputs = {
  itemName: "",
  category: "TimeSaver",
  price: 0,
  salesTaxRate: 0.08625,
  expectedResale: 0,
  monthsToResale: 36,
  lifetimeOM: 0,
  monthsOfUse: 1,
  currentHoursPerMonth: 0,
  hoursSavedPerMonth: 0,
  probabilityOfUse: 0,
  probabilityRedeploy: 0,
  daysUsedPerMonth: 0,
  yearsOfUse: 0,
  qualityOfLife: 0,
  resaleReversibility: 0,
  regretRisk: 0,
  complexityPenalty: 0,
  isTravel: false,
  isHouse: false,
  isSafetyOrHealthOrIncome: false,
  overThousandCoolingOffPassed: false,
  hasLiquidityCushion: true,
  hasHighInterestDebt: false,
  hasAdequateSavings: true,
  isPrestige: false,
  prestigeSpentYTD: 0,
  prestigeCap: 2500,
  hourlyValue: 60,
  thresholdChoice: "normal",
  discountRate: 0.05,
  resaleHaircut: 0.7,
  useTravelFund: false,
  useHouseFund: false,
  alternativeB: {
    name: "",
    price: 0,
    qualityOfLife: 0,
    hoursSaved: 0,
    yearsOfUse: 0,
    enabled: false,
  },
  alternativeC: {
    name: "",
    price: 0,
    qualityOfLife: 0,
    hoursSaved: 0,
    yearsOfUse: 0,
    enabled: false,
  },
};

const QUESTION_STEPS: QuestionStep[] = [
  {
    id: 'basics',
    title: 'What are you buying?',
    description: 'Tell us about the item and its basic costs.',
    component: ItemBasicsQuestion,
    isValid: (inputs) => inputs.itemName.trim().length > 0 && inputs.price >= 0,
  },
  {
    id: 'gates',
    title: 'Fast-track checks',
    description: 'Some purchases can be approved immediately under special conditions.',
    component: FastGatesQuestion,
    isValid: (inputs) => {
      // If over $1000 and not safety/health/income, must have cooling off confirmed
      const needsCoolingOff = !inputs.isSafetyOrHealthOrIncome && inputs.price > 1000;
      return !needsCoolingOff || inputs.overThousandCoolingOffPassed;
    },
  },
  {
    id: 'benefits',
    title: 'Benefits & usage details',
    description: 'Help us understand how valuable this purchase will be to you.',
    component: BenefitsQuestion,
    isValid: () => true, // All benefit fields are optional or have defaults
  },
  {
    id: 'settings',
    title: 'Your preferences',
    description: 'Customize the decision framework to your situation.',
    component: SettingsQuestion,
    isValid: (inputs) => inputs.hourlyValue > 0 && inputs.prestigeCap >= 0,
  },
  {
    id: 'alternatives',
    title: 'Alternative comparison',
    description: 'Compare against cheaper alternatives to ensure optimal decision.',
    component: AlternativesQuestion,
    isValid: () => true, // Optional step
  },
];

interface QuestionnaireFlowProps {
  onComplete?: (inputs: Inputs, decision: any) => void;
}

export const QuestionnaireFlow: React.FC<QuestionnaireFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [showResults, setShowResults] = useState(false);

  const decision = useSpendingDecision(inputs);

  const updateInputs = useCallback((updates: Partial<Inputs>) => {
    setInputs(prev => ({ ...prev, ...updates }));
  }, []);

  const currentQuestionStep = QUESTION_STEPS[currentStep];
  const isLastStep = currentStep === QUESTION_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const canProceed = currentQuestionStep?.isValid(inputs) ?? false;

  const handleNext = () => {
    if (isLastStep) {
      setShowResults(true);
      onComplete?.(inputs, decision);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setInputs(DEFAULT_INPUTS);
    setCurrentStep(0);
    setShowResults(false);
  };

  const handleExport = () => {
    const payload = {
      inputs,
      decision
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-${inputs.itemName || "item"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showResults) {
    return (
      <ResultsScreen
        decision={decision}
        onRestart={handleRestart}
        onExport={handleExport}
        itemName={inputs.itemName}
      />
    );
  }

  const CurrentQuestionComponent = currentQuestionStep?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto p-4">
          <ProgressBar 
            current={currentStep + 1} 
            total={QUESTION_STEPS.length}
            className="max-w-md mx-auto"
          />
        </div>
      </div>

      {/* Question Content */}
      <QuestionnaireStep
        title={currentQuestionStep?.title || ''}
        description={currentQuestionStep?.description}
        isVisible={true}
      >
        {CurrentQuestionComponent && (
          <CurrentQuestionComponent
            inputs={inputs}
            onUpdate={updateInputs}
          />
        )}

        <NavigationButtons
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextLabel={isLastStep ? 'Get Decision' : 'Continue'}
          nextDisabled={!canProceed}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </QuestionnaireStep>
    </div>
  );
};