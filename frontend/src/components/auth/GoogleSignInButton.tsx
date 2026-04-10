import { useEffect, useRef, useCallback } from 'react'

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              width?: number
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              logo_alignment?: 'left' | 'center'
            }
          ) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  disabled?: boolean
}

export function GoogleSignInButton({
  onCredential,
  text = 'continue_with',
  disabled = false,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCredential)
  callbackRef.current = onCredential

  const initializeGoogle = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        callbackRef.current(response.credential)
      },
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text,
      width: 352,
      shape: 'rectangular',
      logo_alignment: 'left',
    })
  }, [text])

  useEffect(() => {
    // The GSI script may already be loaded or still loading
    if (window.google) {
      initializeGoogle()
      return
    }

    // Wait for the script to load
    const check = setInterval(() => {
      if (window.google) {
        clearInterval(check)
        initializeGoogle()
      }
    }, 100)

    // Give up after 10 seconds
    const timeout = setTimeout(() => clearInterval(check), 10000)

    return () => {
      clearInterval(check)
      clearTimeout(timeout)
    }
  }, [initializeGoogle])

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    return null // Don't render Google button if no client ID configured
  }

  return (
    <div
      ref={buttonRef}
      className={disabled ? 'pointer-events-none opacity-50' : ''}
    />
  )
}
