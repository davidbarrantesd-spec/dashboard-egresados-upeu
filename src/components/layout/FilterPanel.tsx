import React from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import type { FilterState, Egresado } from '../../types'

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
  data: Egresado[]
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean))).sort()
}

export default function FilterPanel({ filters, onChange, data }: Props) {
  const facultades  = uniq(data.map((e) => e.facultad).filter((f) => f !== 'No especificado'))
  const sedes       = uniq(data.map((e) => e.sede).filter((s) => s !== 'No especificado'))
  const anios       = uniq(data.map((e) => String(e.anioEgreso ?? '')).filter(Boolean)).sort().reverse()
  const situaciones = ['Trabajando', 'Emprendiendo', 'Buscando empleo', 'Estudiando', 'Otro']

  const set = (key: keyof FilterState, val: string) =>
    onChange({ ...filters, [key]: val })

  const hasFilters =
    filters.facultad || filters.sede || filters.anioEgreso ||
    filters.situacion || filters.sexo || filters.search

  const activeCount = [
    filters.facultad, filters.sede, filters.anioEgreso,
    filters.situacion, filters.sexo, filters.search,
  ].filter(Boolean).length

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Label */}
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mr-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar nombre, empresa…"
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
            />
          </div>

          {/* Facultad */}
          <select
            value={filters.facultad}
            onChange={(e) => set('facultad', e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] max-w-[220px]"
          >
            <option value="">Todas las facultades</option>
            {facultades.map((f) => (
              <option key={f} value={f}>
                {f.replace('Facultad de ', '').replace('Escuela General de ', 'Posgrado — ')}
              </option>
            ))}
          </select>

          {/* Sede */}
          <select
            value={filters.sede}
            onChange={(e) => set('sede', e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los campus</option>
            {sedes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Situación */}
          <select
            value={filters.situacion}
            onChange={(e) => set('situacion', e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Situación laboral</option>
            {situaciones.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Año de egreso */}
          <select
            value={filters.anioEgreso}
            onChange={(e) => set('anioEgreso', e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Año de egreso</option>
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Sexo */}
          <select
            value={filters.sexo}
            onChange={(e) => set('sexo', e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Género</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={() => onChange({ facultad: '', sede: '', anioEgreso: '', situacion: '', sexo: '', search: '' })}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
