import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Navigation, Search } from 'lucide-react';
import LocalesService from '../services/localesService';

const Locales = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todos los locales al iniciar
  useEffect(() => {
    loadAllStores();
  }, []);

  const loadAllStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LocalesService.getAllLocales();
      setStores(data);
    } catch (err) {
      console.error('Error al cargar locales:', err);
      setError('Error al cargar los locales. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar locales cuando cambia el query
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAllStores();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await LocalesService.filterLocales(searchQuery);
      setStores(data);
    } catch (err) {
      console.error('Error al buscar locales:', err);
      setError('Error al buscar locales. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0033A0] mb-4 uppercase font-display">
            Encuentra nuestra tienda más cerca de ti
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            El menú, las ofertas especiales y los precios pueden variar según el restaurante de Bembos.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Ingresa nombre de tienda o dirección"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-full focus:border-[#0033A0] focus:outline-none text-gray-700"
            />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0033A0] text-white p-2 rounded-full hover:bg-blue-800 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                loadAllStores();
              }}
              className="mt-2 text-sm text-[#0033A0] hover:underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <button className="bg-[#0033A0] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors inline-flex items-center gap-2">
            <MapPin size={20} />
            IR A MENÚ
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Map Placeholder */}
          <div className="order-2 md:order-1">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg overflow-hidden sticky top-24">
              <div className="aspect-video md:aspect-square relative">
                {/* Map Placeholder - En producción sería Google Maps */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={64} className="text-[#0033A0] mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">
                      {selectedStore ? selectedStore.name : 'Mapa de ubicaciones'}
                    </p>
                    {selectedStore && (
                      <div className="mt-4 bg-white p-4 rounded-lg shadow-md max-w-xs mx-auto">
                        <h3 className="font-bold text-[#0033A0] mb-2">{selectedStore.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{selectedStore.address}</p>
                        <button className="bg-[#0033A0] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-800 transition-colors w-full">
                          VER DIRECCIÓN
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Google Maps iframe podría ir aquí */}
                <iframe
                  title="Bembos Locations Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62424.07692107855!2d-77.04284389999999!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5d35662c7%3A0x4c3c3c3c3c3c3c3c!2sLima%2C%20Peru!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>

          {/* Right: Store List */}
          <div className="order-1 md:order-2">
            <div className="bg-white rounded-lg">
              {/* Loading state */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033A0]"></div>
                  <p className="text-gray-600 mt-4">Cargando locales...</p>
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={loadAllStores}
                    className="bg-[#0033A0] text-white px-6 py-2 rounded-full hover:bg-blue-800 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* Stores list */}
              {!loading && !error && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {stores.length} {stores.length === 1 ? 'tienda encontrada' : 'tiendas encontradas'}
                  </h2>

                  {stores.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No se encontraron locales.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {stores.map((store) => (
                        <div
                          key={store.tenant_id}
                          className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                            selectedStore?.tenant_id === store.tenant_id
                              ? 'border-[#0033A0] bg-blue-50'
                              : 'border-gray-200 hover:border-[#0033A0]'
                          }`}
                          onClick={() => setSelectedStore(store)}
                        >
                          {/* Store Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">
                                {store.tenant_id.replace(/#/g, ' - ').toUpperCase()}
                              </h3>
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                                Disponible
                              </span>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-2 mb-3 text-sm text-gray-600">
                            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#0033A0]" />
                            <p>{store.direccion}</p>
                          </div>

                          {/* Phone */}
                          {store.telefono && (
                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                              <Phone size={16} className="flex-shrink-0 text-[#0033A0]" />
                              <p>Teléfono: {store.telefono}</p>
                            </div>
                          )}

                          {/* Services */}
                          {store.tipo_despacho && store.tipo_despacho.length > 0 && (
                            <>
                              <div className="mb-2">
                                <span className="font-semibold text-gray-700 text-sm">Tipo de Despacho:</span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-sm mb-4">
                                {store.tipo_despacho.map((tipo, index) => (
                                  <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                                    <span className="text-[#0033A0]">
                                      {tipo.includes('domicilio') ? '🚚' : '📍'}
                                    </span>
                                    <span>{tipo}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Created date */}
                          {store.created_at && (
                            <div className="text-xs text-gray-500 mb-3">
                              Registrado: {new Date(store.created_at).toLocaleDateString('es-PE')}
                            </div>
                          )}

                          {/* Action Button */}
                          <button className="mt-2 w-full bg-[#0033A0] text-white py-2 rounded-full font-bold hover:bg-blue-800 transition-colors">
                            Ver local
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 uppercase font-display">
            PREGUNTAS FRECUENTES LOCALES BEMBOS
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-bold text-gray-900 cursor-pointer hover:text-[#0033A0] transition-colors">
                ¿Cuáles son las mejores hamburgueserías cerca de mi?
              </summary>
              <p className="mt-3 text-gray-600">
                Puedes encontrar la carta de hamburguesas y el menú en la página, donde encontrarás las tiendas más cercanas para que disfrutes rápido de tus hamburguesas favoritas.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-bold text-gray-900 cursor-pointer hover:text-[#0033A0] transition-colors">
                ¿Dónde tiene locales Bembos?
              </summary>
              <p className="mt-3 text-gray-600">
                Bembos tiene presencia en varias ciudades del Perú. Puedes encontrar nuestras tiendas en Lima, Arequipa, Trujillo, Cusco y muchas otras ciudades.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-bold text-gray-900 cursor-pointer hover:text-[#0033A0] transition-colors">
                ¿Cuáles son los horarios de los restaurantes de Bembos?
              </summary>
              <p className="mt-3 text-gray-600">
                Los horarios pueden variar según el local. Te recomendamos verificar el horario específico del restaurante que deseas visitar en nuestra lista de locales.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-bold text-gray-900 cursor-pointer hover:text-[#0033A0] transition-colors">
                ¿Cómo puedo dejar una reseña sobre mi experiencia en un local de Bembos?
              </summary>
              <p className="mt-3 text-gray-600">
                Puedes dejar tu reseña a través de nuestras redes sociales o contactándonos directamente. Tu opinión es muy importante para nosotros.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Locales;
