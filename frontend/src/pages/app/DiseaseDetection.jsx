import { useState, useRef, useEffect } from 'react'
import { Download, Camera, AlertCircle, RefreshCw, Sparkles, FileText, Globe, CheckCircle2, Loader2 } from 'lucide-react'
import UploadDropzone from '@/components/common/UploadDropzone'
import PredictionCard from '@/components/cards/PredictionCard'
import Button from '@/components/common/Button'
import { diseaseAPI } from '@/services/api/diseaseAPI'
import { SUPPORTED_LANGUAGES, translateDiseaseResult } from '@/utils/translation'

const SAMPLE_LEAVES = [
  {
    name: 'Tomato Early Blight',
    filename: 'tomato_early_blight.jpg',
    svgColor: '#78350f',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2315803d"/><path d="M150,30 C200,80 270,120 250,220 C230,280 150,270 150,270 C150,270 70,280 50,220 C30,120 100,80 150,30 Z" fill="%2322c55e"/><circle cx="120" cy="140" r="24" fill="%2378350f"/><circle cx="120" cy="140" r="14" fill="%23f59e0b"/><circle cx="180" cy="190" r="30" fill="%2378350f"/><circle cx="180" cy="190" r="18" fill="%23d97706"/><circle cx="140" cy="210" r="18" fill="%2378350f"/></svg>'
  },
  {
    name: 'Corn Rust',
    filename: 'corn_rust.jpg',
    svgColor: '#b45309',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23166534"/><path d="M150,20 C180,90 220,180 200,270 C170,280 130,280 100,270 C80,180 120,90 150,20 Z" fill="%234ade80"/><ellipse cx="140" cy="100" rx="10" ry="25" fill="%23b45309"/><ellipse cx="160" cy="160" rx="12" ry="30" fill="%23b45309"/><ellipse cx="130" cy="200" rx="8" ry="20" fill="%23b45309"/></svg>'
  },
  {
    name: 'Healthy Leaf',
    filename: 'healthy_leaf.jpg',
    svgColor: '#16a34a',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23052e16"/><path d="M150,20 C220,70 260,150 240,240 C200,280 100,280 60,240 C40,150 80,70 150,20 Z" fill="%2322c55e"/><path d="M150,30 L150,270 M150,90 L210,60 M150,130 L90,100 M150,170 L210,140 M150,210 L90,180" stroke="%2386efac" stroke-width="4" stroke-linecap="round"/></svg>'
  }
]

const AI_STEPS = [
  { id: 'upload', label: 'Image received & validated', done: true },
  { id: 'crop', label: 'Detecting crop type...' },
  { id: 'symptoms', label: 'Identifying visible symptoms...' },
  { id: 'compare', label: 'Comparing with 38 disease classes...' },
  { id: 'treatment', label: 'Generating treatment plan...' },
]

