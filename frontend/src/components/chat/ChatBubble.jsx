import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, RefreshCw, Sprout, User, Volume2, VolumeX, ShieldCheck } from 'lucide-react'
import { speakText, stopSpeech } from '@/utils/speech'

export default function ChatBubble({ message, onRegenerate, selectedLanguage = 'en' }) {
  const isUser = message.role === 'user'
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    if (speaking) {
      stopSpeech()
      setSpeaking(false)
    } else {
      setSpeaking(true)
      speakText(message.content, selectedLanguage, () => setSpeaking(false))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
        ${isUser ? 'bg-[var(--color-secondary)] text-white' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
        {isUser ? <User className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
      </div>
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-2
        ${isUser ? 'bg-[var(--color-secondary)] text-white rounded-tr-sm' : 'glass rounded-tl-sm'}`}>
        
        {/* Assistant Header RAG badge */}
        {!isUser && (message.rag_used || message.sources?.length > 0) && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-primary)] pb-1 border-b border-current/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🌱 RAG Package of Practices Verified</span>
          </div>
        )}

        <p className="whitespace-pre-line">{message.content}</p>

        {/* Sources list if any */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="text-[11px] text-current/50 pt-1 border-t border-current/10 flex flex-wrap gap-1 items-center">
            <span className="font-semibold text-current/70">Sources:</span>
            {message.sources.map((src, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-current/5 border border-current/10">
                {src}
              </span>
            ))}
          </div>
        )}

        {/* Action icons */}
        {!isUser && (
          <div className="flex items-center gap-3 pt-1 text-current/40">
            <button
              onClick={handleSpeak}
              title={speaking ? "Stop voice output" : "Listen to answer (Voice TTS)"}
              className={`hover:text-current/80 flex items-center gap-1 text-xs ${speaking ? 'text-emerald-500 font-bold animate-pulse' : ''}`}
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{speaking ? 'Speaking...' : 'Listen'}</span>
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              title="Copy answer text"
              className="hover:text-current/80 flex items-center gap-1 text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>

            <button
              onClick={() => onRegenerate?.(message)}
              title="Regenerate reply"
              className="hover:text-current/80 flex items-center gap-1 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
