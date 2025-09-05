import React from 'react';
import { Switch } from '../ui/Switch';
import type { Inputs } from '../../types/questionnaire';

interface FastGatesQuestionProps {
  inputs: Inputs;
  onUpdate: (updates: Partial<Inputs>) => void;
}

export const FastGatesQuestion: React.FC<FastGatesQuestionProps> = ({
  inputs,
  onUpdate
}) => {
  const needsCoolingOff = !inputs.isSafetyOrHealthOrIncome && inputs.price > 1000;

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fast-track decisions</h3>
        <p className="text-blue-700">
          These switches can approve your purchase immediately if certain conditions are met.
        </p>
      </div>

      <div className="space-y-6">
        <Switch
          checked={inputs.isTravel}
          onChange={(checked) => onUpdate({ isTravel: checked })}
          label="This is a travel or festival expense"
          description="Examples: flights, hotels, event tickets, transit, luggage for the trip"
        />

        <Switch
          checked={inputs.isHouse}
          onChange={(checked) => onUpdate({ isHouse: checked })}
          label="This is house related"
          description="Examples: inspection, closing costs, furniture, essential repairs"
        />

        <Switch
          checked={inputs.isSafetyOrHealthOrIncome}
          onChange={(checked) => onUpdate({ isSafetyOrHealthOrIncome: checked })}
          label="Safety, health, or income tool"
          description="Safety equipment, medical care, or a tool that directly makes money every week"
        />

        {needsCoolingOff && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L5.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800 mb-2">Cooling-off period required</h4>
                <p className="text-amber-700 mb-4">
                  Since this item costs over $1,000 and isn't for safety/health/income, you need to wait 7 days before making the final decision.
                </p>
                <Switch
                  checked={inputs.overThousandCoolingOffPassed}
                  onChange={(checked) => onUpdate({ overThousandCoolingOffPassed: checked })}
                  label="I have already waited the required 7 days"
                  description="Only check this if you've genuinely waited the cooling-off period"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};