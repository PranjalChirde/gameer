'use client'
import { useState, useEffect } from 'react'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import { Trophy, Upload, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { DrawResult } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function WinsPage() {
  const [wins, setWins] = useState<DrawResult[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/winners').then(r => r.json()).then(d => { setWins(d.data || []); setLoading(false) })
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, resultId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingId(resultId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const fileName = `${user.id}/${resultId}-${Date.now()}.${file.name.split('.').pop()}`
    const { data: uploadData, error } = await supabase.storage.from('proofs').upload(fileName, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); setUploadingId(null); return }
    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName)
    await fetch(`/api/winners/${resultId}/proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof_url: publicUrl }),
    })
    const res = await fetch('/api/winners')
    const d = await res.json()
    setWins(d.data || [])
    setUploadingId(null)
  }

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Proof Required' },
    verified: { icon: CheckCircle, color: 'text-blue-600 bg-blue-50', label: 'Under Review' },
    paid: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Paid!' },
    rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Rejected' },
  }

  const totalWon = wins.filter(w => w.payment_status === 'paid').reduce((s, w) => s + Number(w.prize_amount), 0)

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><Trophy className="w-7 h-7 text-amber-400" /> My Winnings</h1>
        <p className="text-slate-500 mb-8">Your draw results and prize history</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs mb-1">Total Wins</p>
            <p className="text-2xl font-bold text-[#0F1628]">{wins.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs mb-1">Total Paid Out</p>
            <p className="text-2xl font-bold text-[#0F1628]">£{(totalWon / 100).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{wins.filter(w => w.payment_status === 'pending').length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold text-[#0F1628]">Win History</h2></div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : wins.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No wins yet — you need scores to participate in draws!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {wins.map((win) => {
                const sc = statusConfig[win.payment_status] || statusConfig.pending
                const StatusIcon = sc.icon
                return (
                  <div key={win.id} className="px-6 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#0F1628] text-lg">{win.match_count}-Number Match</span>
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />{sc.label}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Matched: [{win.matched_numbers?.join(', ')}]
                        </p>
                        {win.admin_notes && (
                          <p className="text-red-500 text-xs mt-1">Note: {win.admin_notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#0F1628]">£{(Number(win.prize_amount) / 100).toFixed(2)}</p>
                        {win.payment_status === 'pending' && (
                          <label className="mt-2 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all">
                            {uploadingId === win.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            Upload Proof
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, win.id)} disabled={uploadingId === win.id} />
                          </label>
                        )}
                        {win.proof_url && (
                          <a href={win.proof_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-blue-500 hover:underline">View proof</a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
