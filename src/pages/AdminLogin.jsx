import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useToast } from '../App.jsx'

export default function AdminLogin() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.username || !form.password) return toast('Username ও password দিন', 'error')
    setLoading(true)
    try {
      const res = await api.login(form)
      localStorage.setItem('pharmacy_token', res.token)
      localStorage.setItem('pharmacy_user', res.username)
      toast('লগইন সফল হয়েছে')
      navigate('/admin')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="cross">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <h2>মন্ডল ফার্মেসী</h2>
          <p>এডমিন প্যানেল — উলিপুর, কুড়িগ্রাম</p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <div className="form-field">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="admin" value={form.username}
              onChange={e => setForm(f => ({...f, username: e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button className="btn btn-primary" style={{marginTop:4, justifyContent:'center'}}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
          <button className="btn btn-ghost" style={{justifyContent:'center'}} onClick={() => navigate('/')}>
            ← পাবলিক ভিউতে ফিরুন
          </button>
        </div>
      </div>
    </div>
  )
}
