import axios from 'axios';

const AUTH_API_URL = `${import.meta.env.VITE_API_AUTH}/dev/users`;

// Clave para almacenar el token en localStorage
const TOKEN_KEY = 'bembos_auth_token';
const USER_KEY = 'bembos_user_data';

/**
 * Servicio para manejar autenticación y gestión de usuarios
 */
export const AuthService = {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario (email, password, nombre, etc.)
   * @returns {Promise<Object>} - Respuesta del registro
   */
  register: async (userData) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  /**
   * Inicia sesión de un usuario
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Respuesta con token y datos del usuario
   */
  login: async (credentials) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
      
      // Si el login es exitoso y devuelve un token, guardarlo
      if (response.data.token) {
        AuthService.setToken(response.data.token);
        
        // Si hay datos del usuario, guardarlos también
        if (response.data.user) {
          AuthService.setUserData(response.data.user);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Valida si un token es válido
   * @param {string} token - Token a validar (opcional, usa el almacenado si no se provee)
   * @returns {Promise<Object>} - Respuesta de validación
   */
  validateToken: async (token = null) => {
    try {
      const authToken = token || AuthService.getToken();
      
      if (!authToken) {
        throw new Error('No hay token para validar');
      }
      
      const response = await axios.get(`${AUTH_API_URL}/validate-token`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al validar token:', error);
      // Si el token no es válido, limpiarlo
      AuthService.logout();
      throw error;
    }
  },

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<Object>} - Datos del perfil del usuario
   */
  getProfile: async () => {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await axios.get(`${AUTH_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizar datos del usuario en localStorage
      if (response.data) {
        AuthService.setUserData(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  /**
   * Actualiza el perfil del usuario autenticado
   * @param {Object} profileData - Datos a actualizar
   * @returns {Promise<Object>} - Perfil actualizado
   */
  updateProfile: async (profileData) => {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await axios.put(`${AUTH_API_URL}/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizar datos del usuario en localStorage
      if (response.data) {
        AuthService.setUserData(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  // === Métodos para gestionar el token y datos del usuario ===

  /**
   * Guarda el token en localStorage
   * @param {string} token 
   */
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Obtiene el token de localStorage
   * @returns {string|null} - Token o null si no existe
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Guarda los datos del usuario en localStorage
   * @param {Object} userData 
   */
  setUserData: (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  /**
   * Obtiene los datos del usuario de localStorage
   * @returns {Object|null} - Datos del usuario o null
   */
  getUserData: () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!AuthService.getToken();
  },

  /**
   * Cierra la sesión del usuario (elimina token y datos)
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// Interceptor para agregar el token automáticamente a todas las peticiones
axios.interceptors.request.use(
  (config) => {
    // Solo agregar token si la URL es de nuestra API
    if (config.url && (config.url.includes('/api/') || config.url.includes('execute-api'))) {
      const token = AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si hay un error 401 (no autorizado), cerrar sesión
    if (error.response && error.response.status === 401) {
      AuthService.logout();
      // Redirigir al login si es necesario
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default AuthService;
