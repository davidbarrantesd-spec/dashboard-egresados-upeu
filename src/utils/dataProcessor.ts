import Papa from 'papaparse'
import type { EgresadoRaw, Egresado, FilterState } from '../types'

// ── normalisation helpers ──────────────────────────────────────────────────

const clean = (v: unknown): string =>
  String(v ?? '').trim().replace(/\s+/g, ' ')

const normSituacion = (s: string): string => {
  const v = s.toLowerCase()
  if (v.includes('trabaj')) return 'Trabajando'
  if (v.includes('busca') || v.includes('desemple')) return 'Buscando empleo'
  if (v.includes('emprend')) return 'Emprendiendo'
  if (v.includes('estudi')) return 'Estudiando'
  if (v === 'otro' || v === 'other') return 'Otro'
  return s || 'No especificado'
}

const normFacultad = (f: string): string => {
  const v = f.trim()
  if (!v) return 'No especificado'
  // unify slight variants
  if (/posgrado/i.test(v)) return 'Escuela General de Posgrado'
  if (/capacita|taller/i.test(v)) return 'Capacitación Continua'
  return v
}

const normSede = (s: string): string => {
  const v = s.trim()
  if (!v) return 'No especificado'
  return v
}

const normSexo = (s: string): string => {
  const v = s.trim().toLowerCase()
  if (v === 'hombre' || v === 'masculino' || v === 'm') return 'Hombre'
  if (v === 'mujer' || v === 'femenino' || v === 'f') return 'Mujer'
  return 'No especificado'
}

const parseBool = (s: string): boolean | null => {
  const v = s.trim().toLowerCase()
  if (v === 'si' || v === 'sí' || v === 'yes' || v === '1') return true
  if (v === 'no' || v === '0') return false
  return null
}

const parseYear = (s: string): number | null => {
  const n = parseInt(s, 10)
  return n >= 1950 && n <= 2030 ? n : null
}

