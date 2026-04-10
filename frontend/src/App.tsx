import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { ExpenseListPage } from './pages/ExpenseListPage'
import { NewExpensePage } from './pages/NewExpensePage'
import { EditExpensePage } from './pages/EditExpensePage'
import { UploadReceiptPage } from './pages/UploadReceiptPage'
import { ReviewExpensePage } from './pages/ReviewExpensePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { CheckEmailPage } from './pages/CheckEmailPage'

export default function App() {
  return (
    <Routes>
      {/* Public auth routes (no layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/check-email" element={<CheckEmailPage />} />

      {/* Protected app routes (with layout) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/expenses" element={<ExpenseListPage />} />
                <Route path="/expenses/new" element={<NewExpensePage />} />
                <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
                <Route path="/expenses/upload" element={<UploadReceiptPage />} />
                <Route path="/expenses/review" element={<ReviewExpensePage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
