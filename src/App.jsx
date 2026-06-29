import React, { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import PublicView from './pages/PublicView.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export const ToastContext = createContext(null)

export function useToast() { return useContext(ToastContext) }

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return <div className={`toast ${type}`}>{msg}</div>
}

export default function App() {
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => setToast({ msg, type })

  return (
    <ToastContext.Provider value={showToast}>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </ToastContext.Provider>
  )
}
