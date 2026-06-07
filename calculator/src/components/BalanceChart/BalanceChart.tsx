import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScheduleRow } from '../../types/mortgage'
import { formatAUD, toNumber } from '../../utils/money'
import { findPhaseTransitions } from '../../utils/schedule'
import styles from './BalanceChart.module.css'

interface Props {
  schedule: ScheduleRow[]
}

// Short axis labels: 400000 -> "$400k".
function compactAUD(value: number): string {
  return `$${Math.round(value / 1000)}k`
}

function BalanceChart({ schedule }: Props) {
  // Recharts needs numbers, so we parse closing_balance here.
  // Stop at the first period where the balance reaches zero (loan fully repaid).
  const rawData = schedule.map((row) => ({
    period: row.period,
    balance: toNumber(row.closing_balance),
  }))
  const zeroIdx = rawData.findIndex((d) => d.balance <= 0)
  const data =
    zeroIdx === -1
      ? rawData
      : [...rawData.slice(0, zeroIdx), { ...rawData[zeroIdx], balance: 0 }]
  const transitions = findPhaseTransitions(schedule)

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Loan balance over time</p>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-beige-dark)" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              label={{ value: 'Period', position: 'insideBottom', offset: -4, fontSize: 12 }}
            />
            <YAxis tickFormatter={compactAUD} tick={{ fontSize: 12 }} width={56} />
            <Tooltip
              formatter={(value: number) => [formatAUD(value), 'Balance']}
              labelFormatter={(period) => `Period ${period}`}
            />
            {/* Vertical marker(s) where the loan changes phase (e.g. fixed -> variable). */}
            {transitions.map((t) => (
              <ReferenceLine
                key={t.period}
                x={t.period}
                stroke="var(--color-chart-phase)"
                strokeDasharray="4 4"
                label={{ value: t.phase, fontSize: 11, fill: 'var(--color-chart-phase)' }}
              />
            ))}
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-chart-balance)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BalanceChart
