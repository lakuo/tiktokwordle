import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import type { Inputs, ThresholdKey } from '../../types/questionnaire';

interface SettingsQuestionProps {
  inputs: Inputs;
  onUpdate: (updates: Partial<Inputs>) => void;
}

export const SettingsQuestion: React.FC<SettingsQuestionProps> = ({
  inputs,
  onUpdate
}) => {
  const thresholdOptions = [
    { value: 'tight', label: 'Tight ($35/point) - Hard mode' },
    { value: 'normal', label: 'Normal ($50/point) - Balanced' },
    { value: 'comfortable', label: 'Comfortable ($75/point) - Easier approval' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-green-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Personal preferences</h3>
        <p className="text-green-700">
          These settings customize the decision framework to your financial situation and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input
          label="Your hourly value (USD)"
          description="Default $60/hour. Used to calculate value of time saved. Set lower if you won't use saved time productively."
          type="number"
          value={inputs.hourlyValue}
          onChange={(e) => onUpdate({ hourlyValue: Number(e.target.value) || 60 })}
          min={0}
          step="1"
          leftIcon={<span>$</span>}
        />

        <Select
          label="Decision threshold"
          description="Lower threshold = stricter approval. Choose based on your financial comfort level."
          options={thresholdOptions}
          value={inputs.thresholdChoice}
          onChange={(value) => onUpdate({ thresholdChoice: value as ThresholdKey })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input
          label="Discount rate (%)"
          description="Annual rate for present value calculations (default 5%)"
          type="number"
          value={inputs.discountRate * 100}
          onChange={(e) => onUpdate({ discountRate: (Number(e.target.value) || 5) / 100 })}
          min={0}
          max={20}
          step="0.1"
          leftIcon={<span>%</span>}
        />

        <Input
          label="Resale haircut (%)"
          description="Discount factor for resale value uncertainty (default 30%)"
          type="number"
          value={(1 - inputs.resaleHaircut) * 100}
          onChange={(e) => onUpdate({ resaleHaircut: 1 - ((Number(e.target.value) || 30) / 100) })}
          min={0}
          max={80}
          step="1"
          leftIcon={<span>%</span>}
        />
      </div>

      <div className="bg-red-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-red-900 mb-4">Financial safety preconditions</h4>
        <p className="text-red-700 mb-6">These must all be true for non-essential purchases to be approved:</p>
        <div className="space-y-4">
          <Switch
            checked={inputs.hasLiquidityCushion}
            onChange={(checked) => onUpdate({ hasLiquidityCushion: checked })}
            label="I have ≥6 months expenses in liquid savings"
            description="Post-purchase liquid cash covers 6+ months of core expenses"
          />
          
          <Switch
            checked={!inputs.hasHighInterestDebt}
            onChange={(checked) => onUpdate({ hasHighInterestDebt: !checked })}
            label="I have no high-interest debt (>8% APR)"
            description="No credit cards, personal loans, or other debt over 8% APR"
          />
          
          <Switch
            checked={inputs.hasAdequateSavings}
            onChange={(checked) => onUpdate({ hasAdequateSavings: checked })}
            label="I'm saving ≥15% of gross income for retirement"
            description="Including any 401k match, saving at least 15% gross for retirement"
          />
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-4">Prestige spending controls</h4>
        <div className="space-y-6">
          <Switch
            checked={inputs.isPrestige}
            onChange={(checked) => onUpdate({ isPrestige: checked })}
            label="This is primarily a status or prestige item"
            description="If the main purpose is status rather than utility, check this box"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Annual prestige budget (USD)"
              description="How much you allow yourself to spend on status items per year"
              type="number"
              value={inputs.prestigeCap}
              onChange={(e) => onUpdate({ prestigeCap: Number(e.target.value) || 2500 })}
              min={0}
              step="100"
              leftIcon={<span>$</span>}
            />

            <Input
              label="Prestige spent this year (USD)"
              description="Amount already spent this year on status items. System blocks approvals once you hit the cap."
              type="number"
              value={inputs.prestigeSpentYTD}
              onChange={(e) => onUpdate({ prestigeSpentYTD: Number(e.target.value) || 0 })}
              min={0}
              step="10"
              leftIcon={<span>$</span>}
            />
          </div>
        </div>
      </div>
    </div>
  );
};