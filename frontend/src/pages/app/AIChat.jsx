import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Mic, MicOff, Paperclip, Image as ImageIcon, Sparkles, FileText, Globe } from 'lucide-react'
import ChatBubble from '@/components/chat/ChatBubble'
import TypingIndicator from '@/components/chat/TypingIndicator'
import { chatAPI } from '@/services/api/chatAPI'
import Button from '@/components/common/Button'
import { SUPPORTED_LANGUAGES, translateText } from '@/utils/translation'
import { startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported } from '@/utils/speech'

export default function AIChat() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('query')

  const initialLang = localStorage.getItem('ks_lang') || 'en'
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang)

  const GREETINGS = {
    te: "నమస్కారం! నేను మీ కృషిసహాయ్ AI అగ్రానమిస్ట్‌ను. వరి, పత్తి, టమాటో పంటలలో NPK ఎరువులు, తెగుళ్ళు, మార్కెట్ ధరల గురించి నన్ను అడగండి.",
    hi: "नमस्ते किसान भाई! मैं आपका कृषि सहाय AI मित्र हूँ। फसल, NPK खाद, कीट-रोग नियंत्रण या मंडी भाव के बारे में कोई भी प्रश्न पूछें।",
    ta: "வணக்கம்! நான் உங்கள் கிருஷிசஹாய் AI விவசாய உதவியாளர். பயிர் உரம், பூச்சி தாக்குதல் பற்றி கேளுங்கள்.",
    kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯ್ AI ಸಹಾಯಕ. ಬೆಳೆ, ರಸಗೊಬ್ಬರ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣದ ಬಗ್ಗೆ ಕೇಳಿ.",
    mr: "नमस्कार शेतकरी बंधूंनो! मी आपला कृषी सहाय्य AI मित्र आहे. पिके, खते, कीड नियंत्रणाबद्दल विचारा.",
    bn: "নমস্কার! আমি আপনার কৃষিসহায় AI সহকারী। ফসল, সার ও রোগবালাই সম্পর্কে জিজ্ঞাসা করুন।",
    en: "Namaste! I'm your KrishiSahay AI assistant powered by verified RAG Package of Practices. Ask me about crop NPK fertilizers, disease pesticides, weather, or mandi prices."
  }

  const [messages, setMessages] = useState([
    {
      id: 'greet',
      role: 'assistant',
      content: GREETINGS[initialLang] || GREETINGS.en,
      rag_used: true
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    chatAPI.getSuggestedQuestions(selectedLanguage).then(setSuggestions)
    localStorage.setItem('ks_lang', selectedLanguage)
  }, [selectedLanguage])

  // Auto-send query if navigated from another page (e.g. Disease Detection)
  useEffect(() => {
    if (initialQuery) {
      send(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text) => {
    const content = text ?? input
    if (!content.trim()) return
    const userMsg = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)

    if (listening) {
      stopSpeechRecognition()
      setListening(false)
    }

    const reply = await chatAPI.sendMessage(content, selectedLanguage)
    setTyping(false)
    setMessages((m) => [...m, reply])
  }

  const toggleMic = () => {
    if (listening) {
      stopSpeechRecognition()
      setListening(false)
    } else {
      setListening(true)
      startSpeechRecognition({
        lang: selectedLanguage,
        onResult: (transcript) => {
          setInput(transcript)
        },
        onError: (err) => {
          console.warn('Mic error:', err)
          setListening(false)
        },
        onEnd: () => {
          setListening(false)
        }
      })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto space-y-3">
      {/* Header bar: Language selector & PoP PDF Handbook button */}
      <div className="flex items-center justify-between gap-3 px-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> RAG Agronomist AI
          </span>
          <a
            href={chatAPI.getPoPPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-current/70 hover:text-[var(--color-primary)] flex items-center gap-1 underline transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Download PoP PDF Handbook
          </a>
        </div>

        {/* Language Selection Dropdown */}
        <div className="flex items-center gap-2 glass px-3 py-1 rounded-xl text-xs border border-current/10">
          <Globe className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
          <span className="font-semibold text-current/70">Lang:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent font-medium outline-none text-current cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.native}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Chat List */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            onRegenerate={() => send(m.content)}
            selectedLanguage={selectedLanguage}
          />
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs glass rounded-full px-3 py-1.5 hover:bg-current/10 text-left transition-colors border border-current/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Listening Banner */}
      {listening && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-semibold">
            <Mic className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>Listening to your voice... Speak your question in {SUPPORTED_LANGUAGES.find(l=>l.code===selectedLanguage)?.native || 'English'}</span>
          </div>
          <button onClick={toggleMic} className="px-2 py-0.5 rounded bg-red-500 text-white font-bold text-[11px]">
            Stop
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="glass rounded-2xl p-2 flex items-center gap-2 border border-current/10 shadow-sm"
      >
        <button type="button" className="p-2 rounded-xl hover:bg-current/5 text-current/50" title="Attach file">
          <Paperclip className="w-5 h-5" />
        </button>
        <button type="button" className="p-2 rounded-xl hover:bg-current/5 text-current/50" title="Attach leaf image">
          <ImageIcon className="w-5 h-5" />
        </button>
        
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about NPK fertilizer dose, pesticides, crop diseases, prices..."
          className="flex-1 bg-transparent outline-none text-sm px-1"
        />

        {/* Voice Input Button */}
        {isSpeechRecognitionSupported() && (
          <button
            type="button"
            onClick={toggleMic}
            title={listening ? "Stop microphone" : "Speak question (Voice Speech-to-Text)"}
            className={`p-2 rounded-xl transition-colors ${
              listening
                ? 'bg-red-500 text-white animate-pulse'
                : 'hover:bg-current/10 text-current/60 hover:text-[var(--color-primary)]'
            }`}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        <Button type="submit" size="sm" icon={Send} className="!px-4">Send</Button>
      </form>
    </div>
  )
}
