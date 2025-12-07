import axios from 'axios';

const LOCALES_API_URL = `${import.meta.env.VITE_API_LOCALES}/prod/locales`;

/**
 * Servicio para manejar las operaciones relacionadas con locales/tiendas
 */
export const LocalesService = {
  /**
   * Obtiene la lista de todos los locales
   * @returns {Promise<Array>} - Lista de locales
   * Ejemplo de respuesta:
   * [
   *   {
   *     "created_at": "2025-11-29T06:12:43.811592",
   *     "tipo_despacho": ["Envio a domicilio", "Retiro en tienda"],
   *     "tenant_id": "LIMA#CENTRO",
   *     "telefono": "987654321",
   *     "direccion": "Av. Arequipa 123, Lima"
   *   }
   * ]
   */
  getAllLocales: async () => {
    try {
      const response = await axios.get(LOCALES_API_URL);
      return response.data;
    } catch (error) {
      console.error('Error al obtener locales:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un local específico
   * @param {string} tenantId - ID del local (ej: "LIMA#CENTRO")
   * @returns {Promise<Object>} - Detalles del local incluyendo latitud y longitud
   * Ejemplo de respuesta:
   * {
   *   "created_at": "2025-11-29T06:12:43.811592",
   *   "latitud": "-12.046374",
   *   "tipo_despacho": ["Envio a domicilio", "Retiro en tienda"],
   *   "tenant_id": "LIMA#CENTRO",
   *   "telefono": "987654321",
   *   "longitud": "-77.042793",
   *   "direccion": "Av. Arequipa 123, Lima"
   * }
   */
  getLocalById: async (tenantId) => {
    try {
      // Codificar el tenantId para manejar el caracter #
      const encodedTenantId = encodeURIComponent(tenantId);
      const response = await axios.get(`${LOCALES_API_URL}/${encodedTenantId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener local ${tenantId}:`, error);
      throw error;
    }
  },

  /**
   * Filtra locales por query de búsqueda
   * @param {string} query - Texto de búsqueda
   * @returns {Promise<Array>} - Locales que coinciden con la búsqueda
   * Ejemplo de respuesta:
   * {
   *   "results": [
   *     {
   *       "created_at": "2025-11-29T06:12:43.811592",
   *       "tipo_despacho": ["Envio a domicilio", "Retiro en tienda"],
   *       "tenant_id": "LIMA#CENTRO",
   *       "telefono": "987654321",
   *       "direccion": "Av. Arequipa 123, Lima"
   *     }
   *   ]
   * }
   */
  filterLocales: async (query) => {
    try {
      const response = await axios.get(`${LOCALES_API_URL}/filtro`, {
        params: { q: query }
      });
      return response.data.results || [];
    } catch (error) {
      console.error(`Error al filtrar locales con query "${query}":`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo local
   * @param {Object} localData - Datos del local a crear
   * @returns {Promise<Object>} - Local creado
   */
  createLocal: async (localData) => {
    try {
      const response = await axios.post(LOCALES_API_URL, localData);
      return response.data;
    } catch (error) {
      console.error('Error al crear local:', error);
      throw error;
    }
  }
};

export default LocalesService;
