import React from 'react';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import type { Inputs } from '../../types/questionnaire';

interface AlternativesQuestionProps {
  inputs: Inputs;
  onUpdate: (updates: Partial<Inputs>) => void;
}

export const AlternativesQuestion: React.FC<AlternativesQuestionProps> = ({
  inputs,
  onUpdate
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Compare alternatives</h3>
        <p className="text-blue-700">
          The algorithm will reject your choice if a cheaper alternative provides better value. 
          Define up to 2 alternatives to ensure your decision is optimal.
        </p>
      </div>

      {/* Alternative B */}
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Alternative B (cheaper option)</h4>
          <Switch
            checked={inputs.alternativeB.enabled}
            onChange={(checked) => onUpdate({ 
              alternativeB: { ...inputs.alternativeB, enabled: checked }
            })}
            label="Compare this option"
          />
        </div>

        {inputs.alternativeB.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Alternative name"
              description="What is this cheaper alternative?"
              value={inputs.alternativeB.name}
              onChange={(e) => onUpdate({ 
                alternativeB: { ...inputs.alternativeB, name: e.target.value }
              })}
              placeholder="e.g., Basic car wash instead of detail"
            />

            <Input
              label="Price (USD)"
              description="All-in cost including tax"
              type="number"
              value={inputs.alternativeB.price}
              onChange={(e) => onUpdate({ 
                alternativeB: { ...inputs.alternativeB, price: Number(e.target.value) || 0 }
              })}
              min={0}
              step="0.01"
              leftIcon={<span>$</span>}
            />

            <Input
              label="Quality of life gain (0-5)"
              description="Same scale as main item"
              type="number"
              value={inputs.alternativeB.qualityOfLife}
              onChange={(e) => onUpdate({ 
                alternativeB: { ...inputs.alternativeB, qualityOfLife: Number(e.target.value) || 0 }
              })}
              min={0}
              max={5}
              step="0.1"
            />

            <Input
              label="Hours saved per month"
              description="Time this alternative saves you"
              type="number"
              value={inputs.alternativeB.hoursSaved}
              onChange={(e) => onUpdate({ 
                alternativeB: { ...inputs.alternativeB, hoursSaved: Number(e.target.value) || 0 }
              })}
              min={0}
              step="0.1"
            />

            <Input
              label="Years of use"
              description="How long will this alternative last?"
              type="number"
              value={inputs.alternativeB.yearsOfUse}
              onChange={(e) => onUpdate({ 
                alternativeB: { ...inputs.alternativeB, yearsOfUse: Number(e.target.value) || 0 }
              })}
              min={0}
              step="0.1"
            />
          </div>
        )}
      </div>

      {/* Alternative C */}
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Alternative C (do nothing/DIY)</h4>
          <Switch
            checked={inputs.alternativeC.enabled}
            onChange={(checked) => onUpdate({ 
              alternativeC: { ...inputs.alternativeC, enabled: checked }
            })}
            label="Compare this option"
          />
        </div>

        {inputs.alternativeC.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Alternative name"
              description="What does doing nothing/DIY mean?"
              value={inputs.alternativeC.name}
              onChange={(e) => onUpdate({ 
                alternativeC: { ...inputs.alternativeC, name: e.target.value }
              })}
              placeholder="e.g., Wash car myself, Keep current setup"
            />

            <Input
              label="Price (USD)"
              description="Cost of DIY supplies/time (usually $0)"
              type="number"
              value={inputs.alternativeC.price}
              onChange={(e) => onUpdate({ 
                alternativeC: { ...inputs.alternativeC, price: Number(e.target.value) || 0 }
              })}
              min={0}
              step="0.01"
              leftIcon={<span>$</span>}
            />

            <Input
              label="Quality of life gain (0-5)"
              description="Usually 0 for do-nothing option"
              type="number"
              value={inputs.alternativeC.qualityOfLife}
              onChange={(e) => onUpdate({ 
                alternativeC: { ...inputs.alternativeC, qualityOfLife: Number(e.target.value) || 0 }
              })}
              min={0}
              max={5}
              step="0.1"
            />

            <Input
              label="Hours saved per month"
              description="Usually 0 for do-nothing"
              type="number"
              value={inputs.alternativeC.hoursSaved}
              onChange={(e) => onUpdate({ 
                alternativeC: { ...inputs.alternativeC, hoursSaved: Number(e.target.value) || 0 }
              })}
              min={0}
              step="0.1"
            />

            <Input
              label="Years of use"
              description="How long this option lasts"
              type="number"
              value={inputs.alternativeC.yearsOfUse}
              onChange={(e) => onUpdate({ 
                alternativeC: { ...inputs.alternativeC, yearsOfUse: Number(e.target.value) || 0 }
              })}
              min={0}
              step="0.1"
            />
          </div>
        )}
      </div>
    </div>
  );
};