'use client'
import { useState } from 'react'
import { Heart, Loader2, Check } from 'lucide-react'
import { Charity } from '@/types'
import { createClient } from '@/lib/supabase/client'

export default function CharitySettingsClient({
  userData, charities, totalContrib,
}: {
  userData: any; charities: Charity[]; totalContrib: number
}) {
  const [selectedId, setSelectedId] = useState<string>(userData?.selected_charity_id || '')
  const [percent, setPercent] = useState<number>(userData?.charity_contribution_percent || 10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ selected_charity_id: selectedId, charity_contribution_percent: percent }).eq('id', userData.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><Heart className="w-7 h-7 text-pink-500" /> Charity Settings</h1>
      <p className="text-slate-500 mb-8">Choose which charity receives your contribution each month.</p>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <p className="text-slate-500 text-sm mb-1">Total contributed to date</p>
        <p className="text-4xl font-black text-[#0F1628]">£{(totalContrib / 100).toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <h2 className="font-semibold text-[#0F1628] mb-4">Your Charity</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {charities.map((c) => (
            <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedId === c.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center gap-3">
                {c.image_url && <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F1628] font-semibold text-sm">{c.name}</p>
                  <p className="text-slate-400 text-xs line-clamp-1">{c.description}</p>
                </div>
                {selectedId === c.id && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <h2 className="font-semibold text-[#0F1628] mb-2">Contribution Percentage</h2>
        <p className="text-slate-400 text-sm mb-4">What percentage of your subscription goes to your charity?</p>
        <div className="flex items-center gap-4">
          <input type="range" min={10} max={100} step={5} value={percent} onChange={(e) => setPercent(Number(e.target.value))}
            className="flex-1 accent-amber-500" />
          <span className="text-2xl font-black text-[#0F1628] w-16 text-right">{percent}%</span>
        </div>
        <p className="text-slate-400 text-xs mt-2">Minimum 10%. The rest contributes to the prize draw pool.</p>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0F1628] font-bold px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
      </button>
    </>
  )
}
