import { useEffect, useState } from 'react'
import { FileBarChart2, Download, Share2, Mail, Plus } from 'lucide-react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { reportAPI } from '@/services/api/reportAPI'
import { useToast } from '@/components/common/Toast'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [generating, setGenerating] = useState(false)
  const { showToast } = useToast()

  useEffect(() => { reportAPI.getPrevious().then(setReports) }, [])

  const generate = async () => {
    setGenerating(true)
    const r = await reportAPI.generate('Farm Summary')
    setReports((prev) => [{ id: r.id, title: 'Farm Summary Report', date: new Date().toISOString().slice(0, 10) }, ...prev])
    setGenerating(false)
    showToast('Report generated', 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Reports</h1>
        <Button icon={Plus} loading={generating} onClick={generate}>Generate Report</Button>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileBarChart2 className="w-8 h-8 text-[var(--color-primary)]" />
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-current/50">{r.date}</p>
              </div>
            </div>
            <div className="flex gap-1 text-current/50">
              <a href={reportAPI.downloadUrl(r.id)} target="_blank" rel="noreferrer" className="p-2 hover:bg-current/5 rounded-lg"><Download className="w-4 h-4" /></a>
              <button className="p-2 hover:bg-current/5 rounded-lg"><Share2 className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-current/5 rounded-lg"><Mail className="w-4 h-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
