import axios from 'axios';

const COMBOS_API_URL = `${import.meta.env.VITE_API_COMBOS}/combos`;

/**
 * Servicio para manejar las operaciones relacionadas con combos
 */
export const ComboService = {
  /**
   * Obtiene la lista de combos según el tenant_id
   * @param {string} tenantId - ID del tenant (normalmente "Combos")
   * @returns {Promise<Array>} - Lista de combos con imagen pequeña
   * Ejemplo de respuesta:
   * [
   *   {
   *     "nombre": "combo_extrema",
   *     "descripcion": "Hamburguesa Extrema a la parrilla...",
   *     "precio": 25.0,
   *     "stock": 20,
   *     "imagen": "https://bucket-bembos-utec.s3.amazonaws.com/imagenes_combos/pequeno/..."
   *   }
   * ]
   */
  getCombosByTenant: async (tenantId = 'Combos') => {
    try {
      const response = await axios.get(`${COMBOS_API_URL}/${tenantId}`);
      
      // Si el backend devuelve un mensaje de error, retornar array vacío
      if (response.data.message && response.data.message.includes('No se encontraron')) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener combos del tenant ${tenantId}:`, error);
      
      // Si es un 404 o no hay combos, retornar array vacío
      if (error.response && error.response.status === 404) {
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Obtiene los detalles completos de un combo específico
   * @param {string} tenantId - ID del tenant (normalmente "Combos")
   * @param {string} nombreCombo - Nombre del combo
   * @returns {Promise<Object>} - Detalles del combo con imagen grande
   * Ejemplo de respuesta:
   * {
   *   "nombre": "combo_extrema",
   *   "tenant_id": "Combos",
   *   "descripcion": "Hamburguesa Extrema a la parrilla...",
   *   "tipo_promocion": "Sin Promocion",
   *   "porcentaje": 0,
   *   "Productos": [
   *     {
   *       "Nombre": "hamburguesa_extrema",
   *       "tamano": "grande",
   *       "cantidad_de_ese_producto_que_usa": 1
   *     },
   *     ...
   *   ],
   *   "precio": 25.0,
   *   "puntos_relacion": 10,
   *   "cantidad_de_puntos_necesarios": 0,
   *   "stock": 20,
   *   "imagen": "https://bucket-bembos-utec.s3.amazonaws.com/imagenes_combos/grande/..."
   * }
   */
  getComboDetail: async (tenantId = 'Combos', nombreCombo) => {
    try {
      const response = await axios.get(`${COMBOS_API_URL}/${tenantId}/${nombreCombo}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalle del combo ${nombreCombo}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todos los combos disponibles
   * @returns {Promise<Array>} - Array con todos los combos
   */
  getAllCombos: async () => {
    try {
      return await ComboService.getCombosByTenant('Combos');
    } catch (error) {
      console.error('Error al obtener todos los combos:', error);
      throw error;
    }
  }
};

export default ComboService;
