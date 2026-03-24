'use client'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Dices, Play, Send, Loader2, CheckCircle, Clock, Eye } from 'lucide-react'
import { Draw } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [form, setForm] = useState({
    draw_month: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
    draw_type: 'random',
    weighting: 'most_frequent',
  })

  const fetchDraws = async () => {
    const res = await fetch('/api/admin/draws')
    const d = await res.json()
    setDraws(d.data || [])
    setLoading(false)
  }
  useEffect(() => { fetchDraws() }, [])

  const handleRunDraw = async () => {
    setRunning(true)
    setResult(null)
    const res = await fetch('/api/admin/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error); setRunning(false); return }
    setResult(data.data)
    await fetchDraws()
    setRunning(false)
  }

  const handlePublish = async (id: string) => {
    if (!confirm('Publish this draw? This will send emails to all participants.')) return
    const res = await fetch(`/api/admin/draws/${id}/publish`, { method: 'POST' })
    if (!res.ok) { const d = await res.json(); alert(d.error); return }
    await fetchDraws()
    setResult(null)
  }

  const statusBadge = (status: string) => ({
    pending: 'bg-slate-100 text-slate-600',
    simulated: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
  }[status] || 'bg-slate-100 text-slate-500')

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><Dices className="w-7 h-7 text-purple-500" /> Draw Management</h1>
        <p className="text-slate-500 mb-8">Create, simulate, and publish monthly prize draws</p>

        {/* Create draw form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h2 className="font-semibold text-[#0F1628] mb-4">Run New Draw</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1">Draw Month (first day)</label>
              <input type="date" value={form.draw_month} onChange={(e) => setForm({ ...form, draw_month: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1">Draw Mode</label>
              <select value={form.draw_type} onChange={(e) => setForm({ ...form, draw_type: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors">
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
            {form.draw_type === 'algorithmic' && (
              <div>
                <label className="block text-slate-600 text-xs font-medium mb-1">Weighting</label>
                <select value={form.weighting} onChange={(e) => setForm({ ...form, weighting: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors">
                  <option value="most_frequent">Most Frequent (more winners)</option>
                  <option value="least_frequent">Least Frequent (grow jackpot)</option>
                </select>
              </div>
            )}
          </div>
          <button onClick={handleRunDraw} disabled={running}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0F1628] font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running Simulation…' : 'Run Simulation'}
          </button>
        </div>

        {/* Simulation Result */}
        {result && (
          <div className="bg-[#0F1628] rounded-2xl p-6 mb-6 text-white">
            <h3 className="font-bold text-lg mb-4 text-amber-400">🎰 Simulation Results</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div><p className="text-slate-400 text-xs">Drawn Numbers</p>
                <p className="font-bold">[{result.drawnNumbers?.join(', ')}]</p></div>
              <div><p className="text-slate-400 text-xs">5-Match Winners</p>
                <p className="font-bold text-amber-400">{result.winners?.fiveMatch}</p></div>
              <div><p className="text-slate-400 text-xs">4-Match Winners</p>
                <p className="font-bold">{result.winners?.fourMatch}</p></div>
              <div><p className="text-slate-400 text-xs">3-Match Winners</p>
                <p className="font-bold">{result.winners?.threeMatch}</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5 text-sm">
              <div><p className="text-slate-400 text-xs">Total Participants</p><p className="font-semibold">{result.totalParticipants}</p></div>
              <div><p className="text-slate-400 text-xs">Prize Pool</p><p className="font-semibold text-amber-400">£{(result.pools?.total / 100).toFixed(2)}</p></div>
              <div><p className="text-slate-400 text-xs">5-Match Prize Each</p><p className="font-semibold">£{(result.prizes?.prize5 / 100).toFixed(2)}</p></div>
            </div>
            <button onClick={() => handlePublish(result.draw?.id)}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
              <Send className="w-4 h-4" /> Publish Draw & Send Emails
            </button>
          </div>
        )}

        {/* Draw History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold text-[#0F1628]">Draw History</h2></div>
          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div> : (
            <div className="divide-y divide-slate-50">
              {draws.map((draw) => (
                <div key={draw.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0F1628]">{formatDate(draw.draw_month)}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      [{draw.drawn_numbers?.join(', ') || 'Pending'}] · {draw.draw_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0F1628]">£{(Number(draw.prize_pool_total) / 100).toFixed(2)}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(draw.status)}`}>{draw.status}</span>
                  </div>
                  {draw.status === 'simulated' && (
                    <button onClick={() => handlePublish(draw.id)} className="text-green-600 hover:text-green-700 p-2 transition-colors" title="Publish">
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {draws.length === 0 && <div className="text-center py-12 text-slate-400">No draws yet</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
