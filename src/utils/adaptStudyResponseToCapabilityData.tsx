

/**
 * Convierte la respuesta de la API de estudio de capacidad al formato 
 * requerido por el componente CapabilityHistogram
 */
export const adaptStudyResponseToCapabilityData = (
  studyResults: any,
  ctq: any,  // Cambiado para recibir el objeto ctq completo
  unit: string
) => {
  return {
    raw_measurements: studyResults.raw_measurements || [],
    mean: studyResults.input_data?.mean || 0,
    std_dev: studyResults.input_data?.std_dev || 0,
    sample_size: studyResults.input_data?.sample_size || 0,
    cp: studyResults.results?.cp || 0,
    cpk: studyResults.results?.cpk || 0,
    histogram: {
      bins: studyResults.results?.histogram?.bins || [],
      counts: studyResults.results?.histogram?.counts || []
    },
    specification: {
      lsl: ctq?.specification?.lsl || 0,  // Obtener del objeto ctq
      usl: ctq?.specification?.usl || 0,   // Obtener del objeto ctq
      nominal: ctq?.specification?.nominal || 0  // Obtener del objeto ctq
    },
    unit: unit || '',
    ctq_name: ctq?.name || 'Característica'
  };
};