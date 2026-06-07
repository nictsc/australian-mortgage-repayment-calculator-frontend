import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign in</h1>
        <p className={styles.sub}>
          Save and revisit your mortgage scenarios across devices.
        </p>
        <button
          className={styles.primaryBtn}
          onClick={() => loginWithRedirect()}
        >
          Continue with Auth0
        </button>
        <p className={styles.switchText}>
          Don't have an account?{' '}
          <button
            className={styles.linkBtn}
            onClick={() =>
              loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })
            }
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
