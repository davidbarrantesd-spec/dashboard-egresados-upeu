import type { Egresado } from '../types'
import { buildKPIs, buildFacultyEmployment, countBy, topN, pct } from './dataProcessor'

export interface Insight {
  id: string
  type: 'success' | 'warning' | 'info' | 'highlight'
  icon: string
  title: string
  description: string
}

export function generateInsights(data: Egresado[]): Insight[] {
  if (!data.length) return []

  const kpis       = buildKPIs(data)
  const facEmp     = buildFacultyEmployment(data)
  const sedeCounts = countBy(data, 'sede')
  const facCounts  = countBy(data, 'facultad')

  const insights: Insight[] = []

  // 1. Total registros
  insights.push({
    id: 'total',
    type: 'info',
    icon: '🎓',
    title: `${kpis.totalEgresados.toLocaleString()} egresados registrados`,
    description: `Se cuenta con un universo de ${kpis.totalEgresados.toLocaleString()} egresados que han actualizado sus datos, distribuidos en ${kpis.totalFacultades} facultades y ${kpis.totalSedes} campus de la UPeU.`,
  })

  // 2. Empleabilidad
  const tipoEmpleo = kpis.pctEmpleados >= 60 ? 'success' : kpis.pctEmpleados >= 40 ? 'info' : 'warning'
  insights.push({
    id: 'empleabilidad',
    type: tipoEmpleo,
    icon: '💼',
    title: `Tasa de empleabilidad: ${kpis.pctEmpleados}%`,
    description: `${kpis.totalTrabajando.toLocaleString()} egresados trabajan actualmente y ${kpis.totalEmprendiendo} son emprendedores, lo que representa el ${kpis.pctEmpleados}% del total registrado.`,
  })

  // 3. Facultad top
  const facTop = topN(facCounts, 1)[0]
  if (facTop) {
    insights.push({
      id: 'fac-top',
      type: 'highlight',
      icon: '🏛️',
      title: `Mayor participación: ${facTop.name.replace('Facultad de ', '')}`,
      description: `La ${facTop.name} lidera el registro de egresados con ${facTop.value.toLocaleString()} participantes (${pct(facTop.value, data.length)}% del total).`,
    })
  }

  // 4. Sede top
  const sedeTop = topN(sedeCounts, 1)[0]
  if (sedeTop) {
    insights.push({
      id: 'sede-top',
      type: 'info',
      icon: '📍',
      title: `Campus más activo: ${sedeTop.name}`,
      description: `${sedeTop.name} concentra ${sedeTop.value.toLocaleString()} egresados registrados (${pct(sedeTop.value, data.length)}% del total).`,
    })
  }

  // 5. Mejor empleabilidad por facultad
  const topEmplFac = [...facEmp].sort((a, b) => b.pctEmpleados - a.pctEmpleados)[0]
  if (topEmplFac) {
    insights.push({
      id: 'best-emp',
      type: 'success',
      icon: '⭐',
      title: `Mejor inserción laboral: ${topEmplFac.facultad}`,
      description: `Con un ${topEmplFac.pctEmpleados}% de egresados empleados, esta facultad lidera en inserción laboral con ${topEmplFac.trabajando + topEmplFac.emprendiendo} personas activas laboralmente.`,
    })
  }

  // 6. Emprendimiento
  if (kpis.totalEmprendiendo > 0) {
    insights.push({
      id: 'emprendimiento',
      type: 'info',
      icon: '🚀',
      title: `${kpis.totalEmprendiendo} egresados emprendedores`,
      description: `El ${kpis.pctEmprendiendo}% de los egresados ha optado por el camino del emprendimiento, lo que refleja una cultura de iniciativa empresarial en la comunidad UPeU.`,
    })
  }

  // 7. Buscando empleo
  if (kpis.pctSinEmpleo > 10) {
    insights.push({
      id: 'sin-empleo',
      type: 'warning',
      icon: '⚠️',
      title: `${kpis.totalBuscandoEmpleo} egresados buscan empleo`,
      description: `El ${kpis.pctSinEmpleo}% de los egresados está activamente buscando empleo. Esta población es candidata prioritaria para programas de bolsa de trabajo y ferias laborales.`,
    })
  }

  // 8. Empresas registradas
  if (kpis.totalConEmpresa > 0) {
    insights.push({
      id: 'empresas',
      type: 'info',
      icon: '🏢',
      title: `${kpis.totalConEmpresa.toLocaleString()} empresas registradas`,
      description: `Se tienen registradas ${kpis.totalConEmpresa.toLocaleString()} referencias de empresa y ${kpis.totalConCargo.toLocaleString()} cargos documentados, lo que permite mapear la red empresarial de egresados UPeU.`,
    })
  }

  // 9. Facultades con baja actualización
  const facBajaActualizacion = facEmp.filter((f) => f.total < 50)
  if (facBajaActualizacion.length > 0) {
    insights.push({
      id: 'baja-actualizacion',
      type: 'warning',
      icon: '📋',
      title: 'Facultades con menor actualización de datos',
      description: `${facBajaActualizacion.map((f) => f.facultad).join(', ')} presenta${facBajaActualizacion.length > 1 ? 'n' : ''} menor cantidad de registros. Se recomienda reforzar la convocatoria de actualización en esas unidades académicas.`,
    })
  }

  // 10. Completitud de datos
  insights.push({
    id: 'calidad',
    type: kpis.pctCompletos >= 70 ? 'success' : 'warning',
    icon: '📊',
    title: `Calidad de datos: ${kpis.pctCompletos}% de registros completos`,
    description: `El ${kpis.pctCompletos}% de los egresados tiene datos de facultad, sede y año de egreso completos. ${kpis.pctCompletos < 70 ? 'Se recomienda fortalecer la recolección de datos básicos.' : 'Excelente completitud de información clave.'}`,
  })

  return insights
}
