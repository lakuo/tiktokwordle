export type ThresholdKey = 'tight' | 'normal' | 'comfortable';
export type CategoryKey = 'Safety' | 'IncomeTool' | 'HealthSkill' | 'TimeSaver' | 'Experience' | 'Functional' | 'Prestige';

export interface Inputs {
  // Core description
  itemName: string;
  category: CategoryKey;

  // Price and costs
  price: number;
  salesTaxRate: number;
  expectedResale: number;
  monthsToResale: number;
  lifetimeOM: number;

  // Usage and benefits
  monthsOfUse: number;
  currentHoursPerMonth: number;
  hoursSavedPerMonth: number;
  probabilityOfUse: number;
  probabilityRedeploy: number;
  daysUsedPerMonth: number;
  yearsOfUse: number;
  qualityOfLife: number;
  resaleReversibility: number;
  regretRisk: number;
  complexityPenalty: number;

  // Gates and preconditions
  isTravel: boolean;
  isHouse: boolean;
  isSafetyOrHealthOrIncome: boolean;
  overThousandCoolingOffPassed: boolean;
  hasLiquidityCushion: boolean;
  hasHighInterestDebt: boolean;
  hasAdequateSavings: boolean;

  // Prestige controls
  isPrestige: boolean;
  prestigeSpentYTD: number;
  prestigeCap: number;

  // Money constants
  hourlyValue: number;
  thresholdChoice: ThresholdKey;
  discountRate: number;
  resaleHaircut: number;

  // Funding buckets
  useTravelFund: boolean;
  useHouseFund: boolean;

  // Alternatives comparison
  alternativeB: AlternativeOption;
  alternativeC: AlternativeOption;
}

export interface AlternativeOption {
  name: string;
  price: number;
  qualityOfLife: number;
  hoursSaved: number;
  yearsOfUse: number;
  enabled: boolean;
}

export interface Decision {
  decision: 'APPROVE' | 'DENY';
  reason_primary: string;
  metrics: {
    VP_star: number;
    EC_star: number;
    CPP: number;
    threshold_used: number;
    H_eff: number;
    PV_time: number;
    PV_resale: number;
    P_t: number;
    OM: number;
    Payback_months?: number;
  };
  comparisons: {
    CPP_A: number;
    CPP_B?: number;
    CPP_C?: number;
    winner: 'A' | 'B' | 'C';
  };
  flags: {
    isTravel: boolean;
    isHouse: boolean;
    isSHI: boolean;
    coolOK: boolean;
    prestige_flagged: boolean;
  };
  parameters_used: {
    Wc: number;
    mode: ThresholdKey;
    r: number;
    f_resale: number;
    tax: number;
  };
}

export interface QuestionStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  isValid: (inputs: Inputs) => boolean;
  shouldShow?: (inputs: Inputs) => boolean;
}

export interface RubricItem {
  value: number;
  label: string;
  description: string;
}