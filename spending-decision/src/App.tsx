import React, { useMemo, useState, useEffect } from "react";

/**
 * Deterministic Spending Decision App
 * Single-file React app. TailwindCSS classes for styling.
 * No external UI library required.
 *
 * Opinionated rules encoded from our framework:
 * - Fast gates: travel fund, house fund, safety-health-income tool, cooling off
 * - Quick Test with Value Points and Effective Cost
 * - Cost per point threshold: Tight 35, Normal 50, Comfortable 75
 * - Hourly value default: 60 USD per hour (editable)
 * - Prestige cap: 2,500 per year by default (editable)
 *
 * Everything is config based through CONFIG below.
 */

const CONFIG = {
  hourlyValueDefault: 60, // USD per hour
  thresholds: {
    tight: 35,
    normal: 50,
    comfortable: 75,
  },
  prestigeCapDefault: 2500, // per year
  dailyDiscretionaryDefault: 100, // legacy rule, shown as helper only
  monthlyDiscretionaryDefault: 3000,
  categoryWeights: {
    Safety: 1.5,
    "Income tool": 1.4,
    "Health or skill": 1.3,
    "Time saver": 1.2,
    Experience: 1.0,
    "Functional upgrade": 1.0,
    Prestige: 0.6,
  } as Record<string, number>,
};

// Utility helpers
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function numberOrZero(x: any): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Types
type ThresholdKey = keyof typeof CONFIG.thresholds;

type Inputs = {
  // Core description
  itemName: string;
  category: keyof typeof CONFIG.categoryWeights; // used for Wc

  // Price and costs
  price: number; // purchase price
  expectedResale: number; // future resale value
  lifetimeOM: number; // lifetime operating and maintenance cost

  // Usage and benefits
  monthsOfUse: number; // months you will actually use the item
  hoursSavedPerMonth: number; // H 0..10 or higher
  daysUsedPerMonth: number; // F 0..30
  yearsOfUse: number; // Y 0..5 or higher
  qualityOfLife: number; // Q 0..5
  resaleReversibility: number; // RR 0..2
  regretRisk: number; // RG 0..2

  // Gates
  isTravel: boolean;
  isHouse: boolean;
  isSafetyOrHealthOrIncome: boolean;
  overThousandCoolingOffPassed: boolean; // confirm if over 1000 and not safety-health, you waited

  // Prestige controls
  isPrestige: boolean;
  prestigeSpentYTD: number; // amount already spent this year on prestige
  prestigeCap: number; // default 2500

  // Money constants
  hourlyValue: number; // $ per hour
  thresholdChoice: ThresholdKey; // tight, normal, comfortable

  // Funding buckets
  useTravelFund: boolean;
  useHouseFund: boolean;
};

const DEFAULT_INPUTS: Inputs = {
  itemName: "",
  category: "Time saver",
  price: 0,
  expectedResale: 0,
  lifetimeOM: 0,
  monthsOfUse: 1,
  hoursSavedPerMonth: 0,
  daysUsedPerMonth: 0,
  yearsOfUse: 0,
  qualityOfLife: 0,
  resaleReversibility: 0,
  regretRisk: 0,
  isTravel: false,
  isHouse: false,
  isSafetyOrHealthOrIncome: false,
  overThousandCoolingOffPassed: false,
  isPrestige: false,
  prestigeSpentYTD: 0,
  prestigeCap: CONFIG.prestigeCapDefault,
  hourlyValue: CONFIG.hourlyValueDefault,
  thresholdChoice: "normal",
  useTravelFund: false,
  useHouseFund: false,
};

function computeValuePoints(inp: Inputs) {
  const Wc = CONFIG.categoryWeights[inp.category];
  const Q = clamp(inp.qualityOfLife, 0, 5);
  const H = clamp(inp.hoursSavedPerMonth, 0, 1000); // allow high, capped later by months
  const F = clamp(inp.daysUsedPerMonth, 0, 31);
  const Y = clamp(inp.yearsOfUse, 0, 50);
  const RR = clamp(inp.resaleReversibility, 0, 2);
  const RG = clamp(inp.regretRisk, 0, 2);
  const bracket = 3 * Q + 2 * H + 0.1 * F + 1 * Y + 1 * RR - 2 * RG;
  const VP = Wc * bracket;
  return { VP, Wc, bracket, Q, H, F, Y, RR, RG };
}

function computeEffectiveCost(inp: Inputs) {
  const price = numberOrZero(inp.price);
  const resale = numberOrZero(inp.expectedResale);
  const om = numberOrZero(inp.lifetimeOM);
  const months = clamp(inp.monthsOfUse, 0, 1200);
  const timeValueSaved = clamp(inp.hoursSavedPerMonth, 0, 1000) * months * numberOrZero(inp.hourlyValue);
  const EC = price - resale + om - timeValueSaved;
  return { EC, timeValueSaved };
}

