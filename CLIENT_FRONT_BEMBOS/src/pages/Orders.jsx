import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, X, ShoppingBag, ChevronRight, CheckCircle, Truck, ChefHat, Box } from 'lucide-react';
import axios from 'axios';

const Orders = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrderDetails) {
      setImageError(false);
    }
  }, [selectedOrderDetails]);

  const calculateTotal = (order) => {
    if (order.precio_total) return parseFloat(order.precio_total);
    if (order.total) return parseFloat(order.total);
    if (order.elementos && Array.isArray(order.elementos)) {
      return order.elementos.reduce((acc, item) => {
        return acc + (parseFloat(item.precio) * parseFloat(item.cantidad_combo));
      }, 0);
    }
    return 0;
  };

  const fetchOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('bembos_user_data') || '{}');
      const email = userData.email;

      if (!email) {
        setError("No se encontró información del usuario.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_PEDIDOS}/pedidos/email`, {
        params: { cliente_email: email }
      });

      const allOrders = response.data.pedidos || response.data || [];
      
      if (!Array.isArray(allOrders)) {
        setHistoryOrders([]);
        setActiveOrders([]);
        return;
      }

      // Clasificar pedidos
      // Estados activos: PAGADO -> COCINA -> EMPAQUETAMIENTO -> DELIVERY
      const activeStatuses = ['NUEVO', 'PAGADO', 'COCINA', 'EMPAQUETAMIENTO', 'DELIVERY'];
      
      const active = allOrders.filter(order => activeStatuses.includes(order.estado_pedido));
      const history = allOrders.filter(order => order.estado_pedido === 'ENTREGADO');

      setActiveOrders(active);
      setHistoryOrders(history);

    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (order) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_PEDIDOS}/pedidos/id`, {
        params: { 
          tenant_id: order.tenant_id,
          uuid: order.uuid
        }
      });

      // La respuesta detallada viene en response.data.pedido según el JSON proporcionado
      if (response.data && response.data.pedido) {
        setSelectedOrderDetails(response.data.pedido);
      } else if (response.data) {
        // Fallback por si la estructura varía
        setSelectedOrderDetails(response.data);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setSelectedOrderDetails(order);
    }
  };

  const closeModal = () => {
    setSelectedOrderDetails(null);
  };

  const getProgressPercentage = (status) => {
    switch(status) {
      case 'PAGADO': return 10;
      case 'COCINA': return 35;
      case 'EMPAQUETAMIENTO': return 60;
      case 'DELIVERY': return 85;
      case 'ENTREGADO': return 100;
      default: return 5;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COCINA': return <ChefHat size={20} />;
      case 'EMPAQUETAMIENTO': return <Box size={20} />;
      case 'DELIVERY': return <Truck size={20} />;
      case 'ENTREGADO': return <CheckCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#193058] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-extrabold text-[#193058] mb-8 tracking-tight">Mis Pedidos</h1>

        {/* SECCIÓN: PEDIDOS EN CAMINO */}
        {activeOrders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#193058] mb-6 flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="text-[#ffb500]" size={24} />
              </div>
              Pedidos en Curso
            </h2>
            <div className="grid gap-6">
              {activeOrders.map((order) => {
                const progress = getProgressPercentage(order.estado_pedido);
                return (
                  <div 
                    key={order.uuid} 
                    onClick={() => handleOrderClick(order)}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-3 py-1 bg-blue-50 text-[#193058] text-xs font-bold rounded-full uppercase tracking-wider">
                              {order.tenant_id?.replace(/_/g, ' ') || 'Restaurante'}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">#{order.uuid?.slice(0, 8)}</span>
                          </div>
                          <h3 className="text-2xl font-black text-[#193058] flex items-center gap-2">
                            {getStatusIcon(order.estado_pedido)}
                            {order.estado_pedido}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Entrega estimada</p>
                          <p className="text-xl font-bold text-[#ffb500]">
                            {order.fecha_entrega ? new Date(order.fecha_entrega).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Timeline Visual */}
                      <div className="relative mt-8 mb-4">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#193058] to-[#ffb500] transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute right-0 top-0 bottom-0 w-full animate-pulse bg-white opacity-20"></div>
                          </div>
                        </div>
                        
                        {/* Steps Labels */}
                        <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-400 mt-3 uppercase tracking-wide">
                          <span className={progress >= 10 ? "text-[#193058]" : ""}>Pagado</span>
                          <span className={progress >= 35 ? "text-[#193058]" : ""}>Cocina</span>
                          <span className={progress >= 60 ? "text-[#193058]" : ""}>Empaquetado</span>
                          <span className={progress >= 85 ? "text-[#193058]" : ""}>Delivery</span>
                          <span className={progress >= 100 ? "text-[#193058]" : ""}>Entregado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECCIÓN: HISTORIAL DE PEDIDOS */}
        <h2 className="text-2xl font-bold text-[#193058] mb-6 flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Package className="text-[#193058]" size={24} />
          </div>
          Historial de Pedidos
        </h2>

        {historyOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-dashed border-gray-300">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg">No tienes pedidos entregados aún.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {historyOrders.map((order) => (
              <div 
                key={order.uuid} 
                onClick={() => handleOrderClick(order)}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#193058] text-lg">
                            Pedido Entregado
                          </h3>
                          <span className="text-xs font-medium text-gray-400">
                            {new Date(order.fecha_pedido).toLocaleDateString()} • {new Date(order.fecha_pedido).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                        ENTREGADO
                      </span>
                    </div>
                    
                    <div className="pl-11 mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate max-w-md font-medium">{order.destino || "Dirección no especificada"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ShoppingBag size={14} className="text-gray-400" />
                        <span>{order.elementos?.length || 0} productos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total</p>
                      <p className="text-2xl font-black text-[#193058]">
                        S/ {calculateTotal(order).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-full group-hover:bg-[#193058] group-hover:text-white transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE DETALLE - ESTILO POKEMON CARD / COLECCIONABLE */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 bg-[#193058]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              
              {/* Header con Gradiente e Imagen */}
              <div className="relative h-48 bg-gradient-to-br from-[#193058] to-[#2a4a80] flex-shrink-0">
                <button 
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  {selectedOrderDetails.imagen_combo_url && !imageError ? (
                    <img 
                      src={selectedOrderDetails.imagen_combo_url} 
                      alt="Combo" 
                      className="h-40 w-40 object-cover rounded-full border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        console.error("Error cargando imagen del pedido:", selectedOrderDetails.imagen_combo_url);
                        setImageError(true);
                      }}
                    />
                  ) : (
                    <div className="h-32 w-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/30 backdrop-blur-sm">
                      <Package size={48} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold shadow-sm ${
                    selectedOrderDetails.estado_pedido === 'ENTREGADO' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-[#ffb500] text-[#193058]'
                  }`}>
                    {selectedOrderDetails.estado_pedido}
                  </span>
                </div>
              </div>

              {/* Contenido Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-[#193058] leading-tight">
                    {selectedOrderDetails.elementos?.[0]?.combo?.[0] || "Pedido Bembos"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {new Date(selectedOrderDetails.fecha_pedido).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Entrega</p>
                      <p className="font-bold text-[#193058] text-sm truncate">
                        {selectedOrderDetails.delivery ? "Delivery" : "Recojo"}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Hora</p>
                      <p className="font-bold text-[#193058] text-sm">
                        {selectedOrderDetails.fecha_entrega ? new Date(selectedOrderDetails.fecha_entrega).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <MapPin size={14} /> Dirección de Entrega
                    </h3>
                    <p className="text-[#193058] font-medium text-sm leading-relaxed">
                      {selectedOrderDetails.destino || selectedOrderDetails.origen || "Sin dirección"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <ShoppingBag size={14} /> Detalles del Combo
                    </h3>
                    <div className="space-y-4">
                      {selectedOrderDetails.elementos?.map((item, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-gray-100">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-[#193058]">
                              {item.cantidad_combo}x {item.combo?.[0]}
                            </p>
                            <p className="font-bold text-[#193058]">
                              S/ {item.precio}
                            </p>
                          </div>
                          
                          {/* Ingredientes y Extras */}
                          <div className="text-xs text-gray-500 space-y-1">
                            {item.productos?.hamburguesa?.map((h, hIdx) => (
                              <div key={hIdx}>
                                <p className="font-medium text-gray-600">{h.nombre} ({h.tamaño})</p>
                                <p>Ingredientes: {h.ingredientes?.join(", ")}</p>
                              </div>
                            ))}
                            {item.productos?.papas && <p>+ {item.productos.papas.join(", ")}</p>}
                            {item.productos?.complementos && <p>+ {item.productos.complementos.join(", ")}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Fijo con Total */}
              <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex justify-between items-center bg-[#193058] text-white p-4 rounded-2xl shadow-lg">
                  <span className="font-medium">Total Pagado</span>
                  <span className="text-2xl font-extrabold">
                    S/ {calculateTotal(selectedOrderDetails).toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
