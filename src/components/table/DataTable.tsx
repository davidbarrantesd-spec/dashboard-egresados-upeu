import React, { useState, useMemo } from 'react'
import { Download, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Egresado } from '../../types'
import { SITUACION_COLORS } from '../../utils/dataProcessor'

interface Props { data: Egresado[] }

type SortKey = 'nombreCompleto' | 'facultad' | 'sede' | 'anioEgreso' | 'situacionActual' | 'empresaActual'
type SortDir = 'asc' | 'desc'

const PAGE_SIZES = [20, 50, 100]

function exportCSV(data: Egresado[]) {
  const cols: (keyof Egresado)[] = [
    'nombreCompleto', 'sexo', 'facultad', 'sede', 'anioIngreso', 'anioEgreso',
    'situacionActual', 'empresaActual', 'cargoActual', 'correo', 'celular', 'pais',
  ]
  const headers = [
    'Nombre Completo', 'Género', 'Facultad', 'Campus', 'Año Ingreso', 'Año Egreso',
    'Situación', 'Empresa', 'Cargo', 'Correo', 'Celular', 'País',
  ]
  const rows = data.map((e) =>
    cols.map((c) => {
      const v = e[c]
      const s = v == null ? '' : String(v)
      return `"${s.replace(/"/g, '""')}"`
    }).join(',')
  )
  const csv = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `egresados_upeu_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const SortIcon = ({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) => {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 text-slate-400" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-600" />
    : <ChevronDown className="w-3 h-3 text-blue-600" />
}

export default function DataTable({ data }: Props) {
  const [sortKey, setSortKey]   = useState<SortKey>('nombreCompleto')
  const [sortDir, setSortDir]   = useState<SortDir>('asc')
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), 'es', { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePagedSlice = Math.min(page, totalPages)
  const start = (safePagedSlice - 1) * pageSize
  const pageData = sorted.slice(start, start + pageSize)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const Th = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer select-none hover:bg-slate-100 whitespace-nowrap"
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </div>
    </th>
  )

  const situBadge = (sit: string) => {
    const color = SITUACION_COLORS[sit] ?? '#94a3b8'
    return (
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
        style={{ background: color }}
      >
        {sit}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Detalle de egresados</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mostrando {start + 1}–{Math.min(start + pageSize, sorted.length)} de {sorted.length.toLocaleString()} registros
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} por página</option>)}
          </select>
          <button
            onClick={() => exportCSV(sorted)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 w-8">#</th>
              <Th col="nombreCompleto" label="Nombre" />
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap">Género</th>
              <Th col="facultad" label="Facultad" />
              <Th col="sede" label="Campus" />
              <Th col="anioEgreso" label="Egreso" />
              <Th col="situacionActual" label="Situación" />
              <Th col="empresaActual" label="Empresa" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                  No se encontraron egresados con los filtros aplicados.
                </td>
              </tr>
            ) : (
              pageData.map((e, i) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-slate-400">{start + i + 1}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-slate-800 text-xs leading-tight">
                      {e.nombreCompleto || '—'}
                    </p>
                    {e.correo && <p className="text-xs text-slate-400 truncate max-w-[160px]">{e.correo}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                    {e.sexo === 'No especificado' ? '—' : e.sexo}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-700 max-w-[160px]">
                    <span className="truncate block" title={e.facultad}>
                      {e.facultad !== 'No especificado' ? e.facultad.replace('Facultad de ', '') : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                    {e.sede !== 'No especificado' ? e.sede : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 text-center">
                    {e.anioEgreso ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {e.situacionActual !== 'No especificado' ? situBadge(e.situacionActual) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-700 max-w-[180px]">
                    <span className="truncate block" title={e.empresaActual}>
                      {e.empresaActual || '—'}
                    </span>
                    {e.cargoActual && (
                      <span className="text-xs text-slate-400 truncate block" title={e.cargoActual}>
                        {e.cargoActual}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Página {safePagedSlice} de {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={page <= 1}
            className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-slate-100"
          >«</button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1 border rounded disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs border rounded ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-slate-100'}`}
              >{p}</button>
            )
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1 border rounded disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-slate-100"
          >»</button>
        </div>
      </div>
    </div>
  )
}