function decisionFromMetrics(inp: Inputs) {
  // Fast routing for travel or house if user toggled dedicated fund usage
  if (inp.isTravel || inp.useTravelFund) {
    return { route: "travel", approved: true, reason: "Travel expense paid from Travel Fund." } as const;
  }
  if (inp.isHouse || inp.useHouseFund) {
    return { route: "house", approved: true, reason: "House related expense paid from House Fund." } as const;
  }

  // Safety-health-income auto yes under 1000
  if (inp.isSafetyOrHealthOrIncome && inp.price <= 1000) {
    return { route: "autoSafety", approved: true, reason: "Safety or income tool under 1000 is auto approve." } as const;
  }

  // Cooling off rule: if over 1000 and not safety-health-income
  if (!inp.isSafetyOrHealthOrIncome && inp.price > 1000 && !inp.overThousandCoolingOffPassed) {
    return { route: "coolingOff", approved: false, reason: "Item over 1000 requires 7 day cooling off before evaluation." } as const;
  }

  // Run Quick Test
  const { VP } = computeValuePoints(inp);
  const { EC } = computeEffectiveCost(inp);
  const cpp = VP > 0 ? EC / VP : Infinity; // cost per point
  const threshold = CONFIG.thresholds[inp.thresholdChoice];

  // Decision based on threshold
  const pass = VP >= 6 && cpp <= threshold;
  // Prestige guardrail
  const prestigeBlocked = inp.isPrestige && inp.prestigeSpentYTD >= inp.prestigeCap;

  let approved = pass && !prestigeBlocked;
  let reason = "";
  if (!pass) {
    if (VP < 6) reason = "Value Points too low."
    else reason = `Cost per point ${cpp.toFixed(1)} exceeds threshold ${threshold}.`;
  } else if (prestigeBlocked) {
    reason = "Prestige cap reached for the year.";
  } else {
    reason = "Meets threshold and guardrails.";
  }

  return { route: "quickTest", approved, reason, cpp, threshold, VP, EC } as const;
}

function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

