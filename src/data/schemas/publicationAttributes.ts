/**
 * Esquema de atributos por subcategoría para el formulario de publicación.
 *
 * Cada subcategoría define los campos que el vendedor debe (o puede) completar
 * para describir su publicación. Esos campos terminan guardados en
 * `Publication.attributes` (Record<string, string | string[]>) — la clave es
 * exactamente `field.key` y el valor es el string o string[] seleccionado.
 *
 * El renderer en el paso 4 del wizard usa este esquema; la página pública
 * los muestra vía AttributeRenderer.
 */

export type AttributeFieldType =
  | 'select'
  | 'multiselect'
  | 'text'
  | 'number'
  /**
   * `cascade`: select dependiente del valor de otro atributo. Por ej. la
   * "Zona de origen" muestra solo las zonas válidas del "Departamento"
   * actualmente seleccionado.
   */
  | 'cascade'

export interface AttributeField {
  /** Clave exacta usada en `Publication.attributes`. */
  key: string
  /** Etiqueta visible (default = key). */
  label?: string
  type: AttributeFieldType
  required?: boolean
  helper?: string
  /** Opciones para `select` y `multiselect`. */
  options?: string[]
  /** Placeholder para text/number. */
  placeholder?: string
  /** Para `number`: unidad mostrada al lado. */
  suffix?: string
  /** Para `number`. */
  min?: number
  max?: number
  /** Para `number`: paso del incremento. Por defecto 1. */
  step?: number
  /**
   * Para `cascade`: clave del atributo padre + mapa padre → opciones hijas.
   * El renderer mostrará un select deshabilitado si el padre no tiene valor.
   */
  cascade?: {
    from: string
    map: Record<string, string[]>
  }
}

/* ─── OPCIONES REUTILIZABLES ────────────────────────────────── */

const PROCESS_OPTIONS = [
  'Lavado',
  'Natural',
  'Honey amarillo',
  'Honey rojo',
  'Honey negro',
  'Anaeróbico',
  'Semi-lavado',
  'Doble lavado',
]

const VARIETY_OPTIONS = [
  'Typica',
  'Caturra',
  'Bourbon',
  'Gesha-Geisha',
  'Catuaí',
  'Catimor',
  'Sarchimor',
  'Mezcla-Blend',
]

/** 9 departamentos de Bolivia. */
export const BOLIVIAN_DEPARTMENTS = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Tarija',
  'Chuquisaca',
  'Beni',
  'Pando',
  'Oruro',
  'Potosí',
]

/**
 * Zonas/municipios cafetaleros por departamento. Solo se listan
 * departamentos con presencia cafetera relevante en Bolivia.
 * Si un comprador busca por departamento, debe poder afinar a la zona.
 */
export const COFFEE_ZONES_BY_DEPARTMENT: Record<string, string[]> = {
  'La Paz': [
    'Caranavi',
    'Nor Yungas',
    'Sud Yungas',
    'Inquisivi',
    'Franz Tamayo',
    'Coroico',
    'Coripata',
  ],
  Cochabamba: ['Chapare', 'Carrasco', 'Tiraque', 'Villa Tunari'],
  'Santa Cruz': [
    'Samaipata',
    'Porongo',
    'Buena Vista',
    'Vallegrande',
    'Mairana',
    'Comarapa',
  ],
  Tarija: ['Bermejo', 'Caraparí', 'Entre Ríos'],
  Beni: ['San Ignacio de Moxos'],
  Chuquisaca: ['Padilla', 'Monteagudo'],
}

const COFFEE_DEPARTMENTS = Object.keys(COFFEE_ZONES_BY_DEPARTMENT)

/**
 * Par de campos para "origen de café": departamento (single select) +
 * zona/municipio (cascade dependiente del departamento). Se usa donde
 * antes había un único campo "Zona de origen" plano.
 */
function originFields(opts: { required?: boolean } = {}): AttributeField[] {
  return [
    {
      key: 'Departamento de origen',
      type: 'select',
      options: COFFEE_DEPARTMENTS,
      required: opts.required,
    },
    {
      key: 'Zona de origen',
      type: 'cascade',
      cascade: { from: 'Departamento de origen', map: COFFEE_ZONES_BY_DEPARTMENT },
      helper: 'Selecciona primero el departamento.',
    },
  ]
}

