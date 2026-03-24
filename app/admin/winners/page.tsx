'use client'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Trophy, Check, X, Eye, Loader2, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchWinners = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/winners${statusFilter ? `?status=${statusFilter}` : ''}`)
    const d = await res.json()
    setWinners(d.data || [])
    setLoading(false)
  }
  useEffect(() => { fetchWinners() }, [statusFilter])

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'paid') => {
    setSubmitting(true)
    await fetch('/api/admin/winners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, admin_notes: notes }),
    })
    setReviewId(null); setNotes('')
    await fetchWinners()
    setSubmitting(false)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    verified: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-x-auto">
        <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><Trophy className="w-7 h-7 text-amber-400" /> Winner Management</h1>
        <p className="text-slate-500 mb-6">Review, approve, and mark payouts for prize winners</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'pending', 'verified', 'paid', 'rejected'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === s ? 'bg-[#0F1628] text-white border-[#0F1628]' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div> : (
            <div className="divide-y divide-slate-50">
              {winners.map((w) => (
                <div key={w.id} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[#0F1628]">{(w.users as any)?.full_name || 'Unknown'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[w.payment_status]}`}>{w.payment_status}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{(w.users as any)?.email}</p>
                      <p className="text-slate-500 text-sm mt-1">{w.match_count}-Number Match · Prize: <strong>£{(Number(w.prize_amount) / 100).toFixed(2)}</strong></p>
                      {w.admin_notes && <p className="text-red-500 text-xs mt-1">Notes: {w.admin_notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {w.proof_url && (
                        <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 p-2 border border-blue-200 rounded-lg transition-colors" title="View Proof">
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      {w.payment_status === 'pending' && (
                        <button onClick={() => setReviewId(w.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Review</button>
                      )}
                      {w.payment_status === 'verified' && (
                        <button onClick={() => handleAction(w.id, 'paid')} disabled={submitting}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Mark Paid</button>
                      )}
                    </div>
                  </div>

                  {/* Review Panel */}
                  {reviewId === w.id && (
                    <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-sm font-medium text-[#0F1628] mb-2">Admin Notes (optional)</p>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                        placeholder="Reason for rejection or any notes…"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber-500 transition-colors mb-3" />
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(w.id, 'approve')} disabled={submitting}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors">
                          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve
                        </button>
                        <button onClick={() => handleAction(w.id, 'reject')} disabled={submitting}
                          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button onClick={() => setReviewId(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-white transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!loading && winners.length === 0 && <div className="text-center py-12 text-slate-400">No winners found</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
