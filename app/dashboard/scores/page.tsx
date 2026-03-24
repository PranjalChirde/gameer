'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import { Target, Plus, Pencil, Trash2, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { Score } from '@/types'
import { formatDateShort } from '@/lib/utils'

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ score: '', played_on: new Date().toISOString().split('T')[0] })
  const [editForm, setEditForm] = useState({ score: '', played_on: '' })

  const fetchScores = async () => {
    const res = await fetch('/api/scores')
    const data = await res.json()
    setScores(data.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchScores() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const scoreVal = parseInt(form.score)
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) { setError('Score must be between 1 and 45'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: scoreVal, played_on: form.played_on }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    setForm({ score: '', played_on: new Date().toISOString().split('T')[0] })
    await fetchScores()
    setSubmitting(false)
  }

  const handleEdit = async (id: string) => {
    const scoreVal = parseInt(editForm.score)
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) { setError('Score must be between 1 and 45'); return }
    setSubmitting(true)
    const res = await fetch(`/api/scores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: scoreVal, played_on: editForm.played_on }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    setEditId(null)
    await fetchScores()
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this score?')) return
    await fetch(`/api/scores/${id}`, { method: 'DELETE' })
    await fetchScores()
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><Target className="w-7 h-7 text-amber-500" /> My Scores</h1>
        <p className="text-slate-500 mb-8">Enter up to 5 Stableford scores (1–45). Your latest 5 are used in monthly draws.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* Add Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="font-semibold text-[#0F1628] mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-amber-500" /> Add Score</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-slate-600 text-xs font-medium mb-1">Date Played</label>
              <input type="date" required value={form.played_on}
                onChange={(e) => setForm({ ...form, played_on: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F1628] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm" />
            </div>
            <div className="w-40">
              <label className="block text-slate-600 text-xs font-medium mb-1">Score (1–45)</label>
              <input type="number" min={1} max={45} required placeholder="e.g. 32"
                value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F1628] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={submitting || scores.length >= 5}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0F1628] font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </div>
          </form>
          {scores.length >= 5 && (
            <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Max 5 scores reached. Adding a new score will remove the oldest.
            </p>
          )}
        </div>

        {/* Score History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-[#0F1628]">Score History ({scores.length}/5)</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No scores yet. Add your first score above.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {scores.map((score, i) => (
                <div key={score.id} className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-[#0F1628]' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</div>
                  {editId === score.id ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input type="date" value={editForm.played_on} onChange={(e) => setEditForm({ ...editForm, played_on: e.target.value })}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500" />
                      <input type="number" min={1} max={45} value={editForm.score} onChange={(e) => setEditForm({ ...editForm, score: e.target.value })}
                        className="w-20 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500" />
                      <button onClick={() => handleEdit(score.id)} disabled={submitting} className="text-green-600 hover:text-green-700 p-1.5"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600 p-1.5"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-[#0F1628] font-semibold">{formatDateShort(score.played_on)}</p>
                      </div>
                      <span className="text-2xl font-black text-[#0F1628]">{score.score}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => { setEditId(score.id); setEditForm({ score: String(score.score), played_on: score.played_on }) }}
                          className="text-slate-400 hover:text-amber-600 p-1.5 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(score.id)} className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
