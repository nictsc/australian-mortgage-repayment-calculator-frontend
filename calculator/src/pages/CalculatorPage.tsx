import { useState } from 'react'
import type { CalculateRequest, CalculateResponse } from '../types/mortgage'
import { calculate } from '../api/mortgage'
import { ApiError } from '../api/client'
import CalculatorForm from '../components/CalculatorForm/CalculatorForm'
import SummaryCards from '../components/SummaryCards/SummaryCards'
import ResultsToggle from '../components/ResultsToggle/ResultsToggle'
import type { ResultsView } from '../components/ResultsToggle/ResultsToggle'
import BalanceChart from '../components/BalanceChart/BalanceChart'
import ScheduleTable from '../components/ScheduleTable/ScheduleTable'
import styles from './CalculatorPage.module.css'

function CalculatorPage() {
  const [result, setResult] = useState<CalculateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [view, setView] = useState<ResultsView>('graph')

  async function handleSubmit(request: CalculateRequest) {
    setLoading(true)
    setError(null)
    try {
      const response = await calculate(request)
      setResult(response)
    } catch (err) {
      // Our API layer always throws ApiError; this is just a safety net.
      setError(err instanceof ApiError ? err : new ApiError('Something went wrong.', 0))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Australian Mortgage Repayment Calculator</h1>
        <p className={styles.subtitle}>
          Estimate repayments, see your balance fall over time, and stress-test against
          rate changes.
        </p>
      </header>

      <div className={styles.layout}>
        <CalculatorForm
          onSubmit={handleSubmit}
          loading={loading}
          serverErrors={error?.fieldErrors}
        />

        <div className={styles.results}>
          {error && <div className={styles.error} role="alert">{error.message}</div>}

          {result ? (
            <>
              <SummaryCards result={result} />

              <div className={styles.resultsHeader}>
                <ResultsToggle view={view} onChange={setView} />
              </div>

              {view === 'graph' ? (
                <BalanceChart schedule={result.schedule} />
              ) : (
                <ScheduleTable
                  schedule={result.schedule}
                  frequency={result.repayment_frequency}
                />
              )}
            </>
          ) : (
            !error && (
              <div className={styles.placeholder}>
                Enter your loan details and select <strong>Calculate repayments</strong> to
                see results.
              </div>
            )
          )}
        </div>
      </div>
    </main>
  )
}

export default CalculatorPage
