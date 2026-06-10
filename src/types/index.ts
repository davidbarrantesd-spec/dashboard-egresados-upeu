export interface EgresadoRaw {
  ID: string
  FECHA_REGISTRO: string
  NOMBRES: string
  APELLIDOS: string
  NOMBRE_COMPLETO: string
  DNI: string
  FECHA_NACIMIENTO: string
  SEXO: string
  CORREO: string
  CELULAR: string
  DIRECCION: string
  PAIS_RESIDENCIA: string
  ESTADO_CIVIL: string
  NIVEL: string
  CODIGO_ESTUDIANTE: string
  CARRERA: string
  OTRA_CARRERA: string
  FACULTAD: string
  SEDE: string
  ANIO_INGRESO: string
  ANIO_EGRESO: string
  SITUACION_ACTUAL: string
  EMPRESA_ACTUAL: string
  CARGO_ACTUAL: string
  EMPRESA: string
  CARGO: string
  SECTOR: string
  UBICACION_LABORAL: string
  UBICACION_TRABAJO: string
  PAIS_LABORAL: string
  DEPARTAMENTO: string
  PROVINCIA: string
  DISTRITO: string
  DEPARTAMENTO_LABORAL: string
  PROVINCIA_LABORAL: string
  DISTRITO_LABORAL: string
  RELIGION: string
  OTRA_RELIGION: string
  POSGRADO_UPEU: string
  OTRO_POSGRADO: string
  INTERESADO_POSGRADO: string
  MENTOR: string
  VOLUNTARIO_MENTOR: string
  FERIA_LABORAL: string
  NOTICIAS_UPEU: string
  EVENTOS_EGRESADOS: string
  REFLEXION_TESTIMONIO: string
  PROCEDENCIA_CODIGO: string
  PROCEDENCIA_NOMBRE: string
}

export interface Egresado {
  id: string
  fechaRegistro: Date | null
  nombres: string
  apellidos: string
  nombreCompleto: string
  dni: string
  fechaNacimiento: Date | null
  sexo: string
  correo: string
  celular: string
  pais: string
  estadoCivil: string
  facultad: string
  sede: string
  anioIngreso: number | null
  anioEgreso: number | null
  situacionActual: string
  empresaActual: string
  cargoActual: string
  sector: string
  departamento: string
  provincia: string
  distrito: string
  departamentoLaboral: string
  religion: string
  interesadoPosgrado: boolean | null
  voluntarioMentor: boolean | null
  feriaLaboral: boolean | null
  procedenciaNombre: string
  // computed
  tieneEmpleo: boolean
  tieneFacultad: boolean
  tieneSede: boolean
  tieneInfoLaboral: boolean
  tieneAnioEgreso: boolean
}

export interface FilterState {
  facultad: string
  sede: string
  anioEgreso: string
  situacion: string
  sexo: string
  search: string
}

export interface KPIData {
  totalEgresados: number
  totalFacultades: number
  totalSedes: number
  totalTrabajando: number
  totalBuscandoEmpleo: number
  totalEmprendiendo: number
  totalEstudiando: number
  pctEmpleados: number
  pctSinEmpleo: number
  pctEmprendiendo: number
  pctCompletos: number
  facultadMayorEgresados: string
  sedeMayorParticipacion: string
  facultadMejorEmpleabilidad: string
  totalConEmpresa: number
  totalConCargo: number
}

export interface ChartDataItem {
  name: string
  value: number
  pct?: number
  color?: string
}

export interface FacultyEmploymentItem {
  facultad: string
  trabajando: number
  buscando: number
  emprendiendo: number
  estudiando: number
  otro: number
  total: number
  pctEmpleados: number
}
