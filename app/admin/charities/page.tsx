'use client'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Heart, Plus, Pencil, Trash2, Star, StarOff, Loader2, X, Check } from 'lucide-react'
import { Charity } from '@/types'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCharity, setEditCharity] = useState<Charity | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', website: '', is_featured: false })

  const fetchCharities = async () => {
    const res = await fetch('/api/charities')
    const d = await res.json()
    setCharities(d.data || [])
    setLoading(false)
  }
  useEffect(() => { fetchCharities() }, [])

  const openAdd = () => { setForm({ name: '', slug: '', description: '', image_url: '', website: '', is_featured: false }); setEditCharity(null); setShowForm(true) }
  const openEdit = (c: Charity) => { setForm({ name: c.name, slug: c.slug || '', description: c.description, image_url: c.image_url || '', website: c.website || '', is_featured: c.is_featured }); setEditCharity(c); setShowForm(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    if (editCharity) {
      await fetch('/api/admin/charities', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editCharity.id, ...form }) })
    } else {
      await fetch('/api/admin/charities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setShowForm(false); await fetchCharities(); setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this charity?')) return
    await fetch('/api/admin/charities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchCharities()
  }

  const toggleFeatured = async (c: Charity) => {
    await fetch('/api/admin/charities', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, is_featured: !c.is_featured }) })
    fetchCharities()
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0F1628] flex items-center gap-3"><Heart className="w-7 h-7 text-pink-500" /> Charity Management</h1>
            <p className="text-slate-500 mt-1">Add, edit, and feature charities on the platform</p>
          </div>
          <button onClick={openAdd} className="bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all">
            <Plus className="w-4 h-4" /> Add Charity
          </button>
        </div>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {charities.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#0F1628]">{c.name}</h3>
                    {c.is_featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">Featured</span>}
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4">{c.description}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-amber-600 p-1.5 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => toggleFeatured(c)} title={c.is_featured ? 'Unfeature' : 'Feature'} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors">
                      {c.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-[#0F1628] text-xl">{editCharity ? 'Edit Charity' : 'Add Charity'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Name', key: 'name', type: 'text', required: true },
                  { label: 'Slug (URL)', key: 'slug', type: 'text', required: true },
                  { label: 'Image URL', key: 'image_url', type: 'url', required: false },
                  { label: 'Website', key: 'website', type: 'url', required: false },
                ].map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="block text-slate-600 text-sm font-medium mb-1">{label}</label>
                    <input type={type} required={required} value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">Description</label>
                  <textarea rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-amber-500" />
                  <span className="text-slate-600 text-sm">Feature on homepage</span>
                </label>
                <button type="submit" disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0F1628] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editCharity ? 'Save Changes' : 'Add Charity'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