function AnalysisLoader({ stepIndex }) {
  return (
    <div className="p-6 rounded-2xl bg-current/5 border border-current/10 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-[var(--color-primary)]/10">
          <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
        </div>
        <div>
          <p className="font-bold text-sm">🔍 AI Analysis in Progress</p>
          <p className="text-xs text-current/50 mt-0.5">Please wait while the model processes your leaf image...</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {AI_STEPS.map((step, i) => {
          const isDone = i < stepIndex || step.done
          const isActive = i === stepIndex && !step.done
          return (
            <div key={step.id} className={`flex items-center gap-2.5 text-sm transition-opacity duration-300 ${
              isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-35'
            }`}>
              <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-[var(--color-primary)] animate-spin" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-current/20" />
                )}
              </span>
              <span className={isDone ? 'text-emerald-600 dark:text-emerald-400 font-medium' : isActive ? 'font-semibold' : 'text-current/40'}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DiseaseDetection() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadStep, setLoadStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const cameraInputRef = useRef(null)
  const stepTimerRef = useRef(null)

  // Advance loading animation steps
  useEffect(() => {
    if (loading) {
      setLoadStep(1)
      const delays = [800, 1800, 2800, 3600]
      const timers = delays.map((delay, i) =>
        setTimeout(() => setLoadStep(i + 2), delay)
      )
      stepTimerRef.current = timers
    } else {
      setLoadStep(0)
      if (stepTimerRef.current) {
        stepTimerRef.current.forEach(clearTimeout)
        stepTimerRef.current = null
      }
    }
    return () => {
      if (stepTimerRef.current) {
        stepTimerRef.current.forEach(clearTimeout)
      }
    }
  }, [loading])

  const analyze = async (targetFile = file) => {
    const f = targetFile || file
    if (!f) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await diseaseAPI.analyzeImage(f)
      setResult(res)
    } catch (err) {
      console.error('Disease detection error:', err)
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to complete leaf image analysis. Please ensure the image is clear and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCameraCapture = (e) => {
    const capturedFile = e.target.files?.[0]
    if (capturedFile) {
      setFile(capturedFile)
      analyze(capturedFile)
    }
  }

  const loadSample = async (sample) => {
    try {
      const resp = await fetch(sample.dataUrl)
      const blob = await resp.blob()
      const sampleFile = new File([blob], sample.filename, { type: 'image/jpeg' })
      setFile(sampleFile)
      analyze(sampleFile)
    } catch (e) {
      console.error('Failed to load sample leaf:', e)
    }
  }

  const translatedResult = result ? translateDiseaseResult(result, selectedLanguage) : null

  const downloadReport = () => {
    if (!translatedResult) return
    const content = `KRISHISAHAY PLANT DISEASE DIAGNOSIS REPORT (${selectedLanguage.toUpperCase()})
------------------------------------------------
Crop: ${translatedResult.crop}
Diagnosis: ${translatedResult.disease}
Confidence: ${translatedResult.confidence}%
Severity: ${translatedResult.severity}
Model Used: ${translatedResult.model_used || 'AI Plant Disease Model'}

DETECTED SYMPTOMS:
${translatedResult.symptoms || 'Visual leaf discoloration and spot patterns.'}

RECOMMENDED TREATMENT:
${translatedResult.treatment?.map((t) => `- ${t}`).join('\n') || '- None'}

PREVENTION STEPS:
${translatedResult.prevention?.map((p) => `- ${p}`).join('\n') || '- None'}

CANDIDATE SUGGESTIONS (Same Crop):
${translatedResult.suggestions?.map((s) => `- ${s.crop} ${s.disease} (${s.confidence}%)`).join('\n') || 'None'}

⚠ DISCLAIMER: AI prediction only. Please consult a local agricultural expert for confirmation before applying pesticides.

Generated on ${new Date().toLocaleDateString()} via KrishiSahay AI Assistant.
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `KrishiSahay_Report_${translatedResult.crop}_${translatedResult.disease.replace(/\s+/g, '_')}_${selectedLanguage}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPdfReport = () => {
    if (!translatedResult) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KrishiSahay Report - ${translatedResult.crop} (${translatedResult.disease})</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
            .header { border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #16a34a; letter-spacing: -0.5px; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
            .card { padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
            .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            .section { margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
            .sec-title { font-size: 13px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 10px; }
            ul { margin: 0; padding-left: 20px; }
            li { margin-bottom: 8px; font-size: 14px; line-height: 1.5; color: #334155; }
            .disclaimer { margin-top: 24px; padding: 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; font-size: 13px; color: #92400e; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🌱 KRISHISAHAY PLANT DIAGNOSIS REPORT</div>
            <div class="subtitle">Official AI Vision & Plant Pathology Advisory • Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="grid">
            <div class="card"><div class="label">Crop Name</div><div class="val">${translatedResult.crop}</div></div>
            <div class="card"><div class="label">Diagnosis Status</div><div class="val">${translatedResult.disease}</div></div>
            <div class="card"><div class="label">AI Confidence</div><div class="val">${translatedResult.confidence}%</div></div>
            <div class="card"><div class="label">Severity Level</div><div class="val">${translatedResult.severity}</div></div>
          </div>
          <div class="section">
            <div class="sec-title">Detected Leaf Symptoms</div>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">${translatedResult.symptoms || 'Visual leaf discoloration or spots detected.'}</p>
          </div>
          <div class="section">
            <div class="sec-title">Immediate Treatment</div>
            <ul>${translatedResult.treatment?.map((t) => `<li>${t}</li>`).join('') || '<li>No immediate chemical treatment required.</li>'}</ul>
          </div>
          <div class="section">
            <div class="sec-title">Long-term Prevention</div>
            <ul>${translatedResult.prevention?.map((p) => `<li>${p}</li>`).join('') || '<li>Maintain standard field hygiene and soil health.</li>'}</ul>
          </div>
          <div class="disclaimer">
            ⚠ <strong>AI Disclaimer:</strong> This prediction is generated by an AI model and may not always be accurate.
            Please consult your local agricultural expert or Krishi Vigyan Kendra before applying pesticides or treatments.
          </div>
          <div class="footer">
            Generated via KrishiSahay AI Assistant • Model: ${translatedResult.model_used || 'AI Plant Disease Model'} • Language: ${selectedLanguage.toUpperCase()}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header & Multi-Language Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-bold">Plant Disease Detection</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Hugging Face & Gemini AI
            </span>
          </div>
          <p className="text-current/60 text-sm mt-1">
            Upload or capture a leaf photo to diagnose diseases, receive verified treatments, listen to voice reports, and translate diagnosis results.
          </p>
        </div>

        {/* Language Selection */}
        <div className="flex items-center gap-2 bg-current/5 border border-current/10 px-3 py-1.5 rounded-xl text-xs">
          <Globe className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
          <span className="font-semibold text-current/70">Language Translation:</span>
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

      {/* Dropzone & Preview */}
      <UploadDropzone
        file={file}
        onFileAccepted={(f) => {
          setFile(f)
          setResult(null)
          setError(null)
        }}
      />

      {/* Hidden Camera Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          type="button"
          icon={Camera}
          variant="outline"
          className="flex-1"
          onClick={() => cameraInputRef.current?.click()}
        >
          Take Photo
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!file || loading}
          loading={loading}
          onClick={() => analyze()}
        >
          Analyze Leaf
        </Button>
      </div>

      {/* Sample Leaf Chips for Quick Testing */}
      <div className="p-4 rounded-2xl bg-current/5 border border-current/10 space-y-2">
        <p className="text-xs font-semibold text-current/60 uppercase tracking-wider">
          Don't have a leaf photo ready? Try a sample leaf:
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_LEAVES.map((sample, i) => (
            <button
              key={i}
              onClick={() => loadSample(sample)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-current/15 text-xs font-medium bg-current/5 hover:bg-current/10 transition-colors flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sample.svgColor }} />
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-xs opacity-90 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => analyze()}
            className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Multi-Step Loading Animation */}
      {loading && <AnalysisLoader stepIndex={loadStep} />}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <PredictionCard
            result={result}
            file={file}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
          <div className="flex gap-3 justify-end flex-wrap">
            <Button variant="outline" icon={FileText} onClick={downloadReport}>
              Download Summary (.txt)
            </Button>
            <Button variant="primary" icon={Download} onClick={downloadPdfReport}>
              Download PDF Diagnosis Report (.pdf)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
