import axios from 'axios';

const PRODUCTS_API_URL = `${import.meta.env.VITE_API_PRODUCTOS}/producto`;

/**
 * Servicio para manejar las operaciones relacionadas con productos
 */
export const ProductService = {
  /**
   * Obtiene la lista de productos según el tenant_id (categoría)
   * @param {string} tenantId - ID del tenant (ej: "Hamburguesa", "Bebidas", etc.)
   * @returns {Promise<Array>} - Lista de productos con imagen pequeña
   * Ejemplo de respuesta:
   * [
   *   {
   *     "nombre_producto": "hamburgesa_black_friday_extrema",
   *     "descripcion": "Hamburguesa especial de Black Friday...",
   *     "precio": 20.0,
   *     "stock": 12,
   *     "imagen": "https://bucket-bembos-utec.s3.amazonaws.com/..."
   *   }
   * ]
   */
  getProductsByTenant: async (tenantId) => {
    try {
      const response = await axios.get(`${PRODUCTS_API_URL}/${tenantId}`);
      
      // Si el backend devuelve un mensaje de error, lanzar excepción
      if (response.data.message && response.data.message.includes('No se encontraron')) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener productos del tenant ${tenantId}:`, error);
      
      // Si es un 404 o no hay productos, retornar array vacío
      if (error.response && error.response.status === 404) {
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Obtiene los detalles completos de un producto específico
   * @param {string} tenantId - ID del tenant
   * @param {string} nombreProducto - Nombre del producto
   * @returns {Promise<Object>} - Detalles del producto con imagen grande
   * Ejemplo de respuesta:
   * {
   *   "nombre_producto": "hamburgesa_black_friday_extrema",
   *   "tenant_id": "Hamburguesa",
   *   "descripcion": "Hamburguesa especial...",
   *   "ordenamiento": "123e4567#F",
   *   "tipo_promocion": "Sin promocion",
   *   "porcentaje": 0,
   *   "tamano": ["grande", "pequeno"],
   *   "precio_extra": 3.0,
   *   "precio": 20.0,
   *   "puntos_extra": 3,
   *   "puntos_general": 10,
   *   "stock": 12,
   *   "imagen": "https://bucket-bembos-utec.s3.amazonaws.com/...grande..."
   * }
   */
  getProductDetail: async (tenantId, nombreProducto) => {
    try {
      const response = await axios.get(`${PRODUCTS_API_URL}/${tenantId}/${nombreProducto}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalle del producto ${nombreProducto}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todos los productos de todas las categorías
   * (Útil para páginas que muestran todos los productos)
   * @param {Array<string>} tenantIds - Array de IDs de tenants a consultar
   * @returns {Promise<Array>} - Array con todos los productos
   */
  getAllProducts: async (tenantIds = ['Hamburguesa', 'Bebidas', 'Extras', 'Postres']) => {
    try {
      const promises = tenantIds.map(tenantId => 
        ProductService.getProductsByTenant(tenantId)
      );
      
      const results = await Promise.all(promises);
      
      // Aplanar el array y agregar la categoría a cada producto
      const allProducts = results.flatMap((products, index) => 
        products.map(product => ({
          ...product,
          categoria: tenantIds[index]
        }))
      );
      
      return allProducts;
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw error;
    }
  }
};

export default ProductService;
