import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { MapPin, CreditCard, User, Phone, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../services/orderService';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializa Mercado Pago con tu Public Key
initMercadoPago(import.meta.env.VITE_PUBLIC_KEY);

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, prepareOrderData } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    reference: '',
    paymentMethod: 'CARD'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Obtener datos del usuario (email)
      const userData = JSON.parse(localStorage.getItem('bembos_user_data') || '{}');
      const userEmail = userData.email || 'guest@example.com';

      // 2. Generar UUIDs
      const generateUUID = () => {
        if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const orderUUID = generateUUID();
      const tenantId = 'restaurante_central_01';
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + 45 * 60000); // +45 min

      // 3. Construir el payload exacto que requiere el backend
      // Estructura plana según nueva especificación
      const paymentPayload = {
        tenant_id: tenantId,
        uuid: orderUUID,
        cliente_email: userEmail,
        origen: "LIMA - CENTRO, Av. Arequipa 123, Lima",
        destino: formData.address || "Dirección no especificada",
        fecha_pedido: now.toISOString(),
        fecha_entrega: deliveryTime.toISOString(),
        estado_pedido: "NUEVO",
        multiplicador_de_puntos: 1.5,
        delivery: true,
        imagen_combo_url: cartItems[0]?.imageUrl || import.meta.env.VITE_DEFAULT_COMBO_IMAGE,
        elementos: cartItems.map(item => ({
            combo: [item.name || item.nombre_producto || "Combo"],
            cantidad_combo: item.quantity || 1,
            precio: parseFloat(item.price || item.precio || 0),
            productos: {
                hamburguesa: [
                    {
                        nombre: item.name || "Hamburguesa",
                        ingredientes: item.ingredientes || ["Carne", "Queso"],
                        tamaño: item.selectedSize || "Regular",
                        extra: item.observaciones || "Ninguno"
                    }
                ],
                papas: item.papas || ["Papas Fritas"],
                complementos: item.complementos || ["Bebida"],
                adicionales: item.adicionales || []
            }
        }))
      };

      // 4. Llamar al servicio de pago real
      console.log("Enviando pago...", paymentPayload);
      const response = await OrderService.processPayment(paymentPayload);
      console.log("Respuesta de pago:", response);

      // 5. Guardar datos para seguimiento (Status y Historial)
      localStorage.setItem('last_order_info', JSON.stringify({
        tenant_id: tenantId,
        uuid: orderUUID,
        timestamp: Date.now()
      }));

      setOrderId(orderUUID);
      
      // 6. Obtener preference_id y mostrar botón de Mercado Pago
      if (response.preference_id || response.preferenceId) {
        setPreferenceId(response.preference_id || response.preferenceId);
      } else {
        // Fallback si no hay preference_id (ej. pago en efectivo o error)
        setOrderComplete(true);
        clearCart();
      }
      
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Hubo un error al procesar tu pedido. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#193058] mb-2">¡Pedido Recibido!</h2>
          <p className="text-gray-600 mb-6">
            Tu pedido <span className="font-bold text-[#193058]">#{orderId}</span> ha sido procesado exitosamente.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-blue-800 font-semibold mb-1">Estado: <span className="text-blue-600">En Cocina</span></p>
            <p className="text-xs text-blue-600">Tu comida está siendo preparada con los mejores ingredientes.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#ffb500] hover:bg-[#e5a300] text-[#193058] font-bold py-3 rounded-full transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-[#193058] mb-4">Tu carrito está vacío</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#ffb500] hover:bg-[#e5a300] text-[#193058] font-bold py-2 px-6 rounded-full transition-colors"
        >
          Ir a comprar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#193058] mb-8 text-center">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#193058] mb-4 flex items-center gap-2">
                <User size={20} /> Datos Personales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ej. Juan Perez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ej. 999888777"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#193058] mb-4 flex items-center gap-2">
                <MapPin size={20} /> Dirección de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input 
                    type="text" 
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ej. Av. Larco 123, Miraflores"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                  <input 
                    type="text" 
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ej. Frente al parque, puerta azul"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#193058] mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Método de Pago
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CARD' }))}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.paymentMethod === 'CARD' 
                      ? 'border-[#ffb500] bg-yellow-50 text-[#193058]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="font-bold">Tarjeta</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CASH' }))}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.paymentMethod === 'CASH' 
                      ? 'border-[#ffb500] bg-yellow-50 text-[#193058]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl font-bold">S/</span>
                  <span className="font-bold">Efectivo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#193058] mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <span className="font-bold text-[#193058]">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="font-bold text-[#193058]">S/ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>S/ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>S/ 5.00</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-[#193058] pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>S/ {(cartTotal + 5).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading || preferenceId}
                className={`w-full font-bold py-3 rounded-full transition-colors flex justify-center items-center ${
                  loading || preferenceId 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#ffb500] hover:bg-[#e5a300] text-[#193058]'
                }`}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-[#193058] border-t-transparent rounded-full animate-spin"></span>
                ) : preferenceId ? (
                  'Procesando pago...'
                ) : (
                  'CONFIRMAR PEDIDO'
                )}
              </button>

              {/* Botón de Mercado Pago */}
              {preferenceId && (
                <div className="mt-4 w-full">
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-3 text-center text-sm font-semibold">
                    ✅ Pedido registrado. Completa el pago abajo:
                  </div>
                  <div className="mercadopago-button-container">
                    <Wallet 
                      initialization={{ preferenceId: preferenceId, redirectMode: 'self' }} 
                      onReady={() => console.log("Wallet ready")}
                      onSubmit={() => console.log("Wallet submitted")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