const parseDate = (s: string): Date | null => {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// ── main parser ────────────────────────────────────────────────────────────

export async function loadEgresados(): Promise<Egresado[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/egresados.csv`)
  const text = await response.text()

  const { data } = Papa.parse<EgresadoRaw>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  return data.map((r): Egresado => {
    const situacion = normSituacion(clean(r.SITUACION_ACTUAL))
    const facultad  = normFacultad(clean(r.FACULTAD))
    const sede      = normSede(clean(r.SEDE))

    const empresaActual = clean(r.EMPRESA_ACTUAL)
    const cargoActual   = clean(r.CARGO_ACTUAL)

    const tieneEmpleo =
      situacion === 'Trabajando' || situacion === 'Emprendiendo'

    return {
      id:               clean(r.ID),
      fechaRegistro:    parseDate(r.FECHA_REGISTRO),
      nombres:          clean(r.NOMBRES),
      apellidos:        clean(r.APELLIDOS),
      nombreCompleto:   clean(r.NOMBRE_COMPLETO) || `${clean(r.NOMBRES)} ${clean(r.APELLIDOS)}`.trim(),
      dni:              clean(r.DNI),
      fechaNacimiento:  parseDate(r.FECHA_NACIMIENTO),
      sexo:             normSexo(r.SEXO),
      correo:           clean(r.CORREO),
      celular:          clean(r.CELULAR),
      pais:             clean(r.PAIS_RESIDENCIA),
      estadoCivil:      clean(r.ESTADO_CIVIL) || 'No especificado',
      facultad,
      sede,
      anioIngreso:      parseYear(r.ANIO_INGRESO),
      anioEgreso:       parseYear(r.ANIO_EGRESO),
      situacionActual:  situacion,
      empresaActual,
      cargoActual,
      sector:           clean(r.SECTOR) || 'No especificado',
      departamento:     clean(r.DEPARTAMENTO),
      provincia:        clean(r.PROVINCIA),
      distrito:         clean(r.DISTRITO),
      departamentoLaboral: clean(r.DEPARTAMENTO_LABORAL),
      religion:         clean(r.RELIGION) || 'No especificado',
      interesadoPosgrado: parseBool(r.INTERESADO_POSGRADO),
      voluntarioMentor: parseBool(r.VOLUNTARIO_MENTOR),
      feriaLaboral:     parseBool(r.FERIA_LABORAL),
      procedenciaNombre: clean(r.PROCEDENCIA_NOMBRE) || 'No especificado',
      tieneEmpleo,
      tieneFacultad:    facultad !== 'No especificado',
      tieneSede:        sede !== 'No especificado',
      tieneInfoLaboral: situacion !== 'No especificado',
      tieneAnioEgreso:  parseYear(r.ANIO_EGRESO) !== null,
    }
  })
}

// ── filter ─────────────────────────────────────────────────────────────────

export function applyFilters(data: Egresado[], f: FilterState): Egresado[] {
  return data.filter((e) => {
    if (f.facultad && e.facultad !== f.facultad) return false
    if (f.sede && e.sede !== f.sede) return false
    if (f.anioEgreso && String(e.anioEgreso) !== f.anioEgreso) return false
    if (f.situacion && e.situacionActual !== f.situacion) return false
    if (f.sexo && e.sexo !== f.sexo) return false
    if (f.search) {
      const q = f.search.toLowerCase()
      const hay = `${e.nombreCompleto} ${e.dni} ${e.correo} ${e.empresaActual} ${e.cargoActual} ${e.facultad}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

// ── aggregation helpers ────────────────────────────────────────────────────

export function countBy<K extends keyof Egresado>(
  data: Egresado[],
  key: K,
): Record<string, number> {
  return data.reduce((acc, e) => {
    const v = String(e[key] ?? 'No especificado') || 'No especificado'
    acc[v] = (acc[v] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function topN(
  counts: Record<string, number>,
  n: number,
  exclude: string[] = ['No especificado'],
): { name: string; value: number }[] {
  return Object.entries(counts)
    .filter(([k]) => !exclude.includes(k))
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }))
}

export function pct(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 1000) / 10
}

// ── KPI builder ────────────────────────────────────────────────────────────

export function buildKPIs(data: Egresado[]) {
  const total   = data.length
  const trabajando  = data.filter((e) => e.situacionActual === 'Trabajando').length
  const buscando    = data.filter((e) => e.situacionActual === 'Buscando empleo').length
  const emprendiendo = data.filter((e) => e.situacionActual === 'Emprendiendo').length
  const estudiando  = data.filter((e) => e.situacionActual === 'Estudiando').length
  const conEmpresa  = data.filter((e) => e.empresaActual && e.empresaActual.length > 1).length
  const conCargo    = data.filter((e) => e.cargoActual && e.cargoActual.length > 1).length

  const facCounts = countBy(data, 'facultad')
  const sedeCounts = countBy(data, 'sede')

  const facultadTop = topN(facCounts, 1)[0]?.name ?? '—'
  const sedeTop     = topN(sedeCounts, 1)[0]?.name ?? '—'

  // best employment rate by faculty (min 10 records)
  const facGroups: Record<string, { total: number; empleados: number }> = {}
  data.forEach((e) => {
    if (e.facultad === 'No especificado') return
    if (!facGroups[e.facultad]) facGroups[e.facultad] = { total: 0, empleados: 0 }
    facGroups[e.facultad].total++
    if (e.tieneEmpleo) facGroups[e.facultad].empleados++
  })
  const mejorFac = Object.entries(facGroups)
    .filter(([, g]) => g.total >= 10)
    .sort((a, b) => b[1].empleados / b[1].total - a[1].empleados / a[1].total)[0]?.[0] ?? '—'

  const empleados = trabajando + emprendiendo

  return {
    totalEgresados:             total,
    totalFacultades:            Object.keys(facCounts).filter((k) => k !== 'No especificado').length,
    totalSedes:                 Object.keys(sedeCounts).filter((k) => k !== 'No especificado').length,
    totalTrabajando:            trabajando,
    totalBuscandoEmpleo:        buscando,
    totalEmprendiendo:          emprendiendo,
    totalEstudiando:            estudiando,
    pctEmpleados:               pct(empleados, total),
    pctSinEmpleo:               pct(buscando, total),
    pctEmprendiendo:            pct(emprendiendo, total),
    pctCompletos:               pct(data.filter((e) => e.tieneFacultad && e.tieneSede && e.tieneAnioEgreso).length, total),
    facultadMayorEgresados:     facultadTop,
    sedeMayorParticipacion:     sedeTop,
    facultadMejorEmpleabilidad: mejorFac,
    totalConEmpresa:            conEmpresa,
    totalConCargo:              conCargo,
  }
}

// ── chart data builders ────────────────────────────────────────────────────

export const SITUACION_COLORS: Record<string, string> = {
  'Trabajando':      '#22c55e',
  'Emprendiendo':    '#3b82f6',
  'Estudiando':      '#f59e0b',
  'Buscando empleo': '#ef4444',
  'Otro':            '#94a3b8',
  'No especificado': '#e2e8f0',
}

export const FACULTY_COLORS = [
  '#1e40af', '#2563eb', '#3b82f6', '#60a5fa',
  '#93c5fd', '#1d4ed8', '#1e3a8a', '#0f172a',
]

export const SEDE_COLORS: Record<string, string> = {
  'Sede Lima':       '#1e40af',
  'Filial Juliaca':  '#16a34a',
  'Filial Tarapoto': '#d97706',
  'No especificado': '#94a3b8',
}

export function buildFacultyEmployment(data: Egresado[]) {
  const groups: Record<string, Record<string, number>> = {}
  data.forEach((e) => {
    const fac = e.facultad !== 'No especificado' ? e.facultad : null
    if (!fac) return
    if (!groups[fac]) groups[fac] = {}
    const sit = e.situacionActual
    groups[fac][sit] = (groups[fac][sit] ?? 0) + 1
  })

  return Object.entries(groups)
    .map(([facultad, sits]) => {
      const total       = Object.values(sits).reduce((a, b) => a + b, 0)
      const trabajando  = sits['Trabajando'] ?? 0
      const emprendiendo = sits['Emprendiendo'] ?? 0
      const empleados   = trabajando + emprendiendo
      return {
        facultad: facultad.replace('Facultad de ', '').replace('Escuela General de ', ''),
        trabajando,
        buscando:    sits['Buscando empleo'] ?? 0,
        emprendiendo,
        estudiando:  sits['Estudiando'] ?? 0,
        otro:        sits['Otro'] ?? 0,
        total,
        pctEmpleados: pct(empleados, total),
      }
    })
    .sort((a, b) => b.total - a.total)
}

export function buildEgresadosByYear(data: Egresado[]) {
  const counts: Record<number, number> = {}
  data.forEach((e) => {
    if (e.anioEgreso) counts[e.anioEgreso] = (counts[e.anioEgreso] ?? 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, value]) => ({ year: Number(year), value }))
}
