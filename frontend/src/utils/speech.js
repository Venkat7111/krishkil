/**
 * Web Speech API Utilities: Speech-to-Text (STT) & Text-to-Speech (TTS).
 */

// Language code mapping for Speech Recognition & Synthesis
const SPEECH_LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
}

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let activeRecognition = null

/**
 * Starts microphone listening (Speech-to-Text).
 */
export function startSpeechRecognition({ lang = 'en', onResult, onError, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    onError?.('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
    return null
  }

  try {
    if (activeRecognition) {
      activeRecognition.stop()
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN'

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onResult?.(transcript)
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error)
      onError?.(event.error)
    }

    recognition.onend = () => {
      activeRecognition = null
      onEnd?.()
    }

    recognition.start()
    activeRecognition = recognition
    return recognition
  } catch (err) {
    console.error('Failed to start speech recognition:', err)
    onError?.(err.message)
    return null
  }
}

export function stopSpeechRecognition() {
  if (activeRecognition) {
    activeRecognition.stop()
    activeRecognition = null
  }
}

/**
 * Speaks text out loud (Text-to-Speech).
 */
export function speakText(text, lang = 'en', onEnd) {
  if (!isSpeechSynthesisSupported() || !text) return

  try {
    window.speechSynthesis.cancel() // Stop any previous speech

    const cleanText = text.replace(/[*#_`-]/g, ' ') // Strip markdown symbols
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = SPEECH_LANG_MAP[lang] || 'en-IN'
    utterance.rate = 0.95 // Slightly slower for clarity
    utterance.pitch = 1.0

    utterance.onend = () => onEnd?.()
    utterance.onerror = () => onEnd?.()

    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.error('Speech synthesis error:', err)
    onEnd?.()
  }
}

export function stopSpeech() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}
