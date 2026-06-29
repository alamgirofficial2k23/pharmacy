import React from 'react'

export default function Header({ rightSlot }) {
  return (
    <div className="header">
      <div className="header-brand">
        <div className="icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </div>
        <div>
          <h1>মন্ডল ফার্মেসী</h1>
          <p>উলিপুর, কুড়িগ্রাম</p>
        </div>
      </div>
      <div className="header-right">{rightSlot}</div>
    </div>
  )
}
