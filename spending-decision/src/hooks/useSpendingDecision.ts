import { useMemo } from 'react';
import type { Inputs, Decision, CategoryKey, ThresholdKey } from '../types/questionnaire';

// Constants from v2.0 algorithm
const CONFIG = {
  categoryWeights: {
    Safety: 1.50,
    IncomeTool: 1.40,
    HealthSkill: 1.30,
    TimeSaver: 1.20,
    Experience: 1.00,
    Functional: 1.00,
    Prestige: 0.60,
  } as Record<CategoryKey, number>,
  
  thresholds: {
    tight: 35,
    normal: 50,
    comfortable: 75,
  } as Record<ThresholdKey, number>,

  // Default probabilities by category
  defaultProbabilities: {
    use: {
      Safety: 0.95,
      IncomeTool: 0.9,
      HealthSkill: 0.8,
      TimeSaver: 0.7,
      Experience: 0.6,
      Functional: 0.7,
      Prestige: 0.6,
    } as Record<CategoryKey, number>,
    redeploy: {
      IncomeTool: 0.8,
      HealthSkill: 0.7,
      TimeSaver: 0.6,
      Safety: 0.5,
      Experience: 0.5,
      Functional: 0.5,
      Prestige: 0.5,
    } as Record<CategoryKey, number>,
  },

  halfLifeYears: 2,
  coolingOffThreshold: 1000,
  minimumVP: 6,
  dominanceMargin: 0.9, // 10% better required
  prestigeMargin: 0.8, // 20% stricter for prestige
  paybackThreshold: 12, // months
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function numberOrZero(x: any): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

// Calculate longevity adjustment for durable goods
function calculateLongevityAdjustment(yearsOfUse: number): number {
  if (yearsOfUse <= 0) return 0;
  const ratio = yearsOfUse / CONFIG.halfLifeYears;
  return 2 * (1 - Math.pow(0.5, ratio));
}

// Calculate present value using annuity factor
function calculatePresentValueTime(H_eff: number, hourlyValue: number, months: number, discountRate: number): number {
  if (months <= 0 || H_eff <= 0) return 0;
  
  const monthlyRate = discountRate / 12;
  if (monthlyRate === 0) {
    return H_eff * hourlyValue * months;
  }
  
  const annuityFactor = (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
  return H_eff * hourlyValue * annuityFactor;
}

// Calculate effective cost (v2.0)
function calculateEffectiveCost(inputs: Inputs): {
  P_t: number;
  PV_resale: number;
  PV_time: number;
  H_eff: number;
  EC_star: number;
} {
  const price = numberOrZero(inputs.price);
  const taxRate = numberOrZero(inputs.salesTaxRate);
  const P_t = price * (1 + taxRate);
  
  const resale = numberOrZero(inputs.expectedResale);
  const monthsToResale = clamp(inputs.monthsToResale || 36, 1, 600);
  const resaleHaircut = clamp(inputs.resaleHaircut || 0.7, 0, 1);
  const discountRate = clamp(inputs.discountRate || 0.05, 0, 0.5);
  
  const PV_resale = resaleHaircut * resale / Math.pow(1 + discountRate, monthsToResale / 12);
  
  const H_current = clamp(inputs.currentHoursPerMonth, 0, 1000);
  const H_raw = clamp(inputs.hoursSavedPerMonth, 0, 1000);
  const H_cap = Math.min(H_raw, H_current);
  
  const p_use = inputs.probabilityOfUse || CONFIG.defaultProbabilities.use[inputs.category] || 0.7;
  const p_redeploy = inputs.probabilityRedeploy || CONFIG.defaultProbabilities.redeploy[inputs.category] || 0.5;
  
  const H_eff = H_cap * clamp(p_use, 0, 1) * clamp(p_redeploy, 0, 1);
  
  const months = clamp(inputs.monthsOfUse, 1, 1200);
  const hourlyValue = numberOrZero(inputs.hourlyValue);
  
  const PV_time = calculatePresentValueTime(H_eff, hourlyValue, months, discountRate);
  
  const OM = numberOrZero(inputs.lifetimeOM);
  const EC_star = P_t - PV_resale + OM - PV_time;
  
  return { P_t, PV_resale, PV_time, H_eff, EC_star };
}

// Calculate Value Points v2.0
function calculateValuePointsV2(inputs: Inputs, H_eff: number): number {
  const Wc = CONFIG.categoryWeights[inputs.category] || 1.0;
  const Q = clamp(inputs.qualityOfLife, 0, 5);
  const F = clamp(inputs.daysUsedPerMonth, 0, 30);
  const Y = clamp(inputs.yearsOfUse, 0, 50);
  const RR = clamp(inputs.resaleReversibility, 0, 2);
  const RG = clamp(inputs.regretRisk, 0, 2);
  const Cplx = clamp(inputs.complexityPenalty, 0, 1);
  
  const longevityAdj = calculateLongevityAdjustment(Y);
  
  const bracket = 3 * Q + 2 * H_eff + 0.05 * F + longevityAdj + RR - 2 * RG - Cplx;
  const VP_star = Wc * bracket;
  
  return VP_star;
}

// Calculate alternative option metrics
function calculateAlternativeMetrics(alt: any, baseInputs: Inputs): { VP: number; CPP: number } {
  if (!alt.enabled) return { VP: 0, CPP: Infinity };
  
  // Create simplified inputs for alternative
  const altInputs: Partial<Inputs> = {
    ...baseInputs,
    price: alt.price || 0,
    qualityOfLife: alt.qualityOfLife || 0,
    hoursSavedPerMonth: alt.hoursSaved || 0,
    yearsOfUse: alt.yearsOfUse || 0,
    expectedResale: 0, // Assume no resale for simplicity
    lifetimeOM: 0,
  };
  
  const costMetrics = calculateEffectiveCost(altInputs as Inputs);
  const VP = calculateValuePointsV2(altInputs as Inputs, costMetrics.H_eff);
  const CPP = VP > 0 ? costMetrics.EC_star / VP : Infinity;
  
  return { VP, CPP };
}

// Main decision function implementing v2.0 algorithm
function calculateDecision(inputs: Inputs): Decision {
  const Wc = CONFIG.categoryWeights[inputs.category] || 1.0;
  const threshold = CONFIG.thresholds[inputs.thresholdChoice];
  const taxRate = inputs.salesTaxRate || 0.08625;
  const discountRate = inputs.discountRate || 0.05;
  const resaleHaircut = inputs.resaleHaircut || 0.7;
  
  // Fast-track routes (Section 9)
  if (inputs.isTravel || inputs.useTravelFund) {
    return {
      decision: 'APPROVE',
      reason_primary: 'fast_track_travel',
      metrics: { VP_star: 0, EC_star: 0, CPP: 0, threshold_used: threshold, H_eff: 0, PV_time: 0, PV_resale: 0, P_t: 0, OM: 0 },
      comparisons: { CPP_A: 0, winner: 'A' },
      flags: { isTravel: true, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: true, prestige_flagged: false },
      parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
    };
  }
  
  if (inputs.isHouse || inputs.useHouseFund) {
    return {
      decision: 'APPROVE',
      reason_primary: 'fast_track_house',
      metrics: { VP_star: 0, EC_star: 0, CPP: 0, threshold_used: threshold, H_eff: 0, PV_time: 0, PV_resale: 0, P_t: 0, OM: 0 },
      comparisons: { CPP_A: 0, winner: 'A' },
      flags: { isTravel: inputs.isTravel, isHouse: true, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: true, prestige_flagged: false },
      parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
    };
  }

  const costMetrics = calculateEffectiveCost(inputs);
  const { P_t, PV_resale, PV_time, H_eff, EC_star } = costMetrics;
  
  if (inputs.isSafetyOrHealthOrIncome && P_t <= CONFIG.coolingOffThreshold) {
    return {
      decision: 'APPROVE',
      reason_primary: 'fast_track_shi',
      metrics: { VP_star: 0, EC_star, CPP: 0, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM },
      comparisons: { CPP_A: 0, winner: 'A' },
      flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: true, coolOK: true, prestige_flagged: false },
      parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
    };
  }

  // Cooling-off check
  if (!inputs.isSafetyOrHealthOrIncome && P_t > CONFIG.coolingOffThreshold && !inputs.overThousandCoolingOffPassed) {
    return {
      decision: 'DENY',
      reason_primary: 'cooling_off_not_satisfied',
      metrics: { VP_star: 0, EC_star, CPP: 0, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM },
      comparisons: { CPP_A: 0, winner: 'A' },
      flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: false, prestige_flagged: false },
      parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
    };
  }

  // Liquidity preconditions (Section 11)
  if (!inputs.hasLiquidityCushion || inputs.hasHighInterestDebt || !inputs.hasAdequateSavings) {
    // Allow safety items under $1000
    if (!(inputs.isSafetyOrHealthOrIncome && P_t <= CONFIG.coolingOffThreshold)) {
      return {
        decision: 'DENY',
        reason_primary: 'liquidity_guardrail_failed',
        metrics: { VP_star: 0, EC_star, CPP: 0, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM },
        comparisons: { CPP_A: 0, winner: 'A' },
        flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: false },
        parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
      };
    }
  }

  // Calculate VP* and CPP
  const VP_star = calculateValuePointsV2(inputs, H_eff);
  const CPP = VP_star > 0 ? EC_star / VP_star : Infinity;

  // Utility gate
  if (VP_star < CONFIG.minimumVP) {
    return {
      decision: 'DENY',
      reason_primary: 'utility_too_low',
      metrics: { VP_star, EC_star, CPP, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM },
      comparisons: { CPP_A: CPP, winner: 'A' },
      flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: inputs.isPrestige },
      parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
    };
  }

  // Time-saver payback requirement
  let paybackMonths: number | undefined;
  if (inputs.category === 'TimeSaver' || inputs.category === 'IncomeTool') {
    paybackMonths = H_eff > 0 ? P_t / (H_eff * inputs.hourlyValue) : Infinity;
    const paybackFails = paybackMonths > CONFIG.paybackThreshold;
    const stricterCPP = CPP > (CONFIG.prestigeMargin * threshold);
    
    if (paybackFails && stricterCPP) {
      return {
        decision: 'DENY',
        reason_primary: 'payback_too_long',
        metrics: { VP_star, EC_star, CPP, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM, Payback_months: paybackMonths },
        comparisons: { CPP_A: CPP, winner: 'A' },
        flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: inputs.isPrestige },
        parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
      };
    }
  }

  // Threshold gate
  if (CPP > threshold) {
    return {
      decision: 'DENY',
      reason_primary: 'cpp_above_threshold',
      metrics: { VP_star, EC_star, CPP, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM, Payback_months: paybackMonths },
      comparisons: { CPP_A: CPP, winner: 'A' },
      flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: inputs.isPrestige },
      parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
    };
  }

  // Alternatives dominance test
  const altB = calculateAlternativeMetrics(inputs.alternativeB, inputs);
  const altC = calculateAlternativeMetrics(inputs.alternativeC, inputs);
  
  const minAltCPP = Math.min(altB.CPP, altC.CPP);
  const dominanceRequired = CONFIG.dominanceMargin * minAltCPP;
  
  if (inputs.alternativeB.enabled || inputs.alternativeC.enabled) {
    if (CPP > dominanceRequired) {
      const winner = altB.CPP < altC.CPP ? 'B' : 'C';
      return {
        decision: 'DENY',
        reason_primary: 'dominated_by_alternative',
        metrics: { VP_star, EC_star, CPP, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM, Payback_months: paybackMonths },
        comparisons: { CPP_A: CPP, CPP_B: altB.CPP, CPP_C: altC.CPP, winner },
        flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: inputs.isPrestige },
        parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
      };
    }
  }

  // Prestige guardrail
  if (inputs.isPrestige || inputs.category === 'Prestige') {
    const capExceeded = inputs.prestigeSpentYTD + P_t > inputs.prestigeCap;
    const stricterFails = CPP > (CONFIG.prestigeMargin * threshold);
    
    if (capExceeded) {
      return {
        decision: 'DENY',
        reason_primary: 'prestige_cap_reached',
        metrics: { VP_star, EC_star, CPP, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM, Payback_months: paybackMonths },
        comparisons: { CPP_A: CPP, CPP_B: altB.CPP, CPP_C: altC.CPP, winner: 'A' },
        flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: true },
        parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
      };
    }
    
    if (stricterFails) {
      return {
        decision: 'DENY',
        reason_primary: 'prestige_cpp_too_high',
        metrics: { VP_star, EC_star, CPP, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM, Payback_months: paybackMonths },
        comparisons: { CPP_A: CPP, CPP_B: altB.CPP, CPP_C: altC.CPP, winner: 'A' },
        flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: true },
        parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
      };
    }
  }

  // All tests passed - APPROVE
  return {
    decision: 'APPROVE',
    reason_primary: 'approved',
    metrics: { VP_star, EC_star, CPP, threshold_used: threshold, H_eff, PV_time, PV_resale, P_t, OM: inputs.lifetimeOM, Payback_months: paybackMonths },
    comparisons: { CPP_A: CPP, CPP_B: altB.CPP, CPP_C: altC.CPP, winner: 'A' },
    flags: { isTravel: inputs.isTravel, isHouse: inputs.isHouse, isSHI: inputs.isSafetyOrHealthOrIncome, coolOK: inputs.overThousandCoolingOffPassed, prestige_flagged: inputs.isPrestige || inputs.category === 'Prestige' },
    parameters_used: { Wc, mode: inputs.thresholdChoice, r: discountRate, f_resale: resaleHaircut, tax: taxRate }
  };
}

export const useSpendingDecision = (inputs: Inputs) => {
  return useMemo(() => {
    const decision = calculateDecision(inputs);
    return decision;
  }, [inputs]);
};