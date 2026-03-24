'use client'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Users, Search, Loader2, ChevronLeft, ChevronRight, Shield, ShieldOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`)
    const data = await res.json()
    setUsers(data.data || [])
    setTotal(data.count || 0)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [search, page])

  const toggleAdmin = async (userId: string, current: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates: { is_admin: !current } }),
    })
    fetchUsers()
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-x-auto">
        <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><Users className="w-7 h-7 text-blue-500" /> User Management</h1>
        <p className="text-slate-500 mb-6">{total} total users</p>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Plan', 'Status', 'Joined', 'Admin', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" /></td></tr>
              ) : users.map((u) => {
                const sub = u.subscriptions?.[0]
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0F1628]">{u.full_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{sub?.plan || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {sub?.status || 'no sub'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {u.is_admin ? <span className="text-amber-600 font-medium text-xs">Admin</span> : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAdmin(u.id, u.is_admin)} title={u.is_admin ? 'Remove admin' : 'Make admin'}
                        className="text-slate-400 hover:text-amber-600 transition-colors p-1">
                        {u.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
