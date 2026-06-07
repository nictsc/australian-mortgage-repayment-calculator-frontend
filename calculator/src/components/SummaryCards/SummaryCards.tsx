import type { CalculateResponse } from '../../types/mortgage'
import { formatAUD } from '../../utils/money'
import styles from './SummaryCards.module.css'

interface Props {
  result: CalculateResponse
}

// Repayment frequency reads nicely as a per-period label.
const FREQUENCY_LABEL: Record<string, string> = {
  weekly: 'per week',
  fortnightly: 'per fortnight',
  monthly: 'per month',
}

function SummaryCards({ result }: Props) {
  const { offset_savings } = result
  const perPeriod = FREQUENCY_LABEL[result.repayment_frequency] ?? 'per period'

  return (
    <section aria-label="Summary">
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Repayment</div>
          <div className={`${styles.cardValue} figure`}>
            {formatAUD(result.repayment_amount)}
          </div>
          <div className={styles.sub}>{perPeriod}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Total interest</div>
          <div className={`${styles.cardValue} figure`}>
            {formatAUD(result.total_interest)}
          </div>
          <div className={styles.sub}>over the life of the loan</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Total repayment</div>
          <div className={`${styles.cardValue} figure`}>
            {formatAUD(result.total_repayment)}
          </div>
          <div className={styles.sub}>principal + interest</div>
        </div>
      </div>

{/* Offset savings only appear when an offset amount was supplied. */}
      {offset_savings && (
        <p className={styles.offset}>
          Offset saves {formatAUD(offset_savings.total_interest_saved)} in interest
          {' '}over the life of the loan
          {' '}({formatAUD(offset_savings.repayment_saving_per_period)} {perPeriod}).
        </p>
      )}
    </section>
  )
}

export default SummaryCards
