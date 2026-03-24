import React from 'react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="gradient-amber" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="gradient-emerald" x1="32" y1="32" x2="8" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
        <filter id="soft-shadow" x="-4" y="-4" width="42" height="42" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Base giving/energy circle */}
      <circle cx="14" cy="14" r="12" fill="url(#gradient-amber)" filter="url(#soft-shadow)" />
      
      {/* Overlapping golf/green circle with transparency for a sleek interlocking tech effect */}
      <circle cx="20" cy="20" r="12" fill="url(#gradient-emerald)" fillOpacity="0.9" />
      
      {/* Abstract golf hole / flag pinhole to tie the concept together */}
      <circle cx="22" cy="22" r="3" fill="#ffffff" />
    </svg>
  )
}
