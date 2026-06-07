import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AuthGuard({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--color-ink-muted)' }}>Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