const ALTITUDE_OPTIONS = [
  'Hasta 1000 msnm',
  '1000–1500 msnm',
  '1500–2000 msnm',
  'Más de 2000 msnm',
]

const SCA_OPTIONS = [
  'Sin puntaje',
  '<80',
  '80–84 pts',
  '85–89 pts',
  '90+ pts',
]

const ROAST_OPTIONS = [
  'Claro',
  'Medio',
  'Medio-oscuro',
  'Oscuro',
  'Espresso',
]

const CERTIFICATION_OPTIONS = [
  'Orgánico',
  'Fair Trade',
  'Rainforest Alliance',
  'Sin certificación',
]

const PRESENTATION_OPTIONS = [
  'Microlote (menos de 10 sacos)',
  'Granel-saco',
  'GrainPro 60kg',
  'Caja',
  'Bolsa al vacío',
]

const CONDITION_OPTIONS = [
  'Nuevo',
  'Usado (Reacondicionado)',
  'Usado (En condición actual)',
]

const SALE_MODE_OPTIONS = ['Venta directa', 'Arriendo-Leasing', 'Subasta']

const INCLUDED_SERVICES = [
  'Instalación técnica',
  'Capacitación',
  'Garantía 12 meses',
  'Servicio post-venta',
]

const SERVICE_MODE_OPTIONS = ['Presencial', 'Virtual', 'Híbrido']

/* ─── ESQUEMA POR SUBCATEGORÍA ──────────────────────────────── */

