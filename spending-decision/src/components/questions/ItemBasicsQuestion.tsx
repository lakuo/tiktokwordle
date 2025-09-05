import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { Inputs, CategoryKey } from '../../types/questionnaire';

interface ItemBasicsQuestionProps {
  inputs: Inputs;
  onUpdate: (updates: Partial<Inputs>) => void;
}

export const ItemBasicsQuestion: React.FC<ItemBasicsQuestionProps> = ({
  inputs,
  onUpdate
}) => {
  const categoryOptions = [
    { value: 'Safety', label: 'Safety (Weight: 1.5x)' },
    { value: 'IncomeTool', label: 'Income tool (Weight: 1.4x)' },
    { value: 'HealthSkill', label: 'Health or skill (Weight: 1.3x)' },
    { value: 'TimeSaver', label: 'Time saver (Weight: 1.2x)' },
    { value: 'Experience', label: 'Experience (Weight: 1.0x)' },
    { value: 'Functional', label: 'Functional upgrade (Weight: 1.0x)' },
    { value: 'Prestige', label: 'Prestige (Weight: 0.6x)' }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <Input
          label="What are you buying?"
          description="Plain English name so you can recognize it later."
          value={inputs.itemName}
          onChange={(e) => onUpdate({ itemName: e.target.value })}
          placeholder="Example: Premium car detailing service"
          className="text-lg"
        />

        <Select
          label="Category"
          description="Pick the single best description. This sets a weight that reflects how much we value this category."
          options={categoryOptions}
          value={inputs.category}
          onChange={(value) => onUpdate({ category: value as CategoryKey })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Price (USD)"
            description="Full amount you'll pay at checkout (before tax)"
            type="number"
            value={inputs.price}
            onChange={(e) => onUpdate({ price: Number(e.target.value) || 0 })}
            min={0}
            step="0.01"
            leftIcon={<span>$</span>}
          />

          <Input
            label="Sales tax rate (%)"
            description="Tax rate as percentage (default 8.625% for SF)"
            type="number"
            value={inputs.salesTaxRate * 100}
            onChange={(e) => onUpdate({ salesTaxRate: (Number(e.target.value) || 0) / 100 })}
            min={0}
            max={20}
            step="0.1"
            leftIcon={<span>%</span>}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Expected resale value (USD)"
            description="How much you can recover if you resell it later"
            type="number"
            value={inputs.expectedResale}
            onChange={(e) => onUpdate({ expectedResale: Number(e.target.value) || 0 })}
            min={0}
            step="0.01"
            leftIcon={<span>$</span>}
          />

          <Input
            label="Months until resale"
            description="When you expect to sell (default: 36 months)"
            type="number"
            value={inputs.monthsToResale}
            onChange={(e) => onUpdate({ monthsToResale: Number(e.target.value) || 36 })}
            min={1}
            step="1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Lifetime operating cost (USD)"
            description="All extra money this item will need: supplies, maintenance, memberships, etc."
            type="number"
            value={inputs.lifetimeOM}
            onChange={(e) => onUpdate({ lifetimeOM: Number(e.target.value) || 0 })}
            min={0}
            step="0.01"
            leftIcon={<span>$</span>}
          />

          <Input
            label="Months you'll actually use it"
            description="Only count months you realistically expect to use the item"
            type="number"
            value={inputs.monthsOfUse}
            onChange={(e) => onUpdate({ monthsOfUse: Number(e.target.value) || 1 })}
            min={1}
            step="1"
          />
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Time analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Current hours per month on this task"
              description="How many hours you currently spend monthly on what this item would replace"
              type="number"
              value={inputs.currentHoursPerMonth}
              onChange={(e) => onUpdate({ currentHoursPerMonth: Number(e.target.value) || 0 })}
              min={0}
              step="0.1"
            />

            <Input
              label="Hours this would save per month"
              description="Time saved monthly if you buy this (cannot exceed current time spent)"
              type="number"
              value={inputs.hoursSavedPerMonth}
              onChange={(e) => onUpdate({ hoursSavedPerMonth: Number(e.target.value) || 0 })}
              min={0}
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};