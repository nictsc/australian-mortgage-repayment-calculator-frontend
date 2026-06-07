import type { Phase, ScheduleRow } from '../types/mortgage'
import { toNumber } from './money'

// One aggregated row per year, for the compact default table view.
// (A 30yr weekly loan has 1,560 period rows — far too many to render raw.)
export interface YearSummary {
  year: number
  principalPaid: number
  interestPaid: number
  // Balance remaining at the end of the year (last period's closing balance).
  closingBalance: number
}

/**
 * Collapse a per-period schedule into per-year summaries.
 * @param rows           full schedule from the API
 * @param periodsPerYear 52 / 26 / 12 depending on repayment frequency
 */
export function aggregateByYear(
  rows: ScheduleRow[],
  periodsPerYear: number,
): YearSummary[] {
  const years: YearSummary[] = []

  rows.forEach((row, index) => {
    const yearIndex = Math.floor(index / periodsPerYear)

    // Start a new year bucket when we cross into it.
    if (!years[yearIndex]) {
      years[yearIndex] = {
        year: yearIndex + 1,
        principalPaid: 0,
        interestPaid: 0,
        closingBalance: 0,
      }
    }

    const bucket = years[yearIndex]
    bucket.principalPaid += toNumber(row.principal)
    bucket.interestPaid += toNumber(row.interest)
    // Each row overwrites this; the last row of the year wins, which is what we want.
    bucket.closingBalance = toNumber(row.closing_balance)
  })

  return years
}

export interface PhaseTransition {
  // The period at which the new phase begins.
  period: number
  phase: Phase
}

/**
 * Find the period(s) where the loan changes phase (e.g. fixed -> variable).
 * Used to draw a vertical ReferenceLine on the balance chart.
 */
export function findPhaseTransitions(rows: ScheduleRow[]): PhaseTransition[] {
  const transitions: PhaseTransition[] = []

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].phase !== rows[i - 1].phase) {
      transitions.push({ period: rows[i].period, phase: rows[i].phase })
    }
  }

  return transitions
}
