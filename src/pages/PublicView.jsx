import React, { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header.jsx'
import { api } from '../lib/api.js'
import { useNavigate } from 'react-router-dom'

const fmt = (n) => '৳ ' + Number(n || 0).toLocaleString('bn-BD', { minimumFractionDigits: 0 })
const today = () => new Date().toISOString().split('T')[0]
const banglaDate = (d) => {
  const [y, m, mo] = d.split('-')
  const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
  return `${parseInt(mo)} ${months[parseInt(m)-1]} ${y}`
}

function SummaryCards({ s }) {
  return (
    <div className="cards-grid">
      <div className="card metric">
        <div className="metric-label">আজকের মোট সেল</div>
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

function CashDetail({ s }) {
  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title green">💰 সেল ক্যাশ</div>
        <div className="cash-row"><span>আগের ব্যালেন্স</span><span>{fmt(s.opening_sale_cash)}</span></div>
        <div className="cash-row"><span>+ আজকের সেল</span><span className="green">{fmt(s.total_sales)}</span></div>
        <div className="cash-row"><span>− খরচ</span><span className="red">{fmt(s.sale_expenses)}</span></div>
        <div className="cash-row cash-total"><span>= বর্তমান ব্যালেন্স</span><span>{fmt(s.current_sale_cash)}</span></div>
      </div>
      <div className="card">
        <div className="card-title blue">🛒 ক্রয় ক্যাশ</div>
        <div className="cash-row"><span>আগের ব্যালেন্স</span><span>{fmt(s.opening_purchase_cash)}</span></div>
        <div className="cash-row"><span>− ওষুধ ক্রয়</span><span className="red">{fmt(s.purchase_total)}</span></div>
        <div className="cash-row"><span>− অন্য খরচ</span><span className="red">{fmt(s.purchase_expenses)}</span></div>
        <div className="cash-row cash-total"><span>= বর্তমান ব্যালেন্স</span><span>{fmt(s.current_purchase_cash)}</span></div>
      </div>
    </div>
  )
}

function SalesList({ date }) {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getSales(date).then(setSales).catch(() => setSales([])).finally(() => setLoading(false))
  }, [date])

  if (loading) return <div className="loading">লোড হচ্ছে...</div>
  if (!sales.length) return <div className="empty">এই দিনের কোনো সেল নেই</div>

  return (
    <div className="list">
      {sales.map(s => (
        <div className="list-row" key={s.id}>
          <div>
            <div className="list-name">{s.medicine_name}</div>
            <div className="list-meta">পরিমাণ: {s.quantity} {s.notes && `· ${s.notes}`}</div>
          </div>
          <div style={{textAlign:'right'}}>
            {s.discount > 0 && (
              <div className="badge badge-discount" style={{marginBottom:3}}>ছাড় {fmt(s.discount)}</div>
            )}
            <div className="list-amount green">{fmt(s.actual_price)}</div>
            {s.discount > 0 && <div className="list-meta" style={{textDecoration:'line-through'}}>{fmt(s.original_price)}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExpensesList({ date }) {
  const [expenses, setExpenses] = useState([])
  useEffect(() => {
    api.getExpenses(date).then(setExpenses).catch(() => setExpenses([]))
  }, [date])

  const catLabel = { staff: 'স্টাফ', utility: 'ইউটিলিটি', purchase: 'ক্রয়', other: 'অন্যান্য' }
  const catClass = { staff: 'badge-staff', utility: 'badge-utility', purchase: 'badge-purchase', other: 'badge-other' }

  if (!expenses.length) return <div className="empty">এই দিনের কোনো খরচ নেই</div>
  return (
    <div className="list">
      {expenses.map(e => (
        <div className="list-row" key={e.id}>
          <div>
            <div className="list-name">{e.description}</div>
            <div className="list-meta">{e.cash_type === 'sale_cash' ? 'সেল ক্যাশ' : 'ক্রয় ক্যাশ'}</div>
          </div>
          <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
            <span className={`badge ${catClass[e.category]}`}>{catLabel[e.category]}</span>
            <span className="list-amount red">{fmt(e.amount)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function PurchasesList({ date }) {
  const [purchases, setPurchases] = useState([])
  useEffect(() => {
    api.getPurchases(date).then(setPurchases).catch(() => setPurchases([]))
  }, [date])

  if (!purchases.length) return <div className="empty">এই দিনের কোনো ক্রয় নেই</div>
  return (
    <div className="list">
      {purchases.map(p => (
        <div className="list-row" key={p.id}>
          <div>
            <div className="list-name">{p.medicine_name}</div>
            <div className="list-meta">পরিমাণ: {p.quantity} × {fmt(p.unit_price)} {p.supplier && `· ${p.supplier}`}</div>
          </div>
          <div className="list-amount red">{fmt(p.total_amount)}</div>
        </div>
      ))}
    </div>
  )
}

function ReportTable({ from, to }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getReport(from, to).then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [from, to])

  if (loading) return <div className="loading">রিপোর্ট লোড হচ্ছে...</div>
  if (!data || !data.rows.length) return <div className="empty">এই সময়কালে কোনো ডেটা নেই</div>

  const fmt2 = (n) => '৳' + Number(n || 0).toLocaleString('bn-BD')

  return (
    <div style={{overflowX:'auto'}}>
      <table className="report-table">
        <thead>
          <tr>
            <th>তারিখ</th>
            <th>মোট সেল</th>
            <th>ডিসকাউন্ট</th>
            <th>খরচ</th>
            <th>ক্রয়</th>
            <th>সেল ক্যাশ</th>
            <th>ক্রয় ক্যাশ</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map(r => (
            <tr key={r.date}>
              <td>{banglaDate(r.date)}</td>
              <td className="green">{fmt2(r.total_sales)}</td>
              <td className="red">{fmt2(r.total_discount)}</td>
              <td className="red">{fmt2(r.sale_expenses)}</td>
              <td className="red">{fmt2(r.total_purchase)}</td>
              <td>{fmt2(r.closing_sale_cash)}</td>
              <td>{fmt2(r.closing_purchase_cash)}</td>
            </tr>
          ))}
          <tr className="report-total">
            <td>মোট</td>
            <td>{fmt2(data.totals.total_sales)}</td>
            <td>{fmt2(data.totals.total_discount)}</td>
            <td>{fmt2(data.totals.sale_expenses)}</td>
            <td>{fmt2(data.totals.total_purchase)}</td>
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function PublicView() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [date, setDate] = useState(today())
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportFrom, setReportFrom] = useState(new Date().toISOString().slice(0,7) + '-01')
  const [reportTo, setReportTo] = useState(today())

  const loadSummary = useCallback(() => {
    setLoading(true)
    api.getSummary(date).then(setSummary).catch(() => setSummary(null)).finally(() => setLoading(false))
  }, [date])

  useEffect(() => { loadSummary() }, [loadSummary])

  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড' },
    { id: 'sales', label: 'সেল তালিকা' },
    { id: 'expenses', label: 'খরচ' },
    { id: 'purchases', label: 'ক্রয়' },
    { id: 'report', label: 'রিপোর্ট' },
  ]

  return (
    <div className="app-shell">
      <Header rightSlot={
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/login')}>এডমিন</button>
      } />
      <nav className="nav">
        {tabs.map(t => (
          <button key={t.id} className={`nav-link ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>

      <main className="main">
        {/* Date picker — shown on all tabs except report */}
        {tab !== 'report' && (
          <div className="date-bar">
            <label>তারিখ বেছে নিন:</label>
            <input type="date" value={date} max={today()} onChange={e => setDate(e.target.value)} />
            <button className="today-btn" onClick={() => setDate(today())}>আজকের</button>
            <span style={{marginLeft:'auto', fontSize:12, color:'var(--text-3)'}}>
              {banglaDate(date)}
            </span>
          </div>
        )}

        {tab === 'dashboard' && (
          loading ? <div className="loading">লোড হচ্ছে...</div> :
          !summary ? <div className="empty">ডেটা পাওয়া যায়নি</div> : (
            <>
              <SummaryCards s={summary} />
              <CashDetail s={summary} />
              {summary.notes && (
                <div className="card" style={{marginBottom:14}}>
                  <div className="card-title">📝 নোট</div>
                  <p style={{fontSize:13, color:'var(--text-2)'}}>{summary.notes}</p>
                </div>
              )}
            </>
          )
        )}

        {tab === 'sales' && (
          <div className="card">
            <div className="card-title">🧾 সেল তালিকা</div>
            <SalesList date={date} />
          </div>
        )}

        {tab === 'expenses' && (
          <div className="card">
            <div className="card-title">💸 খরচ তালিকা</div>
            <ExpensesList date={date} />
          </div>
        )}

        {tab === 'purchases' && (
          <div className="card">
            <div className="card-title">🛒 ওষুধ ক্রয় তালিকা</div>
            <PurchasesList date={date} />
          </div>
        )}

        {tab === 'report' && (
          <div className="card">
            <div className="card-title">📊 তারিখ ভিত্তিক রিপোর্ট</div>
            <div className="date-bar" style={{border:'none', padding:'0 0 12px', background:'transparent'}}>
              <label>শুরু:</label>
              <input type="date" value={reportFrom} onChange={e => setReportFrom(e.target.value)} />
              <label>শেষ:</label>
              <input type="date" value={reportTo} max={today()} onChange={e => setReportTo(e.target.value)} />
            </div>
            <ReportTable from={reportFrom} to={reportTo} />
          </div>
        )}
      </main>

      <footer className="footer">Developed by Alamgir Hossain</footer>
    </div>
  )
}
