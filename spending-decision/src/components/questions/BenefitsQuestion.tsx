import React from 'react';
import { Input } from '../ui/Input';
import type { Inputs } from '../../types/questionnaire';

interface BenefitsQuestionProps {
  inputs: Inputs;
  onUpdate: (updates: Partial<Inputs>) => void;
}

export const BenefitsQuestion: React.FC<BenefitsQuestionProps> = ({
  inputs,
  onUpdate
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-amber-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-2">Be honest and conservative</h3>
        <p className="text-amber-700">
          Higher numbers make the item look better, so avoid wishful thinking. When unsure, pick the lower value.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Input
            label="Quality of life gain (0-5)"
            description="Rate the daily impact this purchase would have"
            type="number"
            value={inputs.qualityOfLife}
            onChange={(e) => onUpdate({ qualityOfLife: Number(e.target.value) || 0 })}
            min={0}
            max={5}
            step="0.1"
          />
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>0:</strong> No change</div>
            <div><strong>1:</strong> Minor occasional increase</div>
            <div><strong>2:</strong> Noticeable weekly improvement</div>
            <div><strong>3:</strong> Daily convenience or comfort increase</div>
            <div><strong>4:</strong> Major daily improvement</div>
            <div><strong>5:</strong> Transforms daily life or sleep/health</div>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Probability you actually use it (%)"
            description="Realistic chance you'll use this each month (auto-filled by category)"
            type="number"
            value={inputs.probabilityOfUse * 100}
            onChange={(e) => onUpdate({ probabilityOfUse: (Number(e.target.value) || 0) / 100 })}
            min={0}
            max={100}
            step="1"
            leftIcon={<span>%</span>}
          />
          <div className="text-xs text-gray-600">
            <div>Safety: 95%, Income: 90%, Health: 80%</div>
            <div>TimeSaver: 70%, Functional: 70%</div>
            <div>Experience: 60%, Prestige: 60%</div>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Probability of productive time redeployment (%)"
            description="Chance you'll use saved time productively (auto-filled by category)"
            type="number"
            value={inputs.probabilityRedeploy * 100}
            onChange={(e) => onUpdate({ probabilityRedeploy: (Number(e.target.value) || 0) / 100 })}
            min={0}
            max={100}
            step="1"
            leftIcon={<span>%</span>}
          />
          <div className="text-xs text-gray-600">
            <div>Income: 80%, Health: 70%, TimeSaver: 60%</div>
            <div>Others: 50% (leisure/experience)</div>
          </div>
        </div>

        <Input
          label="Days used per month (0-30)"
          description="How many days you'll use it monthly. 30 = daily use. Use 0 for one-time services."
          type="number"
          value={inputs.daysUsedPerMonth}
          onChange={(e) => onUpdate({ daysUsedPerMonth: Number(e.target.value) || 0 })}
          min={0}
          max={30}
          step="1"
        />

        <Input
          label="Years of use"
          description="For durable goods only. One-time services should stay at 0, or 0.25 if effects last a few months."
          type="number"
          value={inputs.yearsOfUse}
          onChange={(e) => onUpdate({ yearsOfUse: Number(e.target.value) || 0 })}
          min={0}
          step="0.1"
        />

        <div className="space-y-3">
          <Input
            label="Resale ease (0-2)"
            description="How easy is it to resell or return this item?"
            type="number"
            value={inputs.resaleReversibility}
            onChange={(e) => onUpdate({ resaleReversibility: Number(e.target.value) || 0 })}
            min={0}
            max={2}
            step="0.1"
          />
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>0:</strong> No resale or return</div>
            <div><strong>1:</strong> Resale possible with effort or partial recoup</div>
            <div><strong>2:</strong> High-demand item, easy return, near-par resale</div>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Regret risk (0-2)"
            description="How likely are you to regret this purchase?"
            type="number"
            value={inputs.regretRisk}
            onChange={(e) => onUpdate({ regretRisk: Number(e.target.value) || 0 })}
            min={0}
            max={2}
            step="0.1"
          />
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>0:</strong> Proven need or repeat purchase with satisfaction</div>
            <div><strong>1:</strong> Some uncertainty about fit or usage</div>
            <div><strong>2:</strong> Trend or impulse, low commitment, likely buyer's remorse</div>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Complexity penalty (0-1)"
            description="How much ongoing management does this require?"
            type="number"
            value={inputs.complexityPenalty}
            onChange={(e) => onUpdate({ complexityPenalty: Number(e.target.value) || 0 })}
            min={0}
            max={1}
            step="0.1"
          />
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>0:</strong> No ongoing management</div>
            <div><strong>0.5:</strong> Adds chores or learning curve or accessory purchases</div>
            <div><strong>1.0:</strong> Subscription lock-in or high maintenance burden</div>
          </div>
        </div>
      </div>
    </div>
  );
};