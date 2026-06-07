import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'

export default function SignupPage() {
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
        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.sub}>
          Save your mortgage scenarios and access them anywhere.
        </p>
        <button
          className={styles.primaryBtn}
          onClick={() =>
            loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })
          }
        >
          Sign up with Auth0
        </button>
        <p className={styles.switchText}>
          Already have an account?{' '}
          <button
            className={styles.linkBtn}
            onClick={() => loginWithRedirect()}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
