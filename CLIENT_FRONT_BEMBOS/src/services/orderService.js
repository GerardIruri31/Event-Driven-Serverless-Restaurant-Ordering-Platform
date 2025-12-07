import axios from 'axios';

// URL base para el endpoint de pago
const PAYMENT_API_URL = import.meta.env.VITE_API_PAGOS;

// Obtiene la URL de la variable de entorno (crear archivo .env)
const API_BASE_URL = import.meta.env.VITE_API_PEDIDOS;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const OrderService = {
  /**
   * Procesa el pago y crea el pedido en el sistema serverless
   * @param {Object} paymentPayload - JSON con la estructura requerida por el backend
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  processPayment: async (paymentPayload) => {
    try {
      const response = await axios.post(`${PAYMENT_API_URL}/pagar`, paymentPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error en processPayment:", error);
      throw error;
    }
  },

  /**
   * Obtiene el estado específico de un pedido (Future implementation)
   * @param {string} tenantId 
   * @param {string} uuid 
   */
  getOrderStatus: async (tenantId, uuid) => {
    // TODO: Implementar cuando el endpoint esté listo
    // Endpoint esperado: POST (body: { tenant_id, uuid })
    console.log("Consultando estado para:", tenantId, uuid);
    return { status: "PENDING", message: "Endpoint no implementado aún" };
  },

  /**
   * Obtiene la lista de pedidos de un usuario (Future implementation)
   * @param {string} email 
   */
  getUserOrders: async (email) => {
    // TODO: Implementar cuando el endpoint esté listo
    // Endpoint esperado: POST (body: { email })
    console.log("Consultando historial para:", email);
    return { orders: [], message: "Endpoint no implementado aún" };
  },

  /**
   * Envía un nuevo pedido al backend (Lambda -> DynamoDB)
   * @param {Object} orderData - Datos del pedido (cliente, items, total)
   * @returns {Promise<Object>} - Respuesta del servidor con el orderId
   */
  createOrder: async (orderData) => {
    try {
      // DESCOMENTAR CUANDO EL BACKEND ESTÉ LISTO:
      // const response = await api.post('/orders', orderData);
      // return response.data;

      // MOCK (SIMULACIÓN) PARA DEMOSTRACIÓN:
      console.log("Simulando envío a API:", API_BASE_URL + '/orders', orderData);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay artificial
      
      return {
        success: true,
        orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
        message: "Pedido creado exitosamente (Simulado)",
        status: "RECEIVED"
      };
    } catch (error) {
      console.error("Error en createOrder:", error);
      throw error;
    }
  },

  /**
   * Obtiene el estado de un pedido
   * @param {string} orderId 
   */
  getOrderStatus: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting order status:", error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de productos (Categorías y Productos)
   */
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  }
};

export default api;
