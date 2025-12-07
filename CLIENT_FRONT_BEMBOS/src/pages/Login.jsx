import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar si ya está autenticado
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // El backend espera tenant_id en lugar de email
      const response = await AuthService.login({
        tenant_id: formData.email,
        password: formData.password
      });

      console.log('Login exitoso:', response);
      
      // Si el backend no devuelve el usuario completo, guardamos el email localmente
      // para que el Checkout pueda usarlo
      const userData = AuthService.getUserData() || {};
      if (!userData.email && !userData.tenant_id) {
        AuthService.setUserData({
          ...userData,
          email: formData.email,
          tenant_id: formData.email
        });
      }
      
      // Redirigir al home después del login exitoso
      navigate('/');
    } catch (err) {
      console.error('Error en login:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response) {
        // Error de la API
        setError(err.response.data.error || err.response.data.message || 'Credenciales incorrectas');
      } else if (err.request) {
        // Error de red
        setError('No se pudo conectar al servidor. Verifica tu conexión.');
      } else {
        // Otro tipo de error
        setError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Sección de Iniciar Sesión */}
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center font-display">
                INICIAR SESIÓN
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={20} className="text-red-500" />
                      <p className="text-sm text-red-700 font-semibold">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo electrónico <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ej. nombre@mail.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Aa12345"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent pr-12"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link 
                    to="/recuperar-contrasena" 
                    className="text-sm text-[#0033A0] hover:underline font-semibold"
                  >
                    Olvidé mi contraseña
                  </Link>
                </div>

                {/* reCAPTCHA placeholder */}
                <div className="bg-gray-100 p-4 rounded border border-gray-300 flex items-center justify-center">
                  <div className="text-center text-sm text-gray-600">
                    <div className="mb-2">☐ No soy un robot</div>
                    <div className="text-xs text-gray-500">
                      protección de reCAPTCHA<br />
                      Privacidad - Términos
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-bold py-3 px-6 rounded-full transition-colors text-lg ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#0033A0] text-white hover:bg-blue-800'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </form>
            </div>

            {/* Sección de Crear Cuenta */}
            <div className="bg-gray-50 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center font-display">
                CREAR CUENTA
              </h2>

              <div className="space-y-4 mb-8">
                <p className="text-gray-700 font-medium">
                  Crea una y aprovecha los beneficios:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-[#0033A0] text-xl">•</span>
                    <span className="text-gray-700">Realiza tus compras de manera más ágil.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0033A0] text-xl">•</span>
                    <span className="text-gray-700">Guarda múltiples direcciones de envío y facturación.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0033A0] text-xl">•</span>
                    <span className="text-gray-700">Realiza el seguimiento a tus compras y revisa tus pedidos realizados.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#0033A0] text-xl">•</span>
                    <span className="text-gray-700">Haz una lista de productos favoritos.</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full bg-[#0033A0] text-white font-bold py-3 px-6 rounded-full hover:bg-blue-800 transition-colors text-center text-lg block"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>

        {/* Mensaje de bloq mayus */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 bg-white px-4 py-2 rounded inline-block">
            Bloq Mayús desactivado
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
