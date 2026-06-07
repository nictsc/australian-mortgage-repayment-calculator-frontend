import { Routes, Route, Navigate } from 'react-router-dom'
import CalculatorPage from './pages/CalculatorPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ScenariosPage from './pages/ScenariosPage'
import AuthGuard from './components/AuthGuard/AuthGuard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CalculatorPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/scenarios"
        element={
          <AuthGuard>
            <ScenariosPage />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
