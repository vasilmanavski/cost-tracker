import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { resendVerification } from '../api/auth'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export function CheckEmailPage() {
  const { user } = useAuth()
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleResend = async () => {
    if (!user?.email) return
    setResendStatus('sending')
    try {
      await resendVerification(user.email)
      setResendStatus('sent')
    } catch {
      setResendStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <EnvelopeIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 mb-4">
            We sent a verification link to{' '}
            <span className="font-medium text-gray-700">{user?.email ?? 'your email'}</span>.
            Click the link to activate your account.
          </p>

          {resendStatus === 'sent' ? (
            <p className="text-sm text-green-600">Verification email resent!</p>
          ) : resendStatus === 'error' ? (
            <p className="text-sm text-red-600">Failed to resend. Please try again.</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendStatus === 'sending'}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {resendStatus === 'sending' ? 'Sending...' : "Didn't get the email? Resend"}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
