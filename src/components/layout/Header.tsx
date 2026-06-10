import React from 'react'
import { GraduationCap, BarChart3 } from 'lucide-react'

interface Props {
  totalRecords: number
}

export default function Header({ totalRecords }: Props) {
  return (
    <header className="bg-gradient-to-r from-upeu-950 via-upeu-900 to-upeu-800 text-white shadow-xl">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs text-blue-200">
          <span>Universidad Peruana Unión — Sistema de Seguimiento de Egresados</span>
          <span className="hidden sm:block">
            {totalRecords > 0 && (
              <span className="bg-blue-500/30 px-2 py-0.5 rounded-full">
                {totalRecords.toLocaleString()} registros cargados
              </span>
            )}
          </span>
        </div>

        {/* Main header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-400/30">
              <GraduationCap className="w-8 h-8 text-blue-300" />
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/20" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
              Dashboard de Egresados UPeU
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
              Análisis de actualización de datos, empleabilidad y caracterización de egresados
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
            <BarChart3 className="w-5 h-5 text-blue-300" />
            <div className="text-right">
              <p className="text-xs text-blue-300">Fuente de datos</p>
              <p className="text-sm font-semibold text-white">Quiz de Actualización 2025</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
