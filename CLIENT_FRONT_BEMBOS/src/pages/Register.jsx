import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import AuthService from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    docType: '',
    docNumber: '',
    phone: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPromotions: false,
    acceptDataTransfer: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar que aceptó los términos
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      setLoading(false);
      return;
    }

    try {
      // Preparar datos para el backend
      // Estructura requerida por el Lambda:
      // { nombre, apellidos, tipo_documento, documento, numero, fecha_nacimiento, tenant_id, password }
      const registerData = {
        nombre: formData.firstName,
        apellidos: formData.lastName,
        tipo_documento: formData.docType.toUpperCase(), // Asegurar mayúsculas
        documento: formData.docNumber,
        numero: formData.phone,
        fecha_nacimiento: formData.birthDate,
        tenant_id: formData.email, // El backend usa tenant_id para el email
        password: formData.password,
        // Enviamos también los consentimientos por si el backend los procesa
        acepta_promociones: formData.acceptPromotions,
        acepta_transferencia: formData.acceptDataTransfer
      };

      console.log("Enviando datos de registro:", registerData);

      const response = await AuthService.register(registerData);
      console.log('Registro exitoso:', response);
      
      setSuccess(true);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error en registro:', err);
      
      if (err.response) {
        // Mostrar mensaje detallado si el backend lo envía
        const msg = err.response.data.error || err.response.data.message || 'Error al crear la cuenta';
        setError(`Error: ${msg}`);
      } else if (err.request) {
        setError('No se pudo conectar al servidor. Verifica tu conexión.');
      } else {
        setError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  // Helpers para fecha
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleDateChange = (field, value) => {
    const currentBirthDate = formData.birthDate ? new Date(formData.birthDate) : new Date();
    let day = field === 'day' ? parseInt(value) : (formData.birthDate ? parseInt(formData.birthDate.split('-')[2]) : 1);
    let month = field === 'month' ? parseInt(value) : (formData.birthDate ? parseInt(formData.birthDate.split('-')[1]) : 1);
    let year = field === 'year' ? parseInt(value) : (formData.birthDate ? parseInt(formData.birthDate.split('-')[0]) : currentYear - 20);

    // Validar días en el mes
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) day = daysInMonth;

    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      birthDate: formattedDate
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center font-display">
            CREA TU CUENTA EN BEMBOS Y HAZ TUS PEDIDOS
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  <p className="text-sm text-green-700 font-semibold">
                    ¡Cuenta creada exitosamente! Redirigiendo al login...
                  </p>
                </div>
              </div>
            )}

            {/* Información Personal */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información personal</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ej. Camila"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellidos <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Ej. Torres"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Documento <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="docType"
                    value={formData.docType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                    required
                  >
                    <option value="">Por favor Selecciona</option>
                    <option value="dni">DNI</option>
                    <option value="ce">Carnet de Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Documento <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="docNumber"
                    value={formData.docNumber}
                    onChange={handleChange}
                    placeholder="Selecciona un tipo de documento"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de teléfono <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha de nacimiento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      className="px-2 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
                      value={formData.birthDate ? parseInt(formData.birthDate.split('-')[2]) : ''}
                      onChange={(e) => handleDateChange('day', e.target.value)}
                    >
                      <option value="">Día</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                      className="px-2 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
                      value={formData.birthDate ? parseInt(formData.birthDate.split('-')[1]) : ''}
                      onChange={(e) => handleDateChange('month', e.target.value)}
                    >
                      <option value="">Mes</option>
                      {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select
                      className="px-2 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
                      value={formData.birthDate ? parseInt(formData.birthDate.split('-')[0]) : ''}
                      onChange={(e) => handleDateChange('year', e.target.value)}
                    >
                      <option value="">Año</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Inicio de Sesión */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de inicio de sesión</h2>
              
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
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar contraseña <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Aa12345"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="bg-gray-100 p-4 rounded border border-gray-300 flex items-center justify-center">
              <div className="text-center text-sm text-gray-600">
                <div className="mb-2">☐ No soy un robot</div>
                <div className="text-xs text-gray-500">
                  protección de reCAPTCHA<br />
                  Privacidad - Términos
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                  required
                />
                <span className="text-sm text-gray-700">
                  Al registrarse aceptas nuestros{' '}
                  <Link to="/terminos" className="text-[#0033A0] hover:underline">términos y condiciones</Link>
                  {' '}y nuestra{' '}
                  <Link to="/privacidad" className="text-[#0033A0] hover:underline">política de tratamiento de datos personales</Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptPromotions"
                  checked={formData.acceptPromotions}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                />
                <span className="text-sm text-gray-700">
                  Acepto recibir promociones y novedades
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptDataTransfer"
                  checked={formData.acceptDataTransfer}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                />
                <span className="text-sm text-gray-700">
                  Acepto la transferencia de datos a empresas asociadas
                </span>
              </label>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
              <Link
                to="/login"
                className="text-[#0033A0] hover:underline font-semibold flex items-center gap-2"
              >
                ← Ya tengo cuenta
              </Link>

              <button
                type="submit"
                disabled={loading || success}
                className={`w-full sm:w-auto font-bold py-3 px-12 rounded-full transition-colors text-lg ${
                  loading || success
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#0033A0] text-white hover:bg-blue-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando cuenta...
                  </span>
                ) : success ? (
                  'Cuenta creada ✓'
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
