import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import {
  Briefcase, TrendingUp, Users, Award, Building, AlertTriangle,
} from 'lucide-react'

import type { Egresado } from '../../types'
import {
  buildKPIs, buildFacultyEmployment, countBy, topN, pct,
  SITUACION_COLORS, FACULTY_COLORS,
} from '../../utils/dataProcessor'
import KPICard from '../kpi/KPICard'
import ChartCard from '../charts/ChartCard'

interface Props { data: Egresado[] }

export default function EmploymentDashboard({ data }: Props) {
  const kpis   = useMemo(() => buildKPIs(data), [data])
  const facEmp = useMemo(() => buildFacultyEmployment(data), [data])

  // Situación general
  const situacionData = useMemo(() => {
    const c = countBy(data, 'situacionActual')
    return Object.entries(c)
      .filter(([k]) => k !== 'No especificado')
      .map(([name, value]) => ({
        name,
        value,
        pct: pct(value, data.length),
        fill: SITUACION_COLORS[name] ?? '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  // Empleabilidad por sede
  const sedeEmpleo = useMemo(() => {
    const groups: Record<string, { total: number; empleados: number }> = {}
    data.forEach((e) => {
      if (e.sede === 'No especificado') return
      if (!groups[e.sede]) groups[e.sede] = { total: 0, empleados: 0 }
      groups[e.sede].total++
      if (e.tieneEmpleo) groups[e.sede].empleados++
    })
    return Object.entries(groups).map(([sede, g]) => ({
      sede,
      pctEmpleados: pct(g.empleados, g.total),
      empleados: g.empleados,
      total: g.total,
    })).sort((a, b) => b.pctEmpleados - a.pctEmpleados)
  }, [data])

  // Empleabilidad por año de egreso
  const empByYear = useMemo(() => {
    const groups: Record<number, { total: number; empleados: number }> = {}
    data.forEach((e) => {
      if (!e.anioEgreso) return
      if (!groups[e.anioEgreso]) groups[e.anioEgreso] = { total: 0, empleados: 0 }
      groups[e.anioEgreso].total++
      if (e.tieneEmpleo) groups[e.anioEgreso].empleados++
    })
    return Object.entries(groups)
      .map(([y, g]) => ({
        year: Number(y),
        pct: pct(g.empleados, g.total),
        total: g.total,
        empleados: g.empleados,
      }))
      .filter((r) => r.total >= 3)
      .sort((a, b) => a.year - b.year)
  }, [data])

  const topEmpresas = useMemo(() => {
    const c = countBy(data, 'empresaActual')
    return topN(c, 12, ['No especificado', '', 'Ninguna', 'ninguna', '-', '0', 'No', 'NO'])
      .map((e) => ({ ...e, name: e.name.length > 30 ? e.name.slice(0, 28) + '…' : e.name }))
  }, [data])

  const topCargos = useMemo(() => {
    const c = countBy(data, 'cargoActual')
    return topN(c, 12, ['No especificado', '', '-', '0', 'Ninguna'])
      .map((e) => ({ ...e, name: e.name.length > 32 ? e.name.slice(0, 30) + '…' : e.name }))
  }, [data])

  const empleados = kpis.totalTrabajando + kpis.totalEmprendiendo

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
          <p>No hay datos con los filtros seleccionados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KPICard
          title="Con empleo"
          value={empleados}
          icon={<Briefcase className="w-4 h-4" />}
          color="green"
          subtitle={`${kpis.pctEmpleados}% del total`}
        />
        <KPICard
          title="Trabajando"
          value={kpis.totalTrabajando}
          icon={<Users className="w-4 h-4" />}
          color="blue"
          subtitle="Dependencia laboral"
        />
        <KPICard
          title="Emprendiendo"
          value={kpis.totalEmprendiendo}
          icon={<TrendingUp className="w-4 h-4" />}
          color="amber"
          subtitle={`${kpis.pctEmprendiendo}%`}
        />
        <KPICard
          title="Buscando empleo"
          value={kpis.totalBuscandoEmpleo}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="red"
          subtitle={`${kpis.pctSinEmpleo}% del total`}
        />
        <KPICard
          title="Estudiando"
          value={kpis.totalEstudiando}
          icon={<Award className="w-4 h-4" />}
          color="purple"
          subtitle="Posgrado / otra carrera"
        />
        <KPICard
          title="Mejor facultad"
          value={kpis.facultadMejorEmpleabilidad.replace('Facultad de ', '').replace('Escuela ', '')}
          icon={<Building className="w-4 h-4" />}
          color="teal"
          subtitle="Mayor empleabilidad"
        />
        <KPICard
          title="Empresas reg."
          value={kpis.totalConEmpresa}
          icon={<Building className="w-4 h-4" />}
          color="indigo"
          subtitle={`${kpis.totalConCargo} cargos`}
        />
      </div>

      {/* Situación general + Empleabilidad por facultad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Situación laboral general" subtitle="Distribución de todos los egresados">
          <div className="space-y-2">
            {situacionData.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.fill }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-medium text-slate-700 truncate">{s.name}</span>
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{s.value.toLocaleString()} ({s.pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.pct}%`, background: s.fill }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Empleabilidad por facultad"
          subtitle="% de egresados empleados o emprendiendo"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={facEmp} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="facultad" width={155} tick={{ fontSize: 10, fill: '#334155' }} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Tasa de empleo']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
              />
              <Bar dataKey="pctEmpleados" radius={[0, 4, 4, 0]}>
                {facEmp.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pctEmpleados >= 70 ? '#22c55e' : entry.pctEmpleados >= 50 ? '#3b82f6' : '#f59e0b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Empleabilidad por sede + Stacked facultad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Empleabilidad por campus" subtitle="Tasa de empleo según sede">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sedeEmpleo} margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sede" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number, _, props) => [`${v}% (${props.payload?.empleados} de ${props.payload?.total})`, 'Empleabilidad']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
              />
              <Bar dataKey="pctEmpleados" radius={[4, 4, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Situación laboral por facultad" subtitle="Composición interna por estado">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={facEmp} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="facultad" width={130} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="trabajando" stackId="a" fill="#22c55e" name="Trabajando" />
              <Bar dataKey="emprendiendo" stackId="a" fill="#3b82f6" name="Emprendiendo" />
              <Bar dataKey="buscando" stackId="a" fill="#ef4444" name="Buscando" />
              <Bar dataKey="estudiando" stackId="a" fill="#f59e0b" name="Estudiando" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Empleabilidad por año + Empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {empByYear.length > 0 && (
          <ChartCard title="Tasa de empleo por año de egreso" subtitle="% de egresados empleados según promoción">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={empByYear} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number, _, props) => [`${v}% (${props.payload?.empleados}/${props.payload?.total})`, 'Empleabilidad']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                />
                <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {topEmpresas.length > 0 && (
          <ChartCard title="Principales empresas empleadoras" subtitle="Top 12 por cantidad de egresados">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topEmpresas} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number) => [v, 'Egresados']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                />
                <Bar dataKey="value" fill="#1e40af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {topCargos.length > 0 && (
        <ChartCard title="Cargos ocupados con mayor frecuencia" subtitle="Top 12 posiciones registradas">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCargos} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={175} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => [v, 'Egresados']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
              />
              <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}
