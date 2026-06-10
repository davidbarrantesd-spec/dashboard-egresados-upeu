import React, { useState, useEffect, useMemo } from 'react'
import { BarChart3, Briefcase, Database, TableProperties, Lightbulb, Loader2 } from 'lucide-react'

import type { Egresado, FilterState } from './types'
import { loadEgresados, applyFilters } from './utils/dataProcessor'

import Header               from './components/layout/Header'
import FilterPanel          from './components/layout/FilterPanel'
import OverviewDashboard    from './components/dashboards/OverviewDashboard'
import EmploymentDashboard  from './components/dashboards/EmploymentDashboard'
import DataQualityDashboard from './components/dashboards/DataQualityDashboard'
import InsightsPanel        from './components/insights/InsightsPanel'
import DataTable            from './components/table/DataTable'

type TabId = 'overview' | 'employment' | 'quality' | 'insights' | 'table'

const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview',    label: 'Panorama general',      icon: BarChart3 },
  { id: 'employment',  label: 'Empleabilidad',          icon: Briefcase },
  { id: 'quality',     label: 'Calidad de datos',       icon: Database },
  { id: 'insights',    label: 'Insights estratégicos',  icon: Lightbulb },
  { id: 'table',       label: 'Tabla de detalle',       icon: TableProperties },
]

const EMPTY_FILTERS: FilterState = {
  facultad: '', sede: '', anioEgreso: '', situacion: '', sexo: '', search: '',
}

export default function App() {
  const [allData,   setAllData]   = useState<Egresado[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [filters,   setFilters]   = useState<FilterState>(EMPTY_FILTERS)

  useEffect(() => {
    loadEgresados()
      .then(setAllData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const filteredData = useMemo(
    () => applyFilters(allData, filters),
    [allData, filters],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando datos de egresados…</p>
          <p className="text-slate-400 text-sm mt-1">Procesando registros</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center shadow">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Error al cargar los datos</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header totalRecords={allData.length} />

      {/* Tab navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0" style={{ scrollbarWidth: 'none' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                    active
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
                  ].join(' ')}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <FilterPanel filters={filters} onChange={setFilters} data={allData} />

      {hasFilters && (
        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 flex items-center gap-2">
            <span className="font-semibold">Filtros activos:</span>
            <span>
              Mostrando {filteredData.length.toLocaleString()} de {allData.length.toLocaleString()} egresados
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview'    && <OverviewDashboard    data={filteredData} />}
        {activeTab === 'employment'  && <EmploymentDashboard  data={filteredData} />}
        {activeTab === 'quality'     && <DataQualityDashboard data={filteredData} />}
        {activeTab === 'insights'    && <InsightsPanel        data={filteredData} />}
        {activeTab === 'table'       && <DataTable            data={filteredData} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-400">
            Dashboard de Egresados UPeU — Oficina de Egresados y Empleabilidad
            &nbsp;·&nbsp; Datos actualizados: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </footer>
    </div>
  )
}
