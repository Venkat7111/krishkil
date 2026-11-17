import { useState, useEffect } from 'react'
import { Droplets, CalendarDays, CloudRain, Sparkles, Calculator, CheckCircle2, Loader2 } from 'lucide-react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { weatherAPI } from '@/services/api/weatherAPI'

const WEEK = [
  { day: 'Mon', status: 'done', note: 'Applied 10mm' },
  { day: 'Tue', status: 'skip', note: 'High Soil Moisture' },
  { day: 'Wed', status: 'done', note: 'Applied 12mm' },
  { day: 'Thu', status: 'upcoming', note: 'Scheduled (Check Rain)' },
  { day: 'Fri', status: 'none', note: 'Rest Period' },
  { day: 'Sat', status: 'upcoming', note: 'Scheduled 10mm' },
  { day: 'Sun', status: 'none', note: 'Rest Period' },
]

const STYLES = {
  done: 'bg-[var(--color-secondary)]/15 border-l-4 border-l-[var(--color-secondary)] text-current',
  upcoming: 'bg-[var(--color-primary)]/15 border-l-4 border-l-[var(--color-primary)] text-current',
  skip: 'bg-red-500/15 border-l-4 border-l-red-500 text-current',
  none: 'bg-current/5 text-current/50',
}

export default function Irrigation() {
  const [crop, setCrop] = useState('Cotton')
  const [stage, setStage] = useState('Flowering Stage')
  const [soilType, setSoilType] = useState('Black Cotton Soil')
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState({
    waterMm: 40.0,
    frequencyDays: 7.1,
    advice: 'ML Model predicted 40.0mm water requirement over a 7.1-day watering cycle for Cotton during Flowering Stage in Black Cotton Soil.'
  })

  const calculateIrrigation = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const res = await weatherAPI.predictIrrigation({
        crop,
        growth_stage: stage,
        soil_type: soilType,
        avg_temp_c: 28.0,
        rain_probability_pct: 30.0,
        humidity_pct: 60.0
      })
      if (res) {
        setCalculated({
          waterMm: res.water_requirement_mm,
          frequencyDays: res.irrigation_interval_days,
          advice: res.advice
        })
      }
    } catch (err) {
      console.warn('Irrigation ML model prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    calculateIrrigation()
  }, [crop, stage, soilType])


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Droplets className="w-6 h-6 text-[var(--color-secondary)]" /> Smart Irrigation Advisory
        </h1>
        <p className="text-current/60 text-sm mt-1">
          Calculate crop-specific water requirements and generate optimal weekly watering schedules.
        </p>
      </div>

      {/* Interactive Water Requirement Calculator */}
      <Card leaf>
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[var(--color-primary)]" /> Crop Water Requirement Calculator
        </h3>
        <form onSubmit={calculateIrrigation} className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-current/70">Select Crop:</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-current/15 text-sm bg-transparent"
            >
              <option value="Cotton" className="bg-slate-900 text-white">Cotton</option>
              <option value="Rice (Paddy)" className="bg-slate-900 text-white">Rice (Paddy)</option>
              <option value="Tomato" className="bg-slate-900 text-white">Tomato</option>
              <option value="Maize" className="bg-slate-900 text-white">Maize</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-current/70">Growth Stage:</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-current/15 text-sm bg-transparent"
            >
              <option value="Flowering Stage" className="bg-slate-900 text-white">Flowering Stage</option>
              <option value="Vegetative Stage" className="bg-slate-900 text-white">Vegetative Stage</option>
              <option value="Yield/Fruit Formation" className="bg-slate-900 text-white">Yield / Fruit Formation</option>
              <option value="Ripening Stage" className="bg-slate-900 text-white">Ripening Stage</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-current/70">Soil Type:</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-current/15 text-sm bg-transparent"
            >
              <option value="Black Cotton Soil" className="bg-slate-900 text-white">Black Cotton Soil</option>
              <option value="Red Loamy Soil" className="bg-slate-900 text-white">Red Loamy Soil</option>
              <option value="Alluvial Soil" className="bg-slate-900 text-white">Alluvial Soil</option>
              <option value="Sandy Soil" className="bg-slate-900 text-white">Sandy Soil</option>
            </select>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" size="sm" icon={Calculator} loading={loading}>
              Calculate Water Demand (ML Model)
            </Button>
          </div>
        </form>
      </Card>


      <div className="grid sm:grid-cols-3 gap-4">
        <Card leaf className="text-center">
          <Droplets className="w-8 h-8 text-[var(--color-secondary)] mx-auto mb-2" />
          <p className="text-2xl font-display font-bold">{calculated.waterMm} mm</p>
          <p className="text-sm text-current/60">Weekly Water Requirement ({crop})</p>
        </Card>
        <Card leaf className="text-center">
          <CalendarDays className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-2" />
          <p className="text-2xl font-display font-bold">Every {calculated.frequencyDays} Days</p>
          <p className="text-sm text-current/60">Recommended Watering Interval</p>
        </Card>
        <Card leaf className="text-center">
          <CloudRain className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-2" />
          <p className="text-2xl font-display font-bold">60%</p>
          <p className="text-sm text-current/60">Rain Probability Thursday</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-display font-semibold mb-4">Weekly Irrigation Schedule & Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {WEEK.map((d) => (
            <div key={d.day} className={`rounded-xl p-3 text-xs font-medium space-y-1 ${STYLES[d.status]}`}>
              <p className="font-bold text-sm">{d.day}</p>
              <p className="capitalize text-[11px] font-semibold">{d.status}</p>
              <p className="text-[10px] opacity-75">{d.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex items-start gap-3 border-l-4 border-l-[var(--color-accent)]">
        <Sparkles className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div>
          <h3 className="font-display font-semibold mb-1">Agronomist Recommendation</h3>
          <p className="text-sm text-current/80">
            {calculated.advice}
          </p>
        </div>
      </Card>
    </div>
  )
}

