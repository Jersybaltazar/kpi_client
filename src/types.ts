// Definición de tipos para la aplicación Analizador de Capacidad

// Tipos para las respuestas de la API

/**
 * Especificaciones de CTQ
 */
export interface CTQSpecification {
  usl: number;
  lsl: number;
  nominal: number;
  tolerance: number;
  midpoint: number;
}

export interface CTQResponse {
  id: string;
  process_id: string;
  process_name: string; // Nombre del proceso
  name: string;
  unit: string;
  specification: CTQSpecification; // Especificaciones anidadas
}
  /**
   * Lista de CTQs desde la API
   */
  export interface CTQListResponse {
    items: CTQResponse[];
    total: number;
  }
  
  /**
   * Interpretaciones de los índices de capacidad
   */
  export interface CapabilityInterpretations {
    cp?: string;
    cpk?: string;
    k?: string;
    cpm?: string;
    cr?: string;
    cpl?: string;
    cpu?: string;
  }
  
  /**
   * Resultados del cálculo de capacidad
   */
  export interface CapabilityResults {
    cp?: number | null;
    cpk?: number | null;
    k?: number | null;
    cpm?: number | null;
    cr?: number | null;
    cpl?: number | null;
    cpu?: number | null;
    interpretation?: CapabilityInterpretations;
    errors?: string[];
  }
  
  /**
   * Respuesta de estudio de capacidad
   */
  export interface StudyResponse {
    id: string;
    ctq_id: string;
    name?: string;
    description?: string;
    data: number[];
    sample_size: number;
    input_mean: number;
    input_std_dev: number;
    results: CapabilityResults;
    created_at: string;
  }
  
  /**
   * Lista de estudios desde la API
   */
  export interface StudyListResponse {
    items: StudyResponse[];
    total: number;
  }
  
  /**
   * Datos para crear un nuevo estudio
   */
  export interface CreateStudyRequest {
    ctq_id: string;
    name?: string;
    description?: string;
    data: number[];
  }
  
  /**
   * Datos para crear un nuevo CTQ
   */
  export interface CreateCTQRequest {
    name: string;
    process: string;
    specification: {
      lsl: number;
      usl: number;
      nominal?: number;
      unit: string;
    };
  }
  
  /**
   * Estado de API genérico
   */
  export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
  }
  
  /**
   * Datos del histograma para visualización
   */
  export interface HistogramData {
    bins: number[];
    frequencies: number[];
    normalCurve: {x: number, y: number}[];
  }
  
  /**
   * Prop types para componentes de gráficos
   */
  export interface ChartProps {
    mean: number;
    stdDev: number;
    lsl: number;
    usl: number;
    nominal?: number;
    data?: number[];
  }
  
  /**
   * Error de API
   */
  export interface ApiError {
    message: string;
    code?: string;
    details?: any;
  }

  /**
 * Datos para solicitar la creación de un nuevo CTQ
 */
  export interface CTQCreationRequest {
    process_id: string; // ID del proceso seleccionado
    name: string;
    unit: string;
    usl: number;
    lsl: number;
    nominal?: number;
  }

/**
 * Datos para solicitar la creación de un nuevo estudio de capacidad
 */
export interface StudyCreationRequest {
  name?: string;
  description?: string;
  data: number[];
  // Opciones adicionales para el análisis (opcionales)
  analysis_options?: {
    custom_mean?: number;         // Media personalizada (en lugar de calculada)
    custom_std_dev?: number;      // Desviación estándar personalizada
    confidence_level?: number;    // Nivel de confianza para intervalos (ej: 0.95)
    use_sample_std?: boolean;     // Usar desviación estándar de muestra (s) o población (σ)
  };
}
// Añadir tipo para Process
export interface Process {
  id: string;
  name: string;
  description?: string;
}

// Añadir tipo para respuesta de API de procesos
export interface ProcessListResponse {
  items: Process[];
  total: number;
}

export interface StudyRequest {
  raw_measurements: number[];
  study_date_override?: string;
}

export interface StudyResponse {
  id: string;
  ctq_id: string;
  study_date: string;
  input_data: {
    mean: number;
    std_dev: number;
    sample_size: number;
  };
  results: CapabilityResults;
}
