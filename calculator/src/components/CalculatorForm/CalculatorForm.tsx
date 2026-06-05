import { useState } from 'react'
import type {
  CalculateRequest,
  RateType,
  RepaymentType,
  RepaymentFrequency,
} from '../../types/mortgage'
import type { FieldErrors } from '../../api/client'
import styles from './CalculatorForm.module.css'

// We keep every input as a string in state (that's what <input> gives us) and
// only convert to numbers when we build the request. Selects use our union types.
interface FormState {
  loan_amount: string
  annual_rate: string
  rate_type: RateType
  repayment_type: RepaymentType
  repayment_frequency: RepaymentFrequency
  loan_term_years: string
  fixed_rate_period_years: string
  revert_rate: string
  offset_amount: string
}

const INITIAL: FormState = {
  loan_amount: '500000',
  annual_rate: '6.0',
  rate_type: 'variable',
  repayment_type: 'principal_and_interest',
  repayment_frequency: 'monthly',
  loan_term_years: '30',
  fixed_rate_period_years: '3',
  revert_rate: '7.0',
  offset_amount: '0',
}

interface Props {
  onSubmit: (request: CalculateRequest) => void
  loading: boolean
  // Field errors returned by the backend (source of truth), merged with ours.
  serverErrors?: FieldErrors
}

// Client-side validation mirroring the backend rules. The server still has the
// final say — this is purely for fast feedback.
function validate(state: FormState, hasFixed: boolean, showOffset: boolean): FieldErrors {
  const errors: FieldErrors = {}

  const loan = parseFloat(state.loan_amount)
  if (!state.loan_amount || isNaN(loan) || loan <= 0) {
    errors.loan_amount = 'Enter a loan amount greater than 0.'
  }

  const rate = parseFloat(state.annual_rate)
  if (isNaN(rate) || rate < 0.01 || rate > 20) {
    errors.annual_rate = 'Rate must be between 0.01% and 20%.'
  }

  const term = parseInt(state.loan_term_years, 10)
  if (isNaN(term) || term < 1 || term > 40) {
    errors.loan_term_years = 'Term must be between 1 and 40 years.'
  }

  if (hasFixed) {
    const fixed = parseInt(state.fixed_rate_period_years, 10)
    if (isNaN(fixed) || fixed < 1 || fixed > 5) {
      errors.fixed_rate_period_years = 'Fixed period must be between 1 and 5 years.'
    }
    const revert = parseFloat(state.revert_rate)
    if (isNaN(revert) || revert < 0.01 || revert > 20) {
      errors.revert_rate = 'Revert rate must be between 0.01% and 20%.'
    }
  }

  if (showOffset && state.offset_amount) {
    const offset = parseFloat(state.offset_amount)
    if (isNaN(offset) || offset < 0) {
      errors.offset_amount = 'Offset cannot be negative.'
    } else if (!isNaN(loan) && offset > loan) {
      errors.offset_amount = 'Offset cannot exceed the loan amount.'
    }
  }

  return errors
}

function CalculatorForm({ onSubmit, loading, serverErrors }: Props) {
  const [state, setState] = useState<FormState>(INITIAL)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})

  // Business rules drive which fields are visible.
  const hasFixed = state.rate_type === 'fixed' || state.repayment_type === 'interest_only'
  const showOffset = state.rate_type === 'variable'

  // Merge: a freshly-typed client error takes priority, else show the server's.
  const errors: FieldErrors = { ...serverErrors, ...clientErrors }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const found = validate(state, hasFixed, showOffset)
    setClientErrors(found)
    if (Object.keys(found).length > 0) return

    const request: CalculateRequest = {
      loan_amount: parseFloat(state.loan_amount),
      annual_rate: parseFloat(state.annual_rate),
      rate_type: state.rate_type,
      repayment_type: state.repayment_type,
      repayment_frequency: state.repayment_frequency,
      loan_term_years: parseInt(state.loan_term_years, 10),
    }
    if (hasFixed) {
      request.fixed_rate_period_years = parseInt(state.fixed_rate_period_years, 10)
      request.revert_rate = parseFloat(state.revert_rate)
    }
    if (showOffset && state.offset_amount) {
      request.offset_amount = parseFloat(state.offset_amount)
    }

    onSubmit(request)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.legend}>Loan details</p>

      <div className={styles.row}>
        <Field id="loan_amount" label="Loan amount ($)" error={errors.loan_amount}>
          <input
            id="loan_amount"
            type="number"
            min="0"
            step="1000"
            className={inputClass(errors.loan_amount, styles.amountInput)}
            value={state.loan_amount}
            onChange={(e) => update('loan_amount', e.target.value)}
          />
        </Field>

        <Field id="loan_term_years" label="Loan term (years)" error={errors.loan_term_years}>
          <input
            id="loan_term_years"
            type="number"
            min="1"
            max="40"
            className={inputClass(errors.loan_term_years)}
            value={state.loan_term_years}
            onChange={(e) => update('loan_term_years', e.target.value)}
          />
        </Field>
      </div>

      <div className={styles.row}>
        <Field id="annual_rate" label="Annual rate (%)" error={errors.annual_rate}>
          <input
            id="annual_rate"
            type="number"
            min="0.01"
            max="20"
            step="0.01"
            className={inputClass(errors.annual_rate)}
            value={state.annual_rate}
            onChange={(e) => update('annual_rate', e.target.value)}
          />
        </Field>

        <Field id="repayment_frequency" label="Repayment frequency">
          <select
            id="repayment_frequency"
            className={styles.select}
            value={state.repayment_frequency}
            onChange={(e) =>
              update('repayment_frequency', e.target.value as RepaymentFrequency)
            }
          >
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
      </div>

      <div className={styles.row}>
        <Field id="rate_type" label="Rate type">
          <select
            id="rate_type"
            className={styles.select}
            value={state.rate_type}
            onChange={(e) => update('rate_type', e.target.value as RateType)}
          >
            <option value="variable">Variable</option>
            <option value="fixed">Fixed</option>
          </select>
        </Field>

        <Field id="repayment_type" label="Repayment type">
          <select
            id="repayment_type"
            className={styles.select}
            value={state.repayment_type}
            onChange={(e) => update('repayment_type', e.target.value as RepaymentType)}
          >
            <option value="principal_and_interest">Principal &amp; Interest</option>
            <option value="interest_only">Interest only</option>
          </select>
        </Field>
      </div>

      {/* Conditional: fixed-rate or interest-only loans have a fixed period + revert rate. */}
      {hasFixed && (
        <div className={styles.row}>
          <Field
            id="fixed_rate_period_years"
            label="Fixed period (years)"
            error={errors.fixed_rate_period_years}
          >
            <input
              id="fixed_rate_period_years"
              type="number"
              min="1"
              max="5"
              className={inputClass(errors.fixed_rate_period_years)}
              value={state.fixed_rate_period_years}
              onChange={(e) => update('fixed_rate_period_years', e.target.value)}
            />
          </Field>

          <Field id="revert_rate" label="Revert rate (%)" error={errors.revert_rate}>
            <input
              id="revert_rate"
              type="number"
              min="0.01"
              max="20"
              step="0.01"
              className={inputClass(errors.revert_rate)}
              value={state.revert_rate}
              onChange={(e) => update('revert_rate', e.target.value)}
            />
          </Field>
        </div>
      )}

      {/* Conditional: offset accounts only apply to variable-rate loans. */}
      {showOffset && (
        <Field id="offset_amount" label="Offset amount ($)" error={errors.offset_amount}>
          <input
            id="offset_amount"
            type="number"
            min="0"
            step="1000"
            className={inputClass(errors.offset_amount)}
            value={state.offset_amount}
            onChange={(e) => update('offset_amount', e.target.value)}
          />
        </Field>
      )}

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'Calculating…' : 'Calculate repayments'}
      </button>
    </form>
  )
}

// Small presentational helper: label + control + error message.
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}

function inputClass(error?: string, extra?: string): string {
  const base = error ? `${styles.input} ${styles.invalid}` : styles.input
  return extra ? `${base} ${extra}` : base
}


export default CalculatorForm
