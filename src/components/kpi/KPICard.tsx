import React from 'react'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo' | 'teal'
  trend?: { value: string; positive?: boolean }
  large?: boolean
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   value: 'text-blue-700',   border: 'border-blue-100' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',  value: 'text-green-700',  border: 'border-green-100' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  value: 'text-amber-700',  border: 'border-amber-100' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',      value: 'text-red-700',    border: 'border-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600',value: 'text-purple-700', border: 'border-purple-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600',value: 'text-indigo-700', border: 'border-indigo-100' },
  teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-100 text-teal-600',    value: 'text-teal-700',   border: 'border-teal-100' },
}

export default function KPICard({ title, value, subtitle, icon, color = 'blue', trend, large }: Props) {
  const c = colorMap[color]
  return (
    <div className={`${c.bg} rounded-xl p-4 border ${c.border} flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">{title}</p>
        <div className={`${c.icon} p-2 rounded-lg flex-shrink-0`}>
          {icon}
        </div>
      </div>

      <div>
        <p className={`${large ? 'text-4xl' : 'text-3xl'} font-extrabold ${c.value} leading-none`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className={`text-xs font-medium px-2 py-1 rounded-full self-start ${trend.positive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend.value}
        </div>
      )}
    </div>
  )
}
