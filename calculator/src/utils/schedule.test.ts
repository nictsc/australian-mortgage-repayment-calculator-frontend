import type { Phase, ScheduleRow } from '../types/mortgage'
import { aggregateByYear, findPhaseTransitions } from './schedule'

// Helper to build a schedule row without repeating boilerplate.
function row(period: number, phase: Phase, balance: string): ScheduleRow {
  return {
    period,
    phase,
    principal: '100.00',
    interest: '50.00',
    closing_balance: balance,
  }
}

describe('aggregateByYear', () => {
  it('collapses periods into one row per year and sums correctly', () => {
    // 24 monthly periods => 2 years of 12.
    const schedule = Array.from({ length: 24 }, (_, i) =>
      row(i + 1, 'variable', String(24000 - (i + 1) * 1000) + '.00'),
    )

    const years = aggregateByYear(schedule, 12)

    expect(years).toHaveLength(2)
    expect(years[0].year).toBe(1)
    expect(years[0].principalPaid).toBe(1200) // 100 * 12
    expect(years[0].interestPaid).toBe(600) // 50 * 12
    // Closing balance is the LAST period of the year (period 12 => 24000 - 12000).
    expect(years[0].closingBalance).toBe(12000)
    expect(years[1].closingBalance).toBe(0) // period 24 => 24000 - 24000
  })
})

describe('findPhaseTransitions', () => {
  it('returns the period where the phase changes', () => {
    const schedule: ScheduleRow[] = [
      row(1, 'fixed', '99'),
      row(2, 'fixed', '98'),
      row(3, 'fixed', '97'),
      row(4, 'variable', '96'),
      row(5, 'variable', '95'),
    ]

    expect(findPhaseTransitions(schedule)).toEqual([{ period: 4, phase: 'variable' }])
  })

  it('returns an empty array when the phase never changes', () => {
    const schedule = [row(1, 'variable', '99'), row(2, 'variable', '98')]
    expect(findPhaseTransitions(schedule)).toEqual([])
  })
})
