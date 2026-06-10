import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'
import {
  Users, Building2, MapPin, GraduationCap, TrendingUp,
  BookOpen, CheckCircle2, AlertTriangle,
} from 'lucide-react'

import type { Egresado } from '../../types'
import {
  buildKPIs, buildFacultyEmployment, buildEgresadosByYear,
  countBy, topN, pct, FACULTY_COLORS, SEDE_COLORS, SITUACION_COLORS,
} from '../../utils/dataProcessor'
import KPICard from '../kpi/KPICard'
import ChartCard from '../charts/ChartCard'

interface Props { data: Egresado[] }

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  if (percent < 0.06) return null
  const r  = outerRadius + 18
  const x  = cx + r * Math.cos(-midAngle * RADIAN)
  const y  = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#334155" textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central" fontSize={11} fontWeight={500}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function OverviewDashboard({ data }: Props) {
  const kpis       = useMemo(() => buildKPIs(data), [data])
  const facEmp     = useMemo(() => buildFacultyEmployment(data), [data])
  const yearData   = useMemo(() => buildEgresadosByYear(data), [data])

  const sedePie = useMemo(() => {
    const c = countBy(data, 'sede')
    return Object.entries(c)
      .filter(([k]) => k !== 'No especificado')
      .map(([name, value]) => ({ name, value, pct: pct(value, data.length) }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const sexoPie = useMemo(() => {
    const c = countBy(data, 'sexo')
    return Object.entries(c)
      .filter(([k]) => k !== 'No especificado')
      .map(([name, value]) => ({ name, value }))
  }, [data])

  const situacionPie = useMemo(() => {
    const c = countBy(data, 'situacionActual')
    return Object.entries(c)
      .filter(([k]) => k !== 'No especificado')
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const topEmpresas = useMemo(() => {
    const c = countBy(data, 'empresaActual')
    return topN(c, 10, ['No especificado', '', 'Ninguna', 'ninguna', '-', '0', 'No', 'NO'])
      .map((e) => ({ ...e, name: e.name.length > 28 ? e.name.slice(0, 26) + '…' : e.name }))
  }, [data])

  const topCargos = useMemo(() => {
    const c = countBy(data, 'cargoActual')
    return topN(c, 8, ['No especificado', '', '-', '0', 'Ninguna'])
      .map((e) => ({ ...e, name: e.name.length > 30 ? e.name.slice(0, 28) + '…' : e.name }))
  }, [data])

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
          title="Total egresados"
          value={kpis.totalEgresados}
          icon={<Users className="w-4 h-4" />}
          color="blue"
          subtitle="Registros activos"
        />
        <KPICard
          title="Facultades"
          value={kpis.totalFacultades}
          icon={<Building2 className="w-4 h-4" />}
          color="indigo"
          subtitle="Unidades académicas"
        />
        <KPICard
          title="Campus"
          value={kpis.totalSedes}
          icon={<MapPin className="w-4 h-4" />}
          color="teal"
          subtitle="Sedes representadas"
        />
        <KPICard
          title="Empleados"
          value={`${kpis.pctEmpleados}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="green"
          subtitle={`${(kpis.totalTrabajando + kpis.totalEmprendiendo).toLocaleString()} personas`}
        />
        <KPICard
          title="Trabajando"
          value={kpis.totalTrabajando}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="green"
          subtitle="En relación de dependencia"
        />
        <KPICard
          title="Emprendiendo"
          value={kpis.totalEmprendiendo}
          icon={<GraduationCap className="w-4 h-4" />}
          color="amber"
          subtitle={`${kpis.pctEmprendiendo}% del total`}
        />
        <KPICard
          title="Datos completos"
          value={`${kpis.pctCompletos}%`}
          icon={<BookOpen className="w-4 h-4" />}
          color="purple"
          subtitle="Con facultad, sede y año"
        />
      </div>

      {/* Row 1: Facultad bar + Sede pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Egresados por facultad"
          subtitle="Distribución por unidad académica"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={facEmp} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                type="category"
                dataKey="facultad"
                width={155}
                tick={{ fontSize: 11, fill: '#334155' }}
              />
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), 'Egresados']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {facEmp.map((_, i) => (
                  <Cell key={i} fill={FACULTY_COLORS[i % FACULTY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución por campus" subtitle="Participación según sede">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={sedePie}
                cx="50%"
                cy="50%"
                outerRadius={85}
                dataKey="value"
                labelLine={false}
                label={renderLabel}
              >
                {sedePie.map((entry) => (
                  <Cell key={entry.name} fill={SEDE_COLORS[entry.name] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), 'Egresados']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Año de egreso + Situación + Género */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Tendencia de egresados por año"
          subtitle="Número de egresados registrados según año de egreso"
          className="lg:col-span-2"
        >
          {yearData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={yearData} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="gradYear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString(), 'Egresados']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#gradYear)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">Sin datos de año de egreso</div>
          )}
        </ChartCard>

        <div className="grid grid-cols-1 gap-4">
          <ChartCard title="Situación laboral" subtitle="Estado actual de egresados">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={situacionPie} cx="50%" cy="50%" outerRadius={60} innerRadius={30} dataKey="value" labelLine={false}>
                  {situacionPie.map((entry) => (
                    <Cell key={entry.name} fill={SITUACION_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [v.toLocaleString(), name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribución por género" subtitle="Composición por sexo">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={sexoPie} cx="50%" cy="50%" outerRadius={45} innerRadius={20} dataKey="value" labelLine={false}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [v.toLocaleString(), name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Row 3: Top empresas + cargos */}
      {(topEmpresas.length > 0 || topCargos.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topEmpresas.length > 0 && (
            <ChartCard title="Principales empleadores" subtitle="Top 10 empresas o instituciones">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topEmpresas} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={165}
                    tick={{ fontSize: 10, fill: '#334155' }}
                  />
                  <Tooltip
                    formatter={(v: number) => [v, 'Egresados']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {topCargos.length > 0 && (
            <ChartCard title="Cargos más frecuentes" subtitle="Top 8 posiciones registradas">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCargos} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={165}
                    tick={{ fontSize: 10, fill: '#334155' }}
                  />
                  <Tooltip
                    formatter={(v: number) => [v, 'Egresados']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  )
}
