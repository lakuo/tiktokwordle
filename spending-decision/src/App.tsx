import { QuestionnaireFlow } from './components/questionnaire/QuestionnaireFlow';

/**
 * Deterministic Spending Decision App
 * Modern questionnaire-based React app with sophisticated UX.
 * 
 * Features:
 * - One question per screen with smooth animations
 * - Production-grade UI components
 * - Progressive disclosure of information
 * - Clear decision flow with detailed reasoning
 */


export default function SpendingDecisionApp() {
  const handleComplete = (inputs: any, decision: any) => {
    // Optional: Add analytics or logging here
    console.log('Decision completed:', { inputs, decision });
  };

  return (
    <div className="min-h-screen">
      <QuestionnaireFlow onComplete={handleComplete} />
    </div>
  );
}
