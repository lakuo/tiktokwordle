import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

import type { Decision } from '../../types/questionnaire';

interface ResultsScreenProps {
  decision: Decision;
  onRestart: () => void;
  onExport: () => void;
  itemName?: string;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  decision,
  onRestart,
  onExport,
  itemName = 'this item'
}) => {
  const formatMoney = (amount: number) => {
    return amount.toLocaleString(undefined, { 
      style: "currency", 
      currency: "USD", 
      maximumFractionDigits: 0 
    });
  };

  const getReasonText = (reasonCode: string): string => {
    const reasons: Record<string, string> = {
      'fast_track_travel': 'Approved using Travel Fund - no evaluation needed.',
      'fast_track_house': 'Approved using House Fund - no evaluation needed.',
      'fast_track_shi': 'Safety/Health/Income item under $1,000 - automatically approved.',
      'liquidity_guardrail_failed': 'Denied due to insufficient financial safety: need 6+ months liquid savings, no high-interest debt, and 15%+ retirement savings rate.',
      'cooling_off_not_satisfied': 'Item over $1,000 requires a 7-day cooling-off period before evaluation.',
      'utility_too_low': 'Value Points too low - need at least 6.0 points to justify any purchase.',
      'payback_too_long': 'Time-saver payback exceeds 12 months and doesn\'t meet stricter cost-per-point requirements.',
      'cpp_above_threshold': `Cost per point exceeds your ${decision.metrics.threshold_used} threshold.`,
      'dominated_by_alternative': 'A cheaper alternative provides better value - consider the winning option instead.',
      'prestige_cap_reached': 'Annual prestige spending cap reached - wait until next year or increase your budget.',
      'prestige_cpp_too_high': 'Prestige items must meet stricter 20% better cost-per-point requirements.',
      'approved': 'Meets all criteria: sufficient value points, reasonable cost per point, passes all safety checks.'
    };
    return reasons[reasonCode] || reasonCode;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-3xl text-center transform-gpu animate-fade-in-scale">
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            decision.decision === 'APPROVE' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {decision.decision === 'APPROVE' ? (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h1 className={`text-4xl font-bold mb-4 ${
            decision.decision === 'APPROVE' ? 'text-green-700' : 'text-red-700'
          }`}>
            {decision.decision === 'APPROVE' ? '✅ BUY IT!' : '❌ DON\'T BUY IT'}
          </h1>
          
          <p className="text-xl text-gray-700 font-medium">
            Our recommendation for {itemName}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Why this decision?</h2>
          <p className="text-gray-700 leading-relaxed">{getReasonText(decision.reason_primary)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-700">
              {decision.metrics.VP_star.toFixed(1)}
            </div>
            <div className="text-sm text-blue-600 font-medium">Value Points★</div>
            <div className="text-xs text-blue-500 mt-1">Min: 6.0 required</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-700">
              {formatMoney(decision.metrics.EC_star)}
            </div>
            <div className="text-sm text-purple-600 font-medium">Total Cost to You</div>
            <div className="text-xs text-purple-500 mt-1">After time value & resale</div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-700">
              {Number.isFinite(decision.metrics.CPP) 
                ? formatMoney(decision.metrics.CPP)
                : 'N/A'
              }
            </div>
            <div className="text-sm text-orange-600 font-medium">Cost per Point</div>
            <div className="text-xs text-orange-500 mt-1">Limit: ${decision.metrics.threshold_used}</div>
          </div>
        </div>

        {decision.metrics.Payback_months && (
          <div className="bg-yellow-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Payback Analysis</h3>
            <p className="text-yellow-800">
              This time-saver will pay for itself in <strong>{decision.metrics.Payback_months.toFixed(1)} months</strong>
              {decision.metrics.Payback_months <= 12 ? ' ✅' : ' (over 12 month limit ❌)'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-lg font-bold">{decision.metrics.H_eff.toFixed(1)}h</div>
            <div className="text-sm text-gray-600">Effective Hours Saved/Month</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{formatMoney(decision.metrics.PV_time)}</div>
            <div className="text-sm text-gray-600">Time Value Saved</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{formatMoney(decision.metrics.PV_resale)}</div>
            <div className="text-sm text-gray-600">Resale Present Value</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{formatMoney(decision.metrics.P_t)}</div>
            <div className="text-sm text-gray-600">Price + Tax</div>
          </div>
        </div>

        {(decision.comparisons.CPP_B || decision.comparisons.CPP_C) && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Alternative Comparison</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">Option A</div>
                <div className="text-sm">{formatMoney(decision.comparisons.CPP_A)}/point</div>
              </div>
              {decision.comparisons.CPP_B && (
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">Option B</div>
                  <div className="text-sm">{formatMoney(decision.comparisons.CPP_B)}/point</div>
                </div>
              )}
              {decision.comparisons.CPP_C && (
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">Option C</div>
                  <div className="text-sm">{formatMoney(decision.comparisons.CPP_C)}/point</div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-3">Winner: Option {decision.comparisons.winner}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onRestart}
            className="min-w-[160px]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Another Item
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={onExport}
            className="min-w-[160px]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Results
          </Button>
        </div>
      </Card>
    </div>
  );
};