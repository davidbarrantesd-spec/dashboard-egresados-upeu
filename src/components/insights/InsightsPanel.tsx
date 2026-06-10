import React from 'react'
import type { Egresado } from '../../types'
import { generateInsights } from '../../utils/insights'
import { Lightbulb } from 'lucide-react'

interface Props { data: Egresado[] }

const typeStyles = {
  success:   'bg-green-50 border-green-200 text-green-800',
  warning:   'bg-amber-50 border-amber-200 text-amber-800',
  info:      'bg-blue-50 border-blue-200 text-blue-800',
  highlight: 'bg-indigo-50 border-indigo-200 text-indigo-800',
}

export default function InsightsPanel({ data }: Props) {
  const insights = generateInsights(data)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-semibold text-slate-800">Hallazgos principales e insights estratégicos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className={`rounded-xl border p-4 ${typeStyles[ins.type]} animate-fade-in-up`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{ins.icon}</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-snug">{ins.title}</p>
                <p className="text-xs mt-1 leading-relaxed opacity-80">{ins.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
