import React, { useMemo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { Egresado } from '../../types'
import { pct } from '../../utils/dataProcessor'
import ChartCard from '../charts/ChartCard'

interface Props { data: Egresado[] }

interface FieldQuality {
  field: string
  label: string
  filled: number
  total: number
  pct: number
}

function quality(data: Egresado[]): FieldQuality[] {
  const total = data.length
  const fields: { field: keyof Egresado; label: string }[] = [
    { field: 'facultad',       label: 'Facultad' },
    { field: 'sede',           label: 'Campus / Sede' },
    { field: 'anioEgreso',     label: 'Año de egreso' },
    { field: 'situacionActual',label: 'Situación laboral' },
    { field: 'sexo',           label: 'Género' },
    { field: 'empresaActual',  label: 'Empresa actual' },
    { field: 'cargoActual',    label: 'Cargo actual' },
    { field: 'correo',         label: 'Correo electrónico' },
    { field: 'celular',        label: 'Teléfono celular' },
    { field: 'pais',           label: 'País de residencia' },
  ]
  return fields.map(({ field, label }) => {
    const filled = data.filter((e) => {
      const v = e[field]
      return v && v !== 'No especificado' && String(v).trim().length > 0
    }).length
    return { field: String(field), label, filled, total, pct: pct(filled, total) }
  })
}

const QualityBar = ({ item }: { item: FieldQuality }) => {
  const color =
    item.pct >= 80 ? '#22c55e' :
    item.pct >= 50 ? '#f59e0b' : '#ef4444'
  const Icon =
    item.pct >= 80 ? CheckCircle2 :
    item.pct >= 50 ? AlertTriangle : XCircle
  const iconClass =
    item.pct >= 80 ? 'text-green-500' :
    item.pct >= 50 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className={`w-4 h-4 flex-shrink-0 ${iconClass}`} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-700">{item.label}</span>
          <span className="text-xs text-slate-500">{item.filled.toLocaleString()} / {item.total.toLocaleString()} ({item.pct}%)</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${item.pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  )
}

export default function DataQualityDashboard({ data }: Props) {
  const qualities = useMemo(() => quality(data), [data])
  const total     = data.length

  const radarData = qualities.map((q) => ({ subject: q.label, value: q.pct, fullMark: 100 }))

  const highQuality  = qualities.filter((q) => q.pct >= 80)
  const medQuality   = qualities.filter((q) => q.pct >= 50 && q.pct < 80)
  const lowQuality   = qualities.filter((q) => q.pct < 50)

  const avgQuality = Math.round(qualities.reduce((s, q) => s + q.pct, 0) / qualities.length)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold text-blue-700">{avgQuality}%</p>
          <p className="text-xs font-semibold text-blue-600 mt-1">Calidad promedio</p>
          <p className="text-xs text-blue-500 mt-0.5">Sobre todos los campos</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold text-green-700">{highQuality.length}</p>
          <p className="text-xs font-semibold text-green-600 mt-1">Campos excelentes</p>
          <p className="text-xs text-green-500 mt-0.5">≥ 80% completitud</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold text-amber-700">{medQuality.length}</p>
          <p className="text-xs font-semibold text-amber-600 mt-1">Campos mejorables</p>
          <p className="text-xs text-amber-500 mt-0.5">50–79% completitud</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold text-red-700">{lowQuality.length}</p>
          <p className="text-xs font-semibold text-red-600 mt-1">Campos críticos</p>
          <p className="text-xs text-red-500 mt-0.5">&lt; 50% completitud</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar list */}
        <ChartCard title="Completitud por campo" subtitle="Porcentaje de registros con información completa">
          <div className="divide-y divide-slate-50">
            {[...qualities].sort((a, b) => b.pct - a.pct).map((q) => (
              <QualityBar key={q.field} item={q} />
            ))}
          </div>
        </ChartCard>

        {/* Radar */}
        <ChartCard title="Perfil de calidad de datos" subtitle="Vista radial de completitud por campo">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius={100} data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#334155' }} />
              <Radar
                name="Completitud"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.25}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Completitud']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recommendations */}
      <ChartCard title="Recomendaciones para mejorar la recolección de datos" subtitle="Basadas en el análisis de completitud actual">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lowQuality.map((q) => (
            <div key={q.field} className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">{q.label} — solo {q.pct}%</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {q.field === 'empresaActual' && 'Solicitar empresa o institución donde trabaja el egresado. Clave para mapear empleadores.'}
                  {q.field === 'cargoActual' && 'Registrar el cargo o puesto laboral. Permite analizar inserción y nivel de posicionamiento.'}
                  {q.field === 'sexo' && 'Incluir campo de género como obligatorio. Permite análisis de equidad y brechas de género.'}
                  {q.field === 'anioEgreso' && 'El año de egreso es fundamental para análisis de tendencias y seguimiento de cohortes.'}
                  {!['empresaActual','cargoActual','sexo','anioEgreso'].includes(q.field) && `Reforzar la recolección del campo "${q.label}" para mejorar la calidad del análisis.`}
                </p>
              </div>
            </div>
          ))}
          {medQuality.map((q) => (
            <div key={q.field} className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">{q.label} — {q.pct}% completitud</p>
                <p className="text-xs text-amber-600 mt-0.5">Campo con completitud media. Reforzar en próximas campañas de actualización.</p>
              </div>
            </div>
          ))}
          {lowQuality.length === 0 && medQuality.length === 0 && (
            <div className="col-span-2 flex gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">¡Excelente calidad de datos! Todos los campos presentan alta completitud.</p>
            </div>
          )}
        </div>
      </ChartCard>

      {/* Ideal columns */}
      <ChartCard title="Columnas ideales para enriquecer el análisis" subtitle="Campos recomendados para futuras versiones del formulario">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { field: 'Sector laboral',         desc: 'Público, privado, ONG, iglesia, etc. Permite análisis de inserción sectorial.' },
            { field: 'Nivel de ingresos',       desc: 'Rango salarial. Permite medir el retorno económico de la educación.' },
            { field: 'Tipo de contrato',        desc: 'Plazo fijo, indefinido, honorarios. Mide la calidad del empleo.' },
            { field: 'Ciudad de trabajo',       desc: 'Ciudad donde labora. Mejora el análisis de movilidad geográfica.' },
            { field: 'LinkedIn / Red social',   desc: 'Perfil profesional para seguimiento y networking de egresados.' },
            { field: 'Año de primera inserción',desc: 'Cuándo consiguió el primer empleo tras egresar. Mide empleabilidad temprana.' },
          ].map((c) => (
            <div key={c.field} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs font-semibold text-slate-700">{c.field}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
