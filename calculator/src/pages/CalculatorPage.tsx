import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import type { CalculateRequest, CalculateResponse } from '../types/mortgage'
import { calculate } from '../api/mortgage'
import { ApiError } from '../api/client'
import { createScenario } from '../api/scenarios'
import CalculatorForm from '../components/CalculatorForm/CalculatorForm'
import SummaryCards from '../components/SummaryCards/SummaryCards'
import ResultsToggle from '../components/ResultsToggle/ResultsToggle'
import type { ResultsView } from '../components/ResultsToggle/ResultsToggle'
import BalanceChart from '../components/BalanceChart/BalanceChart'
import ScheduleTable from '../components/ScheduleTable/ScheduleTable'
import styles from './CalculatorPage.module.css'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string

function CalculatorPage() {
  const { isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0()
  const location = useLocation()
  const loadedScenario = (location.state as { scenario?: CalculateRequest } | null)?.scenario ?? null

  const [result, setResult] = useState<CalculateResponse | null>(null)
  const [lastRequest, setLastRequest] = useState<CalculateRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [view, setView] = useState<ResultsView>('graph')

  const [savePromptOpen, setSavePromptOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (loadedScenario) handleSubmit(loadedScenario)
  }, [loadedScenario]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(request: CalculateRequest) {
    setLoading(true)
    setError(null)
    setSaveSuccess(false)
    try {
      const response = await calculate(request)
      setResult(response)
      setLastRequest(request)
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError('Something went wrong.', 0))
    } finally {
      setLoading(false)
    }
  }

  function openSavePrompt() {
    setScenarioName('')
    setSaveError(null)
    setSavePromptOpen(true)
  }

  async function handleSave() {
    if (!lastRequest || !scenarioName.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const token = await getAccessTokenSilently({ authorizationParams: { audience: AUDIENCE } })
      await createScenario(scenarioName.trim(), lastRequest, token)
      setSavePromptOpen(false)
      setSaveSuccess(true)
    } catch {
      setSaveError('Could not save scenario. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        {isAuthenticated ? (
          <>
            <Link to="/scenarios" className={styles.navLink}>Saved scenarios</Link>
            <button
              className={styles.navBtn}
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button className={styles.navBtn} onClick={() => loginWithRedirect()}>
              Sign in
            </button>
            <button
              className={styles.navBtnPrimary}
              onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            >
              Sign up
            </button>
          </>
        )}
      </nav>

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
          initialValues={loadedScenario ?? undefined}
        />

        <div className={styles.results}>
          {error && <div className={styles.error} role="alert">{error.message}</div>}

          {result ? (
            <>
              <SummaryCards result={result} />

              <div className={styles.resultsHeader}>
                <ResultsToggle view={view} onChange={setView} />
                {isAuthenticated && (
                  <button className={styles.saveBtn} onClick={openSavePrompt}>
                    Save scenario
                  </button>
                )}
              </div>

              {saveSuccess && (
                <p className={styles.saveSuccess}>Scenario saved! View it in <Link to="/scenarios">Saved scenarios</Link>.</p>
              )}

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

      {savePromptOpen && (
        <div className={styles.modalOverlay} onClick={() => setSavePromptOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalHeading}>Save scenario</h2>
            <label className={styles.modalLabel} htmlFor="scenario-name">
              Scenario name
            </label>
            <input
              id="scenario-name"
              className={styles.modalInput}
              type="text"
              placeholder="e.g. 30yr fixed at 5.5%"
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            {saveError && <p className={styles.modalError}>{saveError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.navBtn} onClick={() => setSavePromptOpen(false)}>
                Cancel
              </button>
              <button
                className={styles.navBtnPrimary}
                onClick={handleSave}
                disabled={saving || !scenarioName.trim()}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default CalculatorPage
