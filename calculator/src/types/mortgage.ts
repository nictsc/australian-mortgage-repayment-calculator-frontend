// Types that mirror the backend API contract exactly.
// IMPORTANT: every monetary value is a STRING (e.g. "2997.75"). The backend sends
// decimals as strings to preserve precision — never type these as `number`, or
// TypeScript will let you do broken float math on them silently.

// --- Enum-like fields: a union of string literals catches typos at compile time ---
export type RateType = 'variable' | 'fixed'
export type RepaymentType = 'principal_and_interest' | 'interest_only'
export type RepaymentFrequency = 'weekly' | 'fortnightly' | 'monthly'
export type Phase = 'fixed' | 'interest_only' | 'variable'

// --- Request: what we POST to /api/mortgage/calculate/ ---
export interface CalculateRequest {
  loan_amount: number
  annual_rate: number
  rate_type: RateType
  repayment_type: RepaymentType
  repayment_frequency: RepaymentFrequency
  loan_term_years: number
  // Only present for fixed-rate or interest-only loans (1–5 years).
  fixed_rate_period_years?: number
  // Required when fixed_rate_period_years is set; same bounds as annual_rate.
  revert_rate?: number
  // Only allowed for variable-rate loans; must not exceed loan_amount.
  offset_amount?: number
  // Optional; backend defaults to 0.25.
  rate_change_step?: number
}

// --- Response pieces ---

// One row of the amortisation schedule. Money fields are strings (see note above).
export interface ScheduleRow {
  period: number
  phase: Phase
  principal: string
  interest: string
  closing_balance: string
}

// Summary numbers for a single rate scenario (used inside rate_sensitivity).
export interface SensitivityResult {
  // The rate actually varied: revert_rate for fixed/interest-only loans, annual_rate for variable.
  rate_used: number
  repayment_amount: string
  total_interest: string
  total_repayment: string
}

export interface RateSensitivity {
  step: number
  minus: SensitivityResult
  plus: SensitivityResult
}

// Present (non-null) only when offset_amount > 0.
export interface OffsetSavings {
  repayment_saving_per_period: string
  total_interest_saved: string
}

// --- Response: what /calculate/ returns ---
export interface CalculateResponse {
  // Echoed inputs
  loan_amount: string
  annual_rate: number
  rate_type: RateType
  repayment_type: RepaymentType
  repayment_frequency: RepaymentFrequency
  loan_term_years: number
  fixed_rate_period_years: number | null
  revert_rate: number | null
  offset_amount: string

  // Computed headline figures
  repayment_amount: string
  total_repayment: string
  total_interest: string

  offset_savings: OffsetSavings | null

  rate_change_step: number
  rate_sensitivity: RateSensitivity

  schedule: ScheduleRow[]
}

// --- Saved scenario (stored in backend, linked to Auth0 user) ---
// The backend stores loan inputs as a `splits` array; we read splits[0] as the inputs.
export interface ScenarioSplit {
  id: number
  order: number
  loan_amount: string
  annual_rate: string
  rate_type: RateType
  repayment_type: RepaymentType
  repayment_frequency: RepaymentFrequency
  loan_term_years: number
  fixed_rate_period_years: number | null
  revert_rate: string | null
  offset_amount: string
}

export interface Scenario {
  id: number
  name: string
  splits: ScenarioSplit[]
  created_at: string // ISO 8601
}

// The backend expects `loan` (not `inputs`) for the calculator input fields.
export interface CreateScenarioRequest {
  name: string
  loan: CalculateRequest
}

// How many repayment periods occur per year for each frequency.
// Handy for both the calculator UI and the schedule-aggregation utility.
export const PERIODS_PER_YEAR: Record<RepaymentFrequency, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
}
