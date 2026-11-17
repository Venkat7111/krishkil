import { useState } from 'react'
import {
  ShieldAlert, ShieldCheck, Sprout, Activity, Lightbulb,
  MessageSquare, CheckCircle2, HelpCircle, Volume2, VolumeX,
  AlertTriangle, Info, Camera, ImageIcon, Sun, Layers
} from 'lucide-react'
import Card from '@/components/common/Card'
import { translateDiseaseResult } from '@/utils/translation'
import { speakText, stopSpeech } from '@/utils/speech'

// ─── Confidence tier helpers ────────────────────────────────────────────────

function getConfidenceTier(confidence) {
  if (confidence >= 90) return 'high'
  if (confidence >= 70) return 'medium'
  if (confidence >= 50) return 'low'
  return 'very-low'
}

function ConfidenceIndicator({ confidence, isHealthy }) {
  const tier = getConfidenceTier(confidence)

  const configs = {
    high: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      label: '🟢 High Confidence',
      desc: 'AI is highly confident in this prediction.',
    },
    medium: {
      color: 'text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      label: '🟡 Medium Confidence',
      desc: 'Prediction is likely accurate. Consider confirming with an expert.',
    },
    low: {
      color: 'text-orange-600 dark:text-orange-400',
      bar: 'bg-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      label: '🟠 Low Confidence',
      desc: 'Model is uncertain. Try uploading a clearer image.',
    },
    'very-low': {
      color: 'text-red-600 dark:text-red-400',
      bar: 'bg-red-500',
      bg: 'bg-red-500/10 border-red-500/20',
      label: '🔴 Very Low Confidence',
      desc: 'Model cannot confidently identify the disease.',
    },
  }

  const cfg = isHealthy
    ? { ...configs.high, label: '🟢 Healthy Leaf', desc: 'No disease symptoms detected.' }
    : configs[tier]

  return (
    <div className={`px-3 py-2 rounded-xl border text-xs ${cfg.bg} space-y-1.5`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`font-bold ${cfg.color}`}>{cfg.label}</span>
        <span className={`font-mono font-extrabold text-base ${cfg.color}`}>{confidence}%</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-current/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${Math.min(100, Math.max(2, confidence))}%` }}
        />
      </div>
      <p className="text-current/60">{cfg.desc}</p>
    </div>
  )
}

// ─── Severity badge ─────────────────────────────────────────────────────────

function SeverityBadge({ severity, healthy }) {
  if (healthy) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" /> Healthy
      </span>
    )
  }
  const s = (severity || '').toLowerCase()
  if (s.includes('severe')) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
        <ShieldAlert className="w-3.5 h-3.5" /> Severe
      </span>
    )
  }
  if (s.includes('moderate')) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
        <ShieldAlert className="w-3.5 h-3.5" /> Moderate
      </span>
    )
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
      <ShieldAlert className="w-3.5 h-3.5" /> Mild
    </span>
  )
}

// ─── Low confidence warning panel ───────────────────────────────────────────

function LowConfidencePanel({ result, suggestions }) {
  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-700 dark:text-red-400 text-sm">⚠ Low Confidence Prediction</p>
          <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">
            The AI could not confidently identify the disease ({result.confidence}% confidence).
            A diagnosis is not shown to avoid misleading results.
          </p>
        </div>
      </div>

      {/* Possible matches */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-current/60 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-500" /> Possible Matches ({result.crop})
          </p>
          <div className="space-y-1.5">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-current/5 border border-current/10 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">{i === 0 ? '1️⃣' : i === 1 ? '2️⃣' : '3️⃣'}</span>
                  <span className="font-medium">{s.crop} {s.disease}</span>
                </div>
                <span className="font-mono font-bold text-current/50 text-xs">{s.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo tips */}
      <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/20 space-y-3">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4 h-4" /> Please Upload a Better Photo
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { icon: ImageIcon, text: 'One leaf only in the frame' },
            { icon: Sun, text: 'Bright, natural lighting' },
            { icon: Layers, text: 'Plain background (no clutter)' },
            { icon: Camera, text: 'Close-up showing the disease area' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Symptom tag list ────────────────────────────────────────────────────────

function SymptomList({ symptoms }) {
  if (!symptoms) return null

  // Split into individual symptoms on periods, semicolons, or line breaks
  const items = symptoms
    .split(/[.;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)

  if (items.length === 0) {
    return <p className="text-sm text-current/70">{symptoms}</p>
  }

  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-current/80">{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Main PredictionCard ─────────────────────────────────────────────────────

export default function PredictionCard({ result, file, selectedLanguage = 'en', onLanguageChange }) {
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [speaking, setSpeaking] = useState(false)

  if (!result) return null

  const translatedRaw = translateDiseaseResult(result, selectedLanguage)
  const activeDiagnosis = selectedDisease
    ? translateDiseaseResult(selectedDisease, selectedLanguage)
    : translatedRaw
  const isHealthy = activeDiagnosis.disease?.toLowerCase().includes('healthy')
  const confidence = activeDiagnosis.confidence || 0
  const confidenceTier = getConfidenceTier(confidence)
  const isVeryLow = confidenceTier === 'very-low' && !isHealthy

  const imageSrc = typeof file === 'string'
    ? file
    : file instanceof File || file instanceof Blob
    ? URL.createObjectURL(file)
    : null

  const handleSpeakDiagnosis = () => {
    if (speaking) {
      stopSpeech()
      setSpeaking(false)
    } else {
      setSpeaking(true)
      const speechText = isVeryLow
        ? `Low confidence prediction for ${activeDiagnosis.crop}. The AI could not confidently identify the disease. Please upload a clearer image.`
        : `Diagnosis for ${activeDiagnosis.crop}: ${activeDiagnosis.disease}. Confidence: ${confidence}%. Severity is ${activeDiagnosis.severity}. Recommended treatment: ${activeDiagnosis.treatment?.join(', ')}`
      speakText(speechText, selectedLanguage, () => setSpeaking(false))
    }
  }

  return (
    <Card leaf className="space-y-5">

      {/* ── Header: Crop + Image + Confidence ── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 border-b border-current/10">
        {/* Left: Image + disease title */}
        <div className="flex items-start gap-3 flex-1">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Analyzed Leaf"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md shrink-0"
            />
          ) : (
            <div className={`p-3 rounded-2xl ${isHealthy ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
              {isHealthy ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {/* Crop name */}
            <p className="text-xs text-current/50 font-semibold uppercase tracking-wider mb-1">
              Detected Crop
            </p>
            <p className="font-bold text-lg leading-tight">
              {activeDiagnosis.crop}
            </p>

            {/* Disease title — only shown when confidence >= 50% or healthy */}
            {!isVeryLow ? (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <h2 className="font-display text-base font-bold text-current">{activeDiagnosis.disease}</h2>
                <SeverityBadge severity={activeDiagnosis.severity} healthy={isHealthy} />
              </div>
            ) : (
              <p className="text-sm text-red-500 font-semibold mt-1">Disease uncertain — see below</p>
            )}

            {selectedDisease && (
              <button
                onClick={() => setSelectedDisease(null)}
                className="mt-1 text-xs text-[var(--color-primary)] underline font-medium"
              >
                Reset to main diagnosis
              </button>
            )}
          </div>
        </div>

        {/* Right: Confidence + voice */}
        <div className="flex flex-col gap-2 sm:items-end sm:min-w-[180px]">
          <ConfidenceIndicator confidence={confidence} isHealthy={isHealthy} />

          {/* Voice button */}
          <button
            onClick={handleSpeakDiagnosis}
            className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
              speaking
                ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
                : 'border-current/15 glass hover:bg-current/10 text-current'
            }`}
          >
            {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{speaking ? 'Stop Speech' : '🔊 Listen to Diagnosis'}</span>
          </button>
        </div>
      </div>

      {/* ── Low Confidence Panel (< 50%) ── */}
      {isVeryLow && (
        <LowConfidencePanel
          result={activeDiagnosis}
          suggestions={translatedRaw.suggestions}
        />
      )}

      {/* ── Detected Symptoms (shown only when confidence >= 50%) ── */}
      {!isVeryLow && activeDiagnosis.symptoms && (
        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-2">
          <p className="font-bold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Detected Symptoms
          </p>
          <SymptomList symptoms={activeDiagnosis.symptoms} />
          {/* Model info below symptoms */}
          {(result.model_used) && (
            <p className="text-xs text-current/35 pt-1 border-t border-current/10 mt-2">
              Model: {result.model_used}
            </p>
          )}
        </div>
      )}

      {/* ── Alternative Candidates (same-crop only, shown when confidence >= 50%) ── */}
      {!isVeryLow && translatedRaw.suggestions && translatedRaw.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-current/60 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Other {activeDiagnosis.crop} Diseases (Same Crop)
            </p>
            <span className="text-xs text-current/40">Click to preview</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {translatedRaw.suggestions.map((sug, i) => {
              const isSelected = selectedDisease?.disease === sug.disease
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDisease({
                    crop: sug.crop,
                    disease: sug.disease,
                    confidence: sug.confidence,
                    severity: activeDiagnosis.severity,
                    treatment: activeDiagnosis.treatment,
                    prevention: activeDiagnosis.prevention,
                    symptoms: activeDiagnosis.symptoms,
                  })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm'
                      : 'border-current/10 hover:border-current/30 hover:bg-current/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{sug.disease}</p>
                      <p className="text-xs text-current/50">{sug.crop}</p>
                    </div>
                  </div>
                  <span className="font-mono-data text-xs font-bold text-[var(--color-primary)]">{sug.confidence}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Treatment & Prevention (shown when confidence >= 50%) ── */}
      {!isVeryLow && (
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" /> Immediate Treatment
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-current/80">
              {activeDiagnosis.treatment && activeDiagnosis.treatment.length > 0 ? (
                activeDiagnosis.treatment.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))
              ) : (
                <li className="text-current/50 italic">No direct treatment required.</li>
              )}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-2">
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Long-term Prevention
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-current/80">
              {activeDiagnosis.prevention && activeDiagnosis.prevention.length > 0 ? (
                activeDiagnosis.prevention.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))
              ) : (
                <li className="text-current/50 italic">Maintain standard field hygiene.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* ── AI Disclaimer ── */}
      <div className="p-3.5 rounded-xl bg-yellow-500/8 border border-yellow-500/20 flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-yellow-700 dark:text-yellow-400">AI Prediction Only</p>
          <p className="text-yellow-700/80 dark:text-yellow-400/70">
            This result is generated by an AI model and may not always be accurate.
            Please consult a local agricultural expert or Krishi Vigyan Kendra before applying pesticides or treatments.
          </p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      {!isVeryLow && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-current/10 text-xs">
          <span className="text-current/60 font-medium">Recommended next steps for your farm:</span>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`/app/fertilizer?crop=${encodeURIComponent(result.crop)}`}
              className="px-3 py-1.5 rounded-xl border border-current/15 hover:bg-current/5 font-semibold text-current flex items-center gap-1.5 transition-colors"
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Fertilizer & PoP Plan
            </a>
            <a
              href={`/app/chat?query=${encodeURIComponent(`What is the recommended treatment schedule and pesticide dose for ${activeDiagnosis.disease} in ${activeDiagnosis.crop}?`)}`}
              className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Ask RAG AI Chat Advisor
            </a>
          </div>
        </div>
      )}
    </Card>
  )
}
