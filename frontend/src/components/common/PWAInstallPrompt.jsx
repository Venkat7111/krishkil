import { useEffect, useState } from 'react'
import { Download, Smartphone, X } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
  )

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      setShowInstructions(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstructions((visible) => !visible)
      return
    }

    try {
      const prompt = installPrompt
      setInstallPrompt(null)
      await prompt.prompt()
      await prompt.userChoice
    } catch (error) {
      console.error('KrishiSahay installation prompt failed:', error)
      setShowInstructions(true)
    }
  }

  if (installed) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
      {showInstructions && (
        <div
          role="status"
          className="max-w-xs rounded-xl border border-current/10 bg-white p-4 text-sm text-gray-800 shadow-xl dark:bg-gray-900 dark:text-gray-100"
        >
          <div className="flex items-start gap-2">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <p>
              Open your browser menu and choose <strong>Install app</strong> or{' '}
              <strong>Add to Home Screen</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="ml-1 rounded p-1 hover:bg-current/10"
              aria-label="Close install instructions"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={handleInstall}
        className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 font-medium text-white shadow-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Download className="h-5 w-5" />
        Install app
      </button>
    </div>
  )
}
