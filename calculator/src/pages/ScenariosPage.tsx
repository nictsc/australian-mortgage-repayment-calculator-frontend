import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { listScenarios, deleteScenario } from '../api/scenarios'
import type { Scenario } from '../types/mortgage'
import { formatAUD } from '../utils/money'
import styles from './ScenariosPage.module.css'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string

export default function ScenariosPage() {
  const { getAccessTokenSilently, logout } = useAuth0()
  const navigate = useNavigate()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const token = await getAccessTokenSilently({ authorizationParams: { audience: AUDIENCE } })
        const data = await listScenarios(token)
        if (!cancelled) setScenarios(data)
      } catch {
        if (!cancelled) setError('Failed to load scenarios. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [getAccessTokenSilently])

  async function handleDelete(id: number) {
    setDeleting(id)
    try {
      const token = await getAccessTokenSilently({ authorizationParams: { audience: AUDIENCE } })
      await deleteScenario(id, token)
      setScenarios(prev => prev.filter(s => s.id !== id))
    } catch {
      setError('Could not delete scenario. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  function handleLoad(scenario: Scenario) {
    const split = scenario.splits[0]
    if (!split) return
    navigate('/', {
      state: {
        scenario: {
          loan_amount: Number(split.loan_amount),
          annual_rate: Number(split.annual_rate),
          rate_type: split.rate_type,
          repayment_type: split.repayment_type,
          repayment_frequency: split.repayment_frequency,
          loan_term_years: split.loan_term_years,
          fixed_rate_period_years: split.fixed_rate_period_years ?? undefined,
          revert_rate: split.revert_rate != null ? Number(split.revert_rate) : undefined,
          offset_amount: Number(split.offset_amount),
        },
      },
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Saved Scenarios</h1>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => navigate('/')}>
            ← Calculator
          </button>
          <button
            className={styles.linkBtn}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Sign out
          </button>
        </div>
      </header>

      {loading && <p className={styles.status}>Loading…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && scenarios.length === 0 && !error && (
        <div className={styles.empty}>
          <p>No saved scenarios yet.</p>
          <button className={styles.primaryBtn} onClick={() => navigate('/')}>
            Go to Calculator
          </button>
        </div>
      )}

      {!loading && scenarios.length > 0 && (
        <ul className={styles.list}>
          {scenarios.map(scenario => (
            <li key={scenario.id} className={styles.card}>
              <div className={styles.cardBody}>
                <h2 className={styles.scenarioName}>{scenario.name}</h2>
                <dl className={styles.details}>
                  {scenario.splits[0] && (
                    <>
                      <div>
                        <dt>Loan amount</dt>
                        <dd>{formatAUD(scenario.splits[0].loan_amount)}</dd>
                      </div>
                      <div>
                        <dt>Rate</dt>
                        <dd>{scenario.splits[0].annual_rate}%</dd>
                      </div>
                      <div>
                        <dt>Term</dt>
                        <dd>{scenario.splits[0].loan_term_years} years</dd>
                      </div>
                      <div>
                        <dt>Frequency</dt>
                        <dd style={{ textTransform: 'capitalize' }}>
                          {scenario.splits[0].repayment_frequency}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
                <p className={styles.date}>
                  Saved {new Date(scenario.created_at).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => handleLoad(scenario)}
                >
                  Load
                </button>
                <button
                  className={styles.dangerBtn}
                  onClick={() => handleDelete(scenario.id)}
                  disabled={deleting === scenario.id}
                >
                  {deleting === scenario.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
