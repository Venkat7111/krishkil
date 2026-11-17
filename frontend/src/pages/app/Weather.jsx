import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { AlertTriangle, Wind, Mail, Send, CheckCircle2, CloudRain, PhoneCall } from 'lucide-react'
import WeatherCard from '@/components/cards/WeatherCard'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { weatherAPI } from '@/services/api/weatherAPI'
import { useToast } from '@/components/common/Toast'

export default function Weather() {
  const [current, setCurrent] = useState(null)
  const [hourly, setHourly] = useState([])
  const [weekly, setWeekly] = useState([])
  const [alerts, setAlerts] = useState([])
  
  const [sendingAlert, setSendingAlert] = useState(false)
  const [alertSuccess, setAlertSuccess] = useState(null)
  const [recipientEmail, setRecipientEmail] = useState('farmer.warangal@krishisahay.org')
  const [recipientPhone, setRecipientPhone] = useState('+919876543210')
  const [showAlertForm, setShowAlertForm] = useState(false)
  const toast = useToast()

  useEffect(() => {
    weatherAPI.getCurrent().then(setCurrent)
    weatherAPI.getHourly().then(setHourly)
    weatherAPI.getWeekly().then(setWeekly)
    weatherAPI.getAlerts().then(setAlerts)
  }, [])

  const handleSendRainAlert = async (e) => {
    e.preventDefault()
    setSendingAlert(true)
    setAlertSuccess(null)
    try {
      const maxRain = weekly.reduce((max, d) => Math.max(max, d.rain || 0), 60)
      const res = await weatherAPI.sendRainAlerts({
        recipient_email: recipientEmail,
        recipient_phone: recipientPhone,
        location: current?.location || 'Warangal',
        rain_probability: maxRain,
      })
      setAlertSuccess(res)
      toast.success('Rain alert successfully sent via SMTP Email & SMS!')
    } catch (err) {
      console.error('Failed to send rain alert:', err)
      toast.error('Could not send rain alert. Please check connection.')
    } finally {
      setSendingAlert(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CloudRain className="w-6 h-6 text-[var(--color-primary)]" /> Weather Intelligence & Alerts
          </h1>
          <p className="text-current/60 text-sm mt-1">Live forecasts, rain tracking, and automated farmer SMTP/SMS alerts.</p>
        </div>
        <Button
          variant={showAlertForm ? 'primary' : 'outline'}
          icon={Mail}
          onClick={() => setShowAlertForm(!showAlertForm)}
        >
          {showAlertForm ? 'Hide Alert Dispatcher' : 'Send Rain Alert to Farmers'}
        </Button>
      </div>

      {/* Rain Alert Dispatch Card */}
      {showAlertForm && (
        <Card leaf className="border-l-4 border-l-[var(--color-primary)] bg-[var(--color-primary)]/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--color-primary)]" /> Send Rain Warning Alert via SMTP & SMS
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
              Farmer Alert Dispatcher
            </span>
          </div>
          <p className="text-xs text-current/70 mb-4">
            Directly email (SMTP) and SMS notify registered farmers about impending rain to help them protect harvested crops, pause chemical spraying, and safeguard fields.
          </p>

          <form onSubmit={handleSendRainAlert} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-current/70">Farmer Email (SMTP):</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-current/15 text-sm bg-transparent"
                  placeholder="farmer@domain.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-current/70">Farmer Mobile (SMS):</label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-current/15 text-sm bg-transparent"
                  placeholder="+919876543210"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-current/60">
                Location: <strong>{current?.location || 'Warangal'}</strong> | Max Rain Risk: <strong>{weekly.reduce((max, d) => Math.max(max, d.rain || 0), 30)}%</strong>
              </span>
              <Button type="submit" icon={Send} loading={sendingAlert}>
                Dispatch Rain Alert
              </Button>
            </div>
          </form>

          {alertSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{alertSuccess.message}</span>
            </div>
          )}
        </Card>
      )}

      {alerts.map((a) => (
        <div key={a.id} className="flex items-center gap-2 bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/40 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 text-[var(--color-accent)]" /> {a.title}
        </div>
      ))}

      <div className="grid lg:grid-cols-3 gap-4">
        <WeatherCard data={current} />
        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-3">Hourly Forecast</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tempC" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="font-display font-semibold mb-3">7-Day Forecast & Precipitation Risk</h3>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 text-center">
          {weekly.map((d) => (
            <div key={d.day} className="rounded-xl bg-current/5 p-3">
              <p className="text-xs text-current/50">{d.day}</p>
              <p className="font-mono-data font-semibold mt-1">{d.high}°/{d.low}°</p>
              <p className="text-xs text-[var(--color-secondary)] font-medium mt-1">{d.rain}% rain</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-3">Humidity Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="humidity" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Wind className="w-4 h-4" /> Wind Speed</h3>
          <p className="font-mono-data text-3xl font-bold mt-4">{current?.windKph ?? '--'} km/h</p>
          <p className="text-sm text-current/60 mt-1">Light breeze, favorable for spraying</p>
        </Card>
      </div>
    </div>
  )
}

