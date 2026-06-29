import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { api } from '../lib/api.js'
import { useToast } from '../App.jsx'

const fmt = (n) => '৳ ' + Number(n || 0).toLocaleString('bn-BD')
const today = () => new Date().toISOString().split('T')[0]

/* ─── Auth guard ─── */
function useAuth() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!localStorage.getItem('pharmacy_token')) navigate('/admin/login')
  }, [navigate])
}

/* ─── Opening Cash form ─── */
function OpeningCashForm({ date, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState({ opening_sale_cash: '', opening_purchase_cash: '', notes: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getDaily(date).then(d => {
      setForm({ opening_sale_cash: d.opening_sale_cash || '', opening_purchase_cash: d.opening_purchase_cash || '', notes: d.notes || '' })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [date])

  const save = async () => {
    try {
      await api.saveDaily({ record_date: date, ...form })
      toast('ওপেনিং ক্যাশ সেভ হয়েছে')
      onSaved()
    } catch (e) { toast(e.message, 'error') }
  }

  if (loading) return <div className="loading">লোড হচ্ছে...</div>

  return (
    <div className="card" style={{marginBottom:14}}>
      <div className="card-title">💼 ওপেনিং ক্যাশ ও নোট</div>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">সেল ক্যাশ — আগের ব্যালেন্স (৳)</label>
          <input className="form-input" type="number" placeholder="0" value={form.opening_sale_cash}
            onChange={e => setForm(f => ({...f, opening_sale_cash: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">ক্রয় ক্যাশ — আগের ব্যালেন্স (৳)</label>
          <input className="form-input" type="number" placeholder="0" value={form.opening_purchase_cash}
            onChange={e => setForm(f => ({...f, opening_purchase_cash: e.target.value}))} />
        </div>
        <div className="form-field full">
          <label className="form-label">নোট (ঐচ্ছিক)</label>
          <input className="form-input" type="text" placeholder="যেকোনো মন্তব্য..." value={form.notes}
            onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={save}>সেভ করুন</button>
      </div>
    </div>
  )
}

/* ─── Sale Entry form ─── */
function SaleForm({ date, onAdded }) {
  const toast = useToast()
  const EMPTY = { medicine_name: '', quantity: 1, original_price: '', discount: 0, notes: '' }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const actualPrice = parseFloat(form.original_price || 0) - parseFloat(form.discount || 0)
  const discountPct = form.original_price > 0 ? ((form.discount / form.original_price) * 100).toFixed(1) : 0

  const add = async () => {
    if (!form.medicine_name.trim()) return toast('ওষুধের নাম দিন', 'error')
    if (!form.original_price || form.original_price <= 0) return toast('মূল দাম দিন', 'error')
    if (actualPrice < 0) return toast('ডিসকাউন্ট মূল দামের বেশি হতে পারবে না', 'error')
    setSaving(true)
    try {
      await api.addSale({ sale_date: date, ...form })
      toast('সেল যোগ হয়েছে')
      setForm(EMPTY)
      onAdded()
    } catch (e) { toast(e.message, 'error') } finally { setSaving(false) }
  }

  return (
    <div className="card" style={{marginBottom:14}}>
      <div className="card-title">🧾 নতুন সেল এন্ট্রি</div>
      <div className="form-grid">
        <div className="form-field full">
          <label className="form-label">ওষুধের নাম *</label>
          <input className="form-input" type="text" placeholder="যেমন: Napa 500mg" value={form.medicine_name}
            onChange={e => setForm(f => ({...f, medicine_name: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">পরিমাণ</label>
          <input className="form-input" type="number" min="1" value={form.quantity}
            onChange={e => setForm(f => ({...f, quantity: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">মূল দাম (৳) *</label>
          <input className="form-input" type="number" min="0" step="0.01" placeholder="যেমন: ১০৫" value={form.original_price}
            onChange={e => setForm(f => ({...f, original_price: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">ডিসকাউন্ট (৳)</label>
          <input className="form-input" type="number" min="0" step="0.01" placeholder="0" value={form.discount}
            onChange={e => setForm(f => ({...f, discount: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">নেওয়া দাম (৳)</label>
          <input className="form-input" type="number" value={actualPrice.toFixed(2)} readOnly
            style={{background:'#f8f8f8', color:'var(--green)', fontWeight:600}} />
        </div>
        {form.discount > 0 && (
          <div className="discount-info">
            ছাড়: {fmt(form.discount)} ({discountPct}%) — মূল {fmt(form.original_price)} → নেওয়া {fmt(actualPrice)}
          </div>
        )}
        <div className="form-field full">
          <label className="form-label">নোট (ঐচ্ছিক)</label>
          <input className="form-input" type="text" placeholder="কাস্টমারের নাম বা মন্তব্য" value={form.notes}
            onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={add} disabled={saving}>{saving ? 'যোগ হচ্ছে...' : 'সেল যোগ করুন'}</button>
        <button className="btn btn-ghost" onClick={() => setForm(EMPTY)}>রিসেট</button>
      </div>
    </div>
  )
}

/* ─── Expense Form ─── */
function ExpenseForm({ date, onAdded }) {
  const toast = useToast()
  const EMPTY = { category: 'staff', description: '', amount: '', cash_type: 'sale_cash' }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const add = async () => {
    if (!form.description.trim()) return toast('বিবরণ দিন', 'error')
    if (!form.amount || form.amount <= 0) return toast('পরিমাণ দিন', 'error')
    setSaving(true)
    try {
      await api.addExpense({ expense_date: date, ...form })
      toast('খরচ যোগ হয়েছে')
      setForm(EMPTY)
      onAdded()
    } catch (e) { toast(e.message, 'error') } finally { setSaving(false) }
  }

  return (
    <div className="card" style={{marginBottom:14}}>
      <div className="card-title">💸 নতুন খরচ এন্ট্রি</div>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">ধরন</label>
          <select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
            <option value="staff">স্টাফ</option>
            <option value="utility">ইউটিলিটি</option>
            <option value="purchase">ক্রয় সংক্রান্ত</option>
            <option value="other">অন্যান্য</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">ক্যাশ থেকে</label>
          <select className="form-select" value={form.cash_type} onChange={e => setForm(f => ({...f, cash_type: e.target.value}))}>
            <option value="sale_cash">সেল ক্যাশ</option>
            <option value="purchase_cash">ক্রয় ক্যাশ</option>
          </select>
        </div>
        <div className="form-field full">
          <label className="form-label">বিবরণ *</label>
          <input className="form-input" type="text" placeholder="যেমন: রহিমের বেতন অগ্রিম" value={form.description}
            onChange={e => setForm(f => ({...f, description: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">পরিমাণ (৳) *</label>
          <input className="form-input" type="number" min="0" placeholder="0" value={form.amount}
            onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={add} disabled={saving}>{saving ? 'যোগ হচ্ছে...' : 'খরচ যোগ করুন'}</button>
        <button className="btn btn-ghost" onClick={() => setForm(EMPTY)}>রিসেট</button>
      </div>
    </div>
  )
}

/* ─── Purchase Form ─── */
function PurchaseForm({ date, onAdded }) {
  const toast = useToast()
  const EMPTY = { medicine_name: '', quantity: 1, unit_price: '', supplier: '', notes: '' }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const total = (parseFloat(form.quantity || 1) * parseFloat(form.unit_price || 0)).toFixed(2)

  const add = async () => {
    if (!form.medicine_name.trim()) return toast('ওষুধের নাম দিন', 'error')
    if (!form.unit_price || form.unit_price <= 0) return toast('দাম দিন', 'error')
    setSaving(true)
    try {
      await api.addPurchase({ purchase_date: date, ...form })
      toast('ক্রয় যোগ হয়েছে')
      setForm(EMPTY)
      onAdded()
    } catch (e) { toast(e.message, 'error') } finally { setSaving(false) }
  }

  return (
    <div className="card" style={{marginBottom:14}}>
      <div className="card-title">🛒 নতুন ক্রয় এন্ট্রি</div>
      <div className="form-grid">
        <div className="form-field full">
          <label className="form-label">ওষুধের নাম *</label>
          <input className="form-input" type="text" placeholder="যেমন: Napa 500mg" value={form.medicine_name}
            onChange={e => setForm(f => ({...f, medicine_name: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">পরিমাণ</label>
          <input className="form-input" type="number" min="1" value={form.quantity}
            onChange={e => setForm(f => ({...f, quantity: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">একক দাম (৳) *</label>
          <input className="form-input" type="number" min="0" step="0.01" placeholder="0" value={form.unit_price}
            onChange={e => setForm(f => ({...f, unit_price: e.target.value}))} />
        </div>
        <div className="form-field">
          <label className="form-label">মোট দাম (৳)</label>
          <input className="form-input" value={total} readOnly style={{background:'#f8f8f8', color:'var(--red)', fontWeight:600}} />
        </div>
        <div className="form-field">
          <label className="form-label">সাপ্লায়ার (ঐচ্ছিক)</label>
          <input className="form-input" type="text" placeholder="কোম্পানির নাম" value={form.supplier}
            onChange={e => setForm(f => ({...f, supplier: e.target.value}))} />
        </div>
        <div className="form-field full">
          <label className="form-label">নোট (ঐচ্ছিক)</label>
          <input className="form-input" type="text" placeholder="অতিরিক্ত তথ্য" value={form.notes}
            onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={add} disabled={saving}>{saving ? 'যোগ হচ্ছে...' : 'ক্রয় যোগ করুন'}</button>
        <button className="btn btn-ghost" onClick={() => setForm(EMPTY)}>রিসেট</button>
      </div>
    </div>
  )
}

/* ─── Lists with delete ─── */
function AdminSalesList({ date, refresh }) {
  const toast = useToast()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api.getSales(date).then(setSales).catch(() => setSales([])).finally(() => setLoading(false))
  }, [date])

  useEffect(() => { load() }, [load, refresh])

  const del = async (id) => {
    if (!confirm('এই সেল মুছে ফেলবেন?')) return
    try { await api.deleteSale(id); toast('মুছে ফেলা হয়েছে'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  if (loading) return <div className="loading">লোড হচ্ছে...</div>
  if (!sales.length) return <div className="empty">এই দিনের কোনো সেল নেই</div>

  return (
    <div className="list">
      {sales.map(s => (
        <div className="list-row" key={s.id}>
          <div style={{flex:1}}>
            <div className="list-name">{s.medicine_name} × {s.quantity}</div>
            {s.notes && <div className="list-meta">{s.notes}</div>}
          </div>
          <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3}}>
            {s.discount > 0 && <span className="badge badge-discount">ছাড় {fmt(s.discount)}</span>}
            <span className="list-amount green">{fmt(s.actual_price)}</span>
            {s.discount > 0 && <span className="list-meta" style={{textDecoration:'line-through'}}>{fmt(s.original_price)}</span>}
          </div>
          <button className="btn btn-danger btn-sm" style={{marginLeft:8}} onClick={() => del(s.id)}>মুছুন</button>
        </div>
      ))}
    </div>
  )
}

function AdminExpensesList({ date, refresh }) {
  const toast = useToast()
  const [expenses, setExpenses] = useState([])
  const catLabel = { staff: 'স্টাফ', utility: 'ইউটিলিটি', purchase: 'ক্রয়', other: 'অন্যান্য' }
  const catClass = { staff: 'badge-staff', utility: 'badge-utility', purchase: 'badge-purchase', other: 'badge-other' }

  const load = useCallback(() => {
    api.getExpenses(date).then(setExpenses).catch(() => setExpenses([]))
  }, [date])

  useEffect(() => { load() }, [load, refresh])

  const del = async (id) => {
    if (!confirm('এই খরচ মুছে ফেলবেন?')) return
    try { await api.deleteExpense(id); toast('মুছে ফেলা হয়েছে'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  if (!expenses.length) return <div className="empty">এই দিনের কোনো খরচ নেই</div>
  return (
    <div className="list">
      {expenses.map(e => (
        <div className="list-row" key={e.id}>
          <div style={{flex:1}}>
            <div className="list-name">{e.description}</div>
            <div className="list-meta">{e.cash_type === 'sale_cash' ? 'সেল ক্যাশ' : 'ক্রয় ক্যাশ'}</div>
          </div>
          <span className={`badge ${catClass[e.category]}`}>{catLabel[e.category]}</span>
          <span className="list-amount red" style={{marginLeft:8}}>{fmt(e.amount)}</span>
          <button className="btn btn-danger btn-sm" style={{marginLeft:8}} onClick={() => del(e.id)}>মুছুন</button>
        </div>
      ))}
    </div>
  )
}

function AdminPurchasesList({ date, refresh }) {
  const toast = useToast()
  const [purchases, setPurchases] = useState([])

  const load = useCallback(() => {
    api.getPurchases(date).then(setPurchases).catch(() => setPurchases([]))
  }, [date])

  useEffect(() => { load() }, [load, refresh])

  const del = async (id) => {
    if (!confirm('এই ক্রয় মুছে ফেলবেন?')) return
    try { await api.deletePurchase(id); toast('মুছে ফেলা হয়েছে'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  if (!purchases.length) return <div className="empty">এই দিনের কোনো ক্রয় নেই</div>
  return (
    <div className="list">
      {purchases.map(p => (
        <div className="list-row" key={p.id}>
          <div style={{flex:1}}>
            <div className="list-name">{p.medicine_name}</div>
            <div className="list-meta">{p.quantity} × {fmt(p.unit_price)} {p.supplier && `· ${p.supplier}`}</div>
          </div>
          <span className="list-amount red">{fmt(p.total_amount)}</span>
          <button className="btn btn-danger btn-sm" style={{marginLeft:8}} onClick={() => del(p.id)}>মুছুন</button>
        </div>
      ))}
    </div>
  )
}

/* ─── Summary ─── */
function AdminSummary({ date, refresh }) {
  const [s, setS] = useState(null)
  const load = useCallback(() => {
    api.getSummary(date).then(setS).catch(() => setS(null))
  }, [date])
  useEffect(() => { load() }, [load, refresh])

  if (!s) return null
  return (
    <div className="cards-grid">
      <div className="card metric">
        <div className="metric-label">আজকের সেল</div>
        <div className="metric-value green">{fmt(s.total_sales)}</div>
        <div className="metric-sub">{s.sale_count} টি বিক্রয়</div>
      </div>
      <div className="card metric">
        <div className="metric-label">সেল ক্যাশ (বর্তমান)</div>
        <div className="metric-value">{fmt(s.current_sale_cash)}</div>
        <div className="metric-sub">আগের: {fmt(s.opening_sale_cash)}</div>
      </div>
      <div className="card metric">
        <div className="metric-label">ক্রয় ক্যাশ (বর্তমান)</div>
        <div className="metric-value">{fmt(s.current_purchase_cash)}</div>
        <div className="metric-sub">আগের: {fmt(s.opening_purchase_cash)}</div>
      </div>
      <div className="card metric">
        <div className="metric-label">মোট ডিসকাউন্ট</div>
        <div className="metric-value red">{fmt(s.total_discount)}</div>
        <div className="metric-sub">খরচ: {fmt(s.sale_expenses)}</div>
      </div>
    </div>
  )
}

/* ─── Main Admin Dashboard ─── */
export default function AdminDashboard() {
  useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('opening')
  const [date, setDate] = useState(today())
  const [refresh, setRefresh] = useState(0)
  const bump = () => setRefresh(r => r + 1)
  const username = localStorage.getItem('pharmacy_user') || 'admin'

  const logout = () => {
    localStorage.removeItem('pharmacy_token')
    localStorage.removeItem('pharmacy_user')
    navigate('/admin/login')
  }

  const tabs = [
    { id: 'opening', label: '📋 ওপেনিং' },
    { id: 'sale', label: '🧾 সেল' },
    { id: 'expense', label: '💸 খরচ' },
    { id: 'purchase', label: '🛒 ক্রয়' },
  ]

  return (
    <div className="app-shell">
      <Header rightSlot={
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:12, opacity:0.8}}>{username}</span>
          <button className="btn btn-ghost btn-sm" style={{background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)'}} onClick={logout}>লগআউট</button>
        </div>
      } />

      <nav className="nav">
        {tabs.map(t => (
          <button key={t.id} className={`nav-link ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
        <button className="nav-link" style={{marginLeft:'auto', color:'var(--green)'}} onClick={() => navigate('/')}>পাবলিক ভিউ →</button>
      </nav>

      <main className="main">
        {/* Date bar */}
        <div className="date-bar">
          <label>তারিখ:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <button className="today-btn" onClick={() => setDate(today())}>আজকের</button>
        </div>

        {/* Summary always visible */}
        <AdminSummary date={date} refresh={refresh} />

        {tab === 'opening' && (
          <OpeningCashForm date={date} onSaved={bump} />
        )}

        {tab === 'sale' && (
          <>
            <SaleForm date={date} onAdded={bump} />
            <div className="card">
              <div className="card-title">🧾 আজকের সেল তালিকা</div>
              <AdminSalesList date={date} refresh={refresh} />
            </div>
          </>
        )}

        {tab === 'expense' && (
          <>
            <ExpenseForm date={date} onAdded={bump} />
            <div className="card">
              <div className="card-title">💸 আজকের খরচ তালিকা</div>
              <AdminExpensesList date={date} refresh={refresh} />
            </div>
          </>
        )}

        {tab === 'purchase' && (
          <>
            <PurchaseForm date={date} onAdded={bump} />
            <div className="card">
              <div className="card-title">🛒 আজকের ক্রয় তালিকা</div>
              <AdminPurchasesList date={date} refresh={refresh} />
            </div>
          </>
        )}
      </main>

      <footer className="footer">Developed by Alamgir Hossain</footer>
    </div>
  )
}