export const PUBLICATION_ATTRIBUTES: Record<string, AttributeField[]> = {
  /* ── Categoría A — Café e Insumos ────────────────────────── */
  'A-verde': [
    { key: 'Proceso de beneficiado', type: 'multiselect', options: PROCESS_OPTIONS, required: true },
    { key: 'Variedad botánica', type: 'multiselect', options: VARIETY_OPTIONS, required: true },
    ...originFields({ required: true }),
    { key: 'Altitud de cultivo', type: 'select', options: ALTITUDE_OPTIONS },
    { key: 'Puntuación SCA', type: 'select', options: SCA_OPTIONS },
    { key: 'Año de cosecha', type: 'text', placeholder: '2025' },
    { key: 'Certificaciones', type: 'multiselect', options: CERTIFICATION_OPTIONS },
    { key: 'Notas de taza', type: 'text', placeholder: 'Maracuyá, jazmín, miel...' },
    { key: 'Presentación de despacho', type: 'multiselect', options: PRESENTATION_OPTIONS },
  ],
  'A-pergamino': [
    { key: 'Proceso de beneficiado', type: 'multiselect', options: PROCESS_OPTIONS, required: true },
    { key: 'Variedad botánica', type: 'multiselect', options: VARIETY_OPTIONS, required: true },
    ...originFields({ required: true }),
    { key: 'Altitud de cultivo', type: 'select', options: ALTITUDE_OPTIONS },
    {
      key: 'Humedad %',
      type: 'number',
      placeholder: '11.5',
      suffix: '%',
      min: 0,
      max: 20,
      step: 0.1,
      helper: 'Café pergamino se comercializa con humedad entre 10% y 12%.',
    },
    { key: 'Año de cosecha', type: 'text', placeholder: '2025' },
    { key: 'Certificaciones', type: 'multiselect', options: CERTIFICATION_OPTIONS },
  ],
  'A-tostado': [
    { key: 'Nivel de tueste', type: 'select', options: ROAST_OPTIONS, required: true },
    { key: 'Proceso de beneficiado', type: 'multiselect', options: PROCESS_OPTIONS },
    { key: 'Variedad botánica', type: 'multiselect', options: VARIETY_OPTIONS, required: true },
    ...originFields({ required: true }),
    { key: 'Puntuación SCA', type: 'select', options: SCA_OPTIONS },
    { key: 'Fecha de tueste', type: 'text', placeholder: '12 jul 2026' },
    { key: 'Certificaciones', type: 'multiselect', options: CERTIFICATION_OPTIONS },
    { key: 'Notas de taza', type: 'text', placeholder: 'Chocolate, caramelo...' },
  ],
  'A-molido': [
    { key: 'Nivel de tueste', type: 'select', options: ROAST_OPTIONS, required: true },
    { key: 'Variedad botánica', type: 'multiselect', options: VARIETY_OPTIONS },
    ...originFields(),
    { key: 'Tipo de molienda', type: 'select', options: ['Fina (espresso)', 'Media (filtro)', 'Gruesa (prensa francesa)'] },
    { key: 'Fecha de tueste', type: 'text', placeholder: '12 jul 2026' },
    { key: 'Certificaciones', type: 'multiselect', options: CERTIFICATION_OPTIONS },
  ],
  'A-soluble': [
    { key: 'Tipo', type: 'select', options: ['Liofilizado', 'Spray-dry', 'Aglomerado'] },
    { key: 'Variedad botánica', type: 'multiselect', options: VARIETY_OPTIONS },
    { key: 'Certificaciones', type: 'multiselect', options: CERTIFICATION_OPTIONS },
  ],
  'A-subproductos': [
    { key: 'Tipo de subproducto', type: 'select', options: ['Cáscara', 'Pulpa', 'Harina', 'Mucílago seco', 'Otros'] },
    ...originFields(),
    { key: 'Aplicación', type: 'text', placeholder: 'Infusiones, abono...' },
  ],
  'A-plantas': [
    { key: 'Variedad botánica', type: 'multiselect', options: VARIETY_OPTIONS, required: true },
    { key: 'Edad de la planta', type: 'select', options: ['Semilla', '0-3 meses', '3-6 meses', '6-12 meses', 'Más de 1 año'] },
    { key: 'Resistencia a roya', type: 'select', options: ['Alta', 'Media', 'Baja', 'No determinada'] },
  ],
  'A-fertilizantes': [
    { key: 'Tipo', type: 'select', options: ['Orgánico', 'Mineral', 'Biofertilizante', 'Foliar', 'Otros'], required: true },
    { key: 'Formulación NPK', type: 'text', placeholder: '15-15-15' },
    { key: 'Presentación', type: 'select', options: ['Granular', 'Líquido', 'Polvo'] },
  ],
  'A-empaques': [
    { key: 'Material', type: 'select', options: ['Yute', 'Kraft', 'Aluminio', 'Plástico BOPP', 'Compostable'], required: true },
    { key: 'Con válvula desgasificadora', type: 'select', options: ['Sí', 'No'] },
    { key: 'Capacidades disponibles', type: 'text', placeholder: '250g, 500g, 1kg' },
    { key: 'Personalizable', type: 'select', options: ['Sí', 'No'] },
  ],
  'A-laboratorio': [
    { key: 'Tipo de insumo', type: 'select', options: ['Material de cata', 'Reactivos', 'Recipientes', 'Tarjetas SCA', 'Otros'] },
    { key: 'Marca', type: 'text', placeholder: 'Ej. Hario, Brewista...' },
  ],

  /* ── Categoría B — Maquinaria y Equipo ──────────────────── */
  'B-finca': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Marca', type: 'text', placeholder: 'Ej. Penagos, Pinhalense...' },
    { key: 'Modelo', type: 'text' },
    { key: 'Servicios incluidos', type: 'multiselect', options: INCLUDED_SERVICES },
  ],
  'B-secado': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Capacidad (qq por ciclo)', type: 'number', suffix: 'qq' },
    { key: 'Tipo', type: 'select', options: ['Patio solar', 'Secador rotativo', 'Secador estático', 'Carpa solar', 'Otros'] },
    { key: 'Servicios incluidos', type: 'multiselect', options: INCLUDED_SERVICES },
  ],
  'B-tostadoras': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Marca', type: 'text', placeholder: 'Probat, Loring, Diedrich...' },
    { key: 'Modelo', type: 'text' },
    { key: 'Capacidad por batch (kg)', type: 'number', suffix: 'kg' },
    { key: 'Tipo de combustible', type: 'select', options: ['Gas', 'Eléctrico', 'Híbrido'] },
    { key: 'Servicios incluidos', type: 'multiselect', options: INCLUDED_SERVICES },
  ],
  'B-molinos': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Marca', type: 'text' },
    { key: 'Modelo', type: 'text' },
    { key: 'Tipo de fresas', type: 'select', options: ['Cónicas', 'Planas', 'Cerámicas'] },
    { key: 'Capacidad (kg/h)', type: 'number', suffix: 'kg/h' },
  ],
  'B-extraccion': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Marca', type: 'text' },
    { key: 'Modelo', type: 'text' },
    { key: 'Número de grupos', type: 'select', options: ['1 grupo', '2 grupos', '3 grupos', '4 grupos'] },
    { key: 'Servicios incluidos', type: 'multiselect', options: INCLUDED_SERVICES },
  ],
  'B-accesorios': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Tipo', type: 'text', placeholder: 'Tampers, jarras, balanzas...' },
    { key: 'Marca', type: 'text' },
  ],
  'B-empaque': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Tipo', type: 'select', options: ['Selladora manual', 'Selladora semi-automática', 'Selladora automática', 'Empacadora al vacío'] },
    { key: 'Capacidad (bolsas/min)', type: 'number', suffix: 'bolsas/min' },
  ],
  'B-laboratorio': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Tipo', type: 'select', options: ['Tostador de muestras', 'Molino de cata', 'Refractómetro', 'Medidor humedad', 'Otros'] },
    { key: 'Marca', type: 'text' },
  ],
  'B-silos': [
    { key: 'Estado', type: 'select', options: CONDITION_OPTIONS, required: true },
    { key: 'Condición de venta', type: 'select', options: SALE_MODE_OPTIONS, required: true },
    { key: 'Capacidad (qq)', type: 'number', suffix: 'qq' },
    { key: 'Material', type: 'select', options: ['Acero galvanizado', 'Acero inoxidable', 'Polipropileno'] },
  ],
  'B-repuestos': [
    { key: 'Equipo compatible', type: 'text', placeholder: 'Marca y modelo' },
    { key: 'Tipo de pieza', type: 'text' },
    { key: 'Origen', type: 'select', options: ['Original', 'Genérico'] },
  ],
  'B-servicio': [
    { key: 'Tipo de servicio', type: 'select', options: ['Instalación', 'Mantenimiento preventivo', 'Reparación', 'Calibración', 'Consultoría técnica'], required: true },
    { key: 'Cobertura', type: 'text', placeholder: 'Departamentos donde atiende' },
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS },
  ],

  /* ── Categoría C — Servicios Profesionales ──────────────── */
  'C-agro': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS, required: true },
    { key: 'Departamento donde se realiza', type: 'multiselect', options: BOLIVIAN_DEPARTMENTS },
    { key: 'Duración', type: 'text', placeholder: 'Ej. 1 visita, 6 meses...' },
    { key: 'Idiomas', type: 'multiselect', options: ['Español', 'Inglés', 'Quechua', 'Aymara'] },
  ],
  'C-calidad': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS, required: true },
    { key: 'Tipo de servicio', type: 'select', options: ['Auditoría', 'Implementación trazabilidad', 'Análisis sensorial', 'Otros'] },
    { key: 'Idiomas', type: 'multiselect', options: ['Español', 'Inglés'] },
  ],
  'C-procesamiento': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS },
    { key: 'Capacidad por mes (qq)', type: 'number', suffix: 'qq' },
    { key: 'Tipos de proceso ofrecidos', type: 'multiselect', options: PROCESS_OPTIONS },
  ],
  'C-barismo': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS, required: true },
    { key: 'Nivel', type: 'select', options: ['Básico', 'Intermedio', 'Avanzado', 'Certificación SCA'] },
    { key: 'Duración (horas)', type: 'number', suffix: 'h' },
    { key: 'Cupos máximos', type: 'number' },
  ],
  'C-tostado': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS, required: true },
    { key: 'Nivel', type: 'select', options: ['Básico', 'Intermedio', 'Avanzado'] },
    { key: 'Duración (horas)', type: 'number', suffix: 'h' },
    { key: 'Tostadoras utilizadas', type: 'text', placeholder: 'Marca y modelo' },
  ],
  'C-catacion': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS, required: true },
    { key: 'Nivel', type: 'select', options: ['Introductorio', 'Q Arabica', 'Q Robusta', 'Otros'] },
    { key: 'Duración (horas)', type: 'number', suffix: 'h' },
    { key: 'Certificado al finalizar', type: 'select', options: ['Sí', 'No'] },
  ],
  'C-negocios': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS },
    { key: 'Área', type: 'select', options: ['Estrategia comercial', 'Finanzas', 'Operaciones', 'Marketing', 'Exportación'] },
  ],
  'C-marca': [
    { key: 'Modalidad', type: 'select', options: SERVICE_MODE_OPTIONS },
    { key: 'Servicios', type: 'multiselect', options: ['Branding', 'Identidad visual', 'Empaque', 'Sitio web', 'Redes sociales', 'Fotografía'] },
  ],
  'C-logistica': [
    { key: 'Modalidad', type: 'select', options: ['Terrestre nacional', 'Refrigerado', 'Almacenaje', 'Internacional / Exportación'] },
    { key: 'Cobertura', type: 'text', placeholder: 'Departamentos o países' },
  ],

  /* ── Categoría D — Terrenos y Fincas ────────────────────── */
  'D-produccion': [
    { key: 'Superficie (hectáreas)', type: 'number', suffix: 'ha', required: true },
    { key: 'Hectáreas en producción', type: 'number', suffix: 'ha' },
    { key: 'Variedades sembradas', type: 'multiselect', options: VARIETY_OPTIONS },
    { key: 'Altitud (msnm)', type: 'text', placeholder: '1500–1800' },
    { key: 'Producción anual estimada (qq)', type: 'number', suffix: 'qq' },
    { key: 'Departamento', type: 'select', options: BOLIVIAN_DEPARTMENTS, required: true },
    { key: 'Documentación', type: 'multiselect', options: ['Folio Real', 'Plano georreferenciado', 'Certificación orgánica', 'Otros'] },
  ],
  'D-lote': [
    { key: 'Superficie (hectáreas)', type: 'number', suffix: 'ha', required: true },
    { key: 'Aptitud cafetalera', type: 'select', options: ['Alta', 'Media', 'Por evaluar'] },
    { key: 'Altitud (msnm)', type: 'text' },
    { key: 'Departamento', type: 'select', options: BOLIVIAN_DEPARTMENTS, required: true },
    { key: 'Acceso a agua', type: 'select', options: ['Pozo', 'Río / ojo de agua', 'Lluvia', 'No identificado'] },
  ],
  'D-infraestructura': [
    { key: 'Superficie (hectáreas)', type: 'number', suffix: 'ha', required: true },
    { key: 'Infraestructura disponible', type: 'multiselect', options: ['Beneficio húmedo', 'Beneficio seco', 'Patio de secado', 'Bodega', 'Vivienda', 'Cuartel de tueste'] },
    { key: 'Departamento', type: 'select', options: BOLIVIAN_DEPARTMENTS, required: true },
    { key: 'Estado de infraestructura', type: 'select', options: ['Excelente', 'Buena', 'Requiere mantenimiento'] },
  ],
  'D-terreno': [
    { key: 'Superficie (hectáreas)', type: 'number', suffix: 'ha', required: true },
    { key: 'Departamento', type: 'select', options: BOLIVIAN_DEPARTMENTS, required: true },
    { key: 'Tipo de suelo', type: 'text', placeholder: 'Franco-arcilloso, volcánico...' },
    { key: 'Pendiente', type: 'select', options: ['Plano', 'Ondulado', 'Pronunciado'] },
  ],
}

export function getAttributesForSubcategory(subcategoryId: string | null | undefined): AttributeField[] {
  if (!subcategoryId) return []
  return PUBLICATION_ATTRIBUTES[subcategoryId] ?? []
}

/* ─── COBERTURA DE DESPACHO ─────────────────────────────────── */

export const COVERAGE_OPTIONS: string[] = [
  'Todo Bolivia',
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Tarija',
  'Chuquisaca',
  'Beni',
  'Pando',
]

export const UNIT_PRESETS: string[] = [
  'Kilogramo',
  'Libra',
  'Gramo',
  'Quintal (46 kg)',
  'Saco (60 kg)',
  'Unidad',
  'Caja',
  'Servicio',
  'Hora',
  'Día',
  'Sesión',
  'Otro',
]
