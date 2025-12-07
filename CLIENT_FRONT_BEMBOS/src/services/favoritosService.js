import axios from 'axios';
import { AuthService } from './authService';

const FAVORITOS_API_URL = `${import.meta.env.VITE_API_FAVORITOS}/prod/favoritos`;

/**
 * Servicio para manejar las operaciones relacionadas con favoritos
 */
export const FavoritosService = {
  /**
   * Obtiene la lista de favoritos del usuario autenticado
   * @returns {Promise<Array>} - Lista de favoritos
   */
  getFavoritos: async () => {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Inicia sesión primero.');
      }
      
      const response = await axios.get(FAVORITOS_API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.favoritos)) {
        return response.data.favoritos;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      console.warn('La respuesta de favoritos no es un array:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      throw error;
    }
  },

  /**
   * Agrega un producto a favoritos
   * @param {Object} favorito - Datos del favorito
   * @param {string} favorito.nombre - Nombre del producto
   * @param {string} favorito.descripcion - Descripción del producto
   * @param {number} favorito.precio - Precio del producto
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  addFavorito: async (favorito) => {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Inicia sesión primero.');
      }
      
      const response = await axios.post(
        FAVORITOS_API_URL,
        { favorito },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  },

  /**
   * Elimina un producto de favoritos
   * @param {Object} favorito - Datos del favorito a eliminar
   * @param {string} favorito.nombre - Nombre del producto
   * @param {string} favorito.descripcion - Descripción del producto
   * @param {number} favorito.precio - Precio del producto
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  removeFavorito: async (favorito) => {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Inicia sesión primero.');
      }
      
      const response = await axios.delete(FAVORITOS_API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { favorito }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  },

  /**
   * Verifica si un producto está en favoritos
   * @param {string} nombreProducto - Nombre del producto a verificar
   * @returns {Promise<boolean>} - true si está en favoritos, false si no
   */
  isFavorito: async (nombreProducto) => {
    try {
      const favoritos = await FavoritosService.getFavoritos();
      return favoritos.some(fav => fav.nombre === nombreProducto);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  },

  /**
   * Alterna el estado de favorito de un producto (agregar si no existe, eliminar si existe)
   * @param {Object} favorito - Datos del favorito
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  toggleFavorito: async (favorito) => {
    try {
      const esFavorito = await FavoritosService.isFavorito(favorito.nombre);
      
      if (esFavorito) {
        return await FavoritosService.removeFavorito(favorito);
      } else {
        return await FavoritosService.addFavorito(favorito);
      }
    } catch (error) {
      console.error('Error al alternar favorito:', error);
      throw error;
    }
  }
};

export default FavoritosService;