function Label({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-1">
      <div className="font-semibold">{title}</div>
      {desc && <div className="text-sm text-slate-600">{desc}</div>}
    </div>
  );
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      {...props}
      className={
        "w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
        (props.className || "")
      }
    />
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      className={
        "w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
        (props.className || "")
      }
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Switch({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <span>
        <span className="font-medium">{label}</span>
        {help && <div className="text-sm text-slate-600">{help}</div>}
      </span>
    </label>
  );
}

export default function SpendingDecisionApp() {
  const [inp, setInp] = useLocalState<Inputs>("decision.inputs.v1", DEFAULT_INPUTS);

  const metrics = useMemo(() => {
    const vp = computeValuePoints(inp);
    const ec = computeEffectiveCost(inp);
    const d = decisionFromMetrics(inp);
    return { ...vp, ...ec, decision: d };
  }, [inp]);

  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setInp({ ...inp, [k]: v });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold">Deterministic Spending Decision</h1>
        <p className="mt-2 text-slate-700">
          This survey decides buy or do not buy using strict rules. Every question explains exactly what it means so a
          non expert can answer correctly. The app uses your answers to compute Value Points and Effective Cost, then it
          compares cost per point to a threshold. You get a clear decision with reasons.
        </p>

        {/* Decision summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-600">Decision</div>
            <div className={`mt-1 text-2xl font-bold ${metrics.decision.approved ? "text-green-700" : "text-red-700"}`}>
              {metrics.decision.approved ? "BUY" : "DO NOT BUY"}
            </div>
            <div className="mt-1 text-sm text-slate-700">{metrics.decision.reason}</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-600">Cost per point vs threshold</div>
            <div className="mt-1 text-xl font-semibold">
              {Number.isFinite(metrics.decision.cpp as any)
                ? `${formatMoney((metrics.decision.cpp as number) || 0)} / pt`
                : "n.a."}
            </div>
            <div className="text-sm">Threshold: {CONFIG.thresholds[inp.thresholdChoice]} per point</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-600">Value Points and Effective Cost</div>
            <div className="mt-1 text-xl font-semibold">VP {metrics.VP.toFixed(2)}</div>
            <div className="text-sm">EC {formatMoney(metrics.EC)}</div>
          </div>
        </div>

        {/* Section: item basics */}
        <div className="mt-8 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-bold">1. What are you buying</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label title="Item name" desc="Plain English name so you recognize it later." />
              <TextInput value={inp.itemName} onChange={(e) => set("itemName", e.target.value)} placeholder="Example: Premium interior car detail" />
            </div>
            <div>
              <Label
                title="Category"
                desc="Pick the single best description. It sets a weight that reflects how much we care about this category. Safety and income get the highest weight. Prestige gets the lowest."
              />
              <Select value={inp.category} onChange={(v) => set("category", v as Inputs["category"]) } options={Object.keys(CONFIG.categoryWeights)} />
              <div className="mt-1 text-sm text-slate-600">Weight for this category: {CONFIG.categoryWeights[inp.category]}</div>
            </div>
            <div>
              <Label title="Price in USD" desc="Sticker price before resale or maintenance. Use the full amount you will pay at checkout." />
              <NumberInput value={inp.price} onChange={(e) => set("price", numberOrZero(e.target.value))} min={0} />
            </div>
            <div>
              <Label title="Expected resale value in USD" desc="If you can resell later, estimate how much you can recover. Put zero if not resellable." />
              <NumberInput value={inp.expectedResale} onChange={(e) => set("expectedResale", numberOrZero(e.target.value))} min={0} />
            </div>
            <div>
              <Label title="Lifetime operating and maintenance cost" desc="All extra money this item will need while you use it. Examples: supplies, servicing, memberships, batteries, filters." />
              <NumberInput value={inp.lifetimeOM} onChange={(e) => set("lifetimeOM", numberOrZero(e.target.value))} min={0} />
            </div>
            <div>
              <Label title="Months you will actually use it" desc="Count only the months you realistically expect to use the item. If one time service, put 1." />
              <NumberInput value={inp.monthsOfUse} onChange={(e) => set("monthsOfUse", numberOrZero(e.target.value))} min={0} />
            </div>
          </div>
        </div>

        {/* Section: routing gates */}
        <div className="mt-8 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-bold">2. Fast gates</h2>
          <p className="mt-1 text-slate-700">
            These switches route obvious cases. If any of the first two are true, the app approves and assigns the correct
            fund. If the item is over 1000 and not safety or health or income tool, the cooling off rule applies.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Switch
              checked={inp.isTravel}
              onChange={(v) => set("isTravel", v)}
              label="This is a travel or festival expense"
              help="Examples: flights, hotels, event tickets, transit, luggage specifically for the trip."
            />
            <Switch
              checked={inp.isHouse}
              onChange={(v) => set("isHouse", v)}
              label="This is house related"
              help="Examples: inspection, closing costs, furniture, essential repairs."
            />
            <Switch
              checked={inp.isSafetyOrHealthOrIncome}
              onChange={(v) => set("isSafetyOrHealthOrIncome", v)}
              label="Safety or health or income tool"
              help="Safety equipment, medical care, or a tool that directly makes money every week."
            />
            <Switch
              checked={inp.overThousandCoolingOffPassed}
              onChange={(v) => set("overThousandCoolingOffPassed", v)}
              label="If price over 1000 and not safety or health, I waited at least 7 days"
              help="Turn this on only if you already waited. If you have not waited, the decision will be do not buy for now."
            />
          </div>
        </div>

        {/* Section: benefits and usage */}
        <div className="mt-8 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-bold">3. Benefits and usage details</h2>
          <p className="mt-1 text-slate-700">
            Be honest and conservative. Higher numbers make the item look better, so avoid wishful thinking. If unsure,
            pick the lower value.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label title="Quality of life gain Q 0 to 5" desc="0 no change, 5 huge daily improvement. Example 5: better mattress. Example 1: fashion accessory you rarely wear." />
              <NumberInput value={inp.qualityOfLife} onChange={(e) => set("qualityOfLife", numberOrZero(e.target.value))} min={0} max={5} />
            </div>
            <div>
              <Label title="Hours saved per month H" desc="Time this item saves you each month. Example: robotic vacuum saves 2 hours monthly. Education that speeds work can qualify." />
              <NumberInput value={inp.hoursSavedPerMonth} onChange={(e) => set("hoursSavedPerMonth", numberOrZero(e.target.value))} min={0} />
            </div>
            <div>
              <Label title="Days used per month F" desc="How many days you will use it each month. 30 means daily. Use zero if one time service." />
              <NumberInput value={inp.daysUsedPerMonth} onChange={(e) => set("daysUsedPerMonth", numberOrZero(e.target.value))} min={0} max={31} />
            </div>
            <div>
              <Label title="Years of use Y" desc="For durable goods only. For one time service, keep 0 or 0.3 if effects last a few months." />
              <NumberInput value={inp.yearsOfUse} onChange={(e) => set("yearsOfUse", numberOrZero(e.target.value))} min={0} />
            </div>
            <div>
              <Label title="Resale or reversibility RR 0 to 2" desc="0 you cannot return or resell. 1 you can resell with effort. 2 easy to resell or return full value." />
              <NumberInput value={inp.resaleReversibility} onChange={(e) => set("resaleReversibility", numberOrZero(e.target.value))} min={0} max={2} />
            </div>
            <div>
              <Label title="Regret risk RG 0 to 2" desc="0 no risk you will regret it. 2 high chance of regret due to trend or impulse." />
              <NumberInput value={inp.regretRisk} onChange={(e) => set("regretRisk", numberOrZero(e.target.value))} min={0} max={2} />
            </div>
          </div>
        </div>

        {/* Section: money constants and thresholds */}
        <div className="mt-8 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-bold">4. Money constants and thresholds</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label title="Hourly value in USD" desc="Default 60 per hour. Used to monetize time saved. If you will not use the saved time well, keep this lower." />
              <NumberInput value={inp.hourlyValue} onChange={(e) => set("hourlyValue", numberOrZero(e.target.value))} min={0} />
            </div>
            <div>
              <Label title="Threshold style" desc="Lower threshold means stricter approval. Tight 35 is hard mode. Comfortable 75 is easier." />
              <Select value={inp.thresholdChoice} onChange={(v) => set("thresholdChoice", v as ThresholdKey)} options={["tight", "normal", "comfortable"]} />
            </div>
            <div>
              <Label title="Prestige cap per year" desc="How much you allow yourself to spend on status items per year. Default 2500." />
              <NumberInput value={inp.prestigeCap} onChange={(e) => set("prestigeCap", numberOrZero(e.target.value))} min={0} />
            </div>
          </div>
        </div>

        {/* Section: prestige */}
        <div className="mt-8 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-bold">5. Prestige guardrail</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Switch checked={inp.isPrestige} onChange={(v) => set("isPrestige", v)} label="This is a status or flex item" help="If the main purpose is status rather than utility, toggle this on." />
            <div>
              <Label title="Prestige spent year to date" desc="Enter how much you already spent this year on status items. The app blocks approvals once you hit the cap." />
              <NumberInput value={inp.prestigeSpentYTD} onChange={(e) => set("prestigeSpentYTD", numberOrZero(e.target.value))} min={0} />
            </div>
          </div>
        </div>

        {/* Live metrics panel */}
        <div className="mt-8 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-bold">Live metrics</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded border p-3">
              <div className="text-sm text-slate-600">Category weight Wc</div>
              <div className="text-2xl font-semibold">{metrics.Wc.toFixed(2)}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm text-slate-600">Bracket inside VP</div>
              <div className="text-2xl font-semibold">{metrics.bracket.toFixed(2)}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm text-slate-600">Time value saved</div>
              <div className="text-2xl font-semibold">{formatMoney(metrics.timeValueSaved)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded border p-3">
              <div className="text-sm text-slate-600">Value Points VP</div>
              <div className="text-2xl font-semibold">{metrics.VP.toFixed(2)}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm text-slate-600">Effective Cost EC</div>
              <div className="text-2xl font-semibold">{formatMoney(metrics.EC)}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm text-slate-600">Cost per point</div>
              <div className="text-2xl font-semibold">
                {Number.isFinite((metrics.decision.cpp as number) ?? NaN)
                  ? formatMoney((metrics.decision.cpp as number) || 0)
                  : "n.a."}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-700">
            Formula summary. Value Points = category weight times the sum of: 3 times quality of life plus 2 times hours
            saved per month plus 0.1 times days used per month plus years of use plus resale or reversibility minus 2
            times regret risk. Effective Cost = price minus expected resale plus lifetime operating and maintenance minus
            time value saved. Time value saved = hours saved per month times months of use times hourly value.
          </p>
        </div>

        {/* Export JSON */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => {
              const payload = { inputs: inp, metrics: { VP: metrics.VP, EC: metrics.EC, cpp: metrics.decision.cpp ?? null }, decision: metrics.decision };
              const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `decision-${inp.itemName || "item"}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Export answers and result as JSON
          </button>
          <button
            onClick={() => setInp(DEFAULT_INPUTS)}
            className="rounded border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-100"
          >
            Reset all fields
          </button>
        </div>

        {/* Helper: examples and guidance */}
        <div className="mt-10 rounded-lg border bg-white p-5">
          <h2 className="text-xl font-bold">Guidance and examples</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <p>
              Typical hourly value constant is 60. If the time you save would be wasted and not used for something
              productive or meaningful, set a lower hourly value so you do not over approve.
            </p>
            <p>
              Cooling off rule. If the price is over 1000 and the item is not for safety or health or weekly income work,
              you must wait 7 days before approval. Use the toggle only after you waited.
            </p>
            <p>
              Prestige guardrail. If the main purpose is status, mark the prestige toggle. The app blocks approvals once
              your prestige spend hits the cap for the year. Default cap is 2500.
            </p>
          </div>
        </div>

        <footer className="my-10 text-center text-xs text-slate-500">
          Built for clear yes or no calls. No budgeting micromanagement. All numbers are editable so you can adapt the
          rules to your situation.
        </footer>
      </div>
    </div>
  );
}
