import { useState } from 'react'
import type { RepaymentFrequency, ScheduleRow } from '../../types/mortgage'
import { PERIODS_PER_YEAR } from '../../types/mortgage'
import { formatAUD } from '../../utils/money'
import { aggregateByYear } from '../../utils/schedule'
import styles from './ScheduleTable.module.css'

interface Props {
  schedule: ScheduleRow[]
  frequency: RepaymentFrequency
}

function ScheduleTable({ schedule, frequency }: Props) {
  // Default to the compact annual view; only render every period on request
  // (a 30yr weekly loan is 1,560 rows).
  const [showAll, setShowAll] = useState(false)
  const periodsPerYear = PERIODS_PER_YEAR[frequency]
  const years = aggregateByYear(schedule, periodsPerYear)

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.title}>
          {showAll ? 'Repayment schedule — every period' : 'Repayment schedule — by year'}
        </p>
        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? 'Show yearly summary' : `Show every period (${schedule.length})`}
        </button>
      </div>

      <div className={styles.scroll}>
        {showAll ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Period</th>
                <th>Phase</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td className={styles.phase}>{row.phase.replace('_', ' ')}</td>
                  <td className="figure">{formatAUD(row.principal)}</td>
                  <td className="figure">{formatAUD(row.interest)}</td>
                  <td className="figure">{formatAUD(row.closing_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Year</th>
                <th>Principal paid</th>
                <th>Interest paid</th>
                <th>Balance remaining</th>
              </tr>
            </thead>
            <tbody>
              {years.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td className="figure">{formatAUD(row.principalPaid)}</td>
                  <td className="figure">{formatAUD(row.interestPaid)}</td>
                  <td className="figure">{formatAUD(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ScheduleTable
