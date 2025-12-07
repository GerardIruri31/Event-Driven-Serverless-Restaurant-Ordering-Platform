import React, { useState, useEffect } from 'react';
import { Ticket, Tag, Gift } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ComboService from '../services/comboService';

const Cupones = () => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCupones = async () => {
      setLoading(true);
      try {
        const data = await ComboService.getCombosByTenant('Cupones');
        
        const mappedData = data.map(combo => ({
          id: combo.nombre,
          name: combo.nombre.replace(/_/g, ' ').toUpperCase(),
          description: combo.descripcion,
          price: combo.precio,
          originalPrice: combo.porcentaje > 0 ? combo.precio / (1 - combo.porcentaje / 100) : null,
          discount: combo.porcentaje > 0 ? combo.porcentaje : null,
          stock: combo.stock,
          imageUrl: combo.imagen,
          category: 'cupones',
          tenantId: 'Cupones',
          type: 'combo'
        }));
        
        setCupones(mappedData);
      } catch (err) {
        console.error('Error al cargar cupones:', err);
        setError('Error al cargar los cupones. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadCupones();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0033A0] to-[#0055D4] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Ticket size={48} />
            <h1 className="text-4xl md:text-5xl font-bold font-display">
              ¿TIENES CUPONES?
            </h1>
          </div>
          <div className="max-w-2xl mx-auto bg-[#E31E24] rounded-full py-4 px-8 text-center">
            <p className="text-2xl font-bold">CANJÉALOS AQUÍ</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Cupones disponibles</h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0033A0]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cupones.length > 0 ? (
              cupones.map((cupon) => (
                <div key={cupon.id} className="relative">
                  <ProductCard product={cupon} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No hay cupones disponibles en este momento.
              </div>
            )}
          </div>
        )}

        {/* Información sobre cupones */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Gift className="mx-auto mb-4 text-[#0033A0]" size={64} />
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">
                ¿Cómo usar tus cupones?
              </h2>
              <p className="text-gray-600 text-lg">
                Es muy fácil disfrutar de nuestras promociones exclusivas
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#0033A0] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">Encuentra tu cupón</h3>
                <p className="text-gray-600 text-sm">
                  Busca el cupón que más te guste en esta página
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#0033A0] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">Agrega al carrito</h3>
                <p className="text-gray-600 text-sm">
                  Haz clic en "Agregar" y el cupón se aplicará automáticamente
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#0033A0] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">Disfruta tu pedido</h3>
                <p className="text-gray-600 text-sm">
                  Completa tu orden y recibe tu pedido con el descuento aplicado
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-[#FFF3CD] rounded-lg border-l-4 border-[#FFB500]">
              <h4 className="font-bold text-gray-900 mb-2">⚠️ Importante:</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Los cupones son válidos solo para delivery y recojo en tienda</li>
                <li>No acumulables con otras promociones</li>
                <li>Sujeto a disponibilidad de stock</li>
                <li>Consulta términos y condiciones de cada cupón</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preguntas frecuentes */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display text-center">
            Preguntas frecuentes sobre cupones
          </h2>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <details className="group border-b border-gray-200 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-gray-700 hover:text-[#0033A0]">
                <span>¿Puedo usar varios cupones en un mismo pedido?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                No, solo puedes usar un cupón por pedido. Los cupones no son acumulables con otras promociones.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-gray-700 hover:text-[#0033A0]">
                <span>¿Los cupones tienen fecha de vencimiento?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Sí, cada cupón tiene su propia fecha de vencimiento. Puedes ver los detalles en la descripción de cada cupón.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-gray-700 hover:text-[#0033A0]">
                <span>¿Dónde consigo más cupones?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Suscríbete a nuestro newsletter, síguenos en redes sociales y revisa las promociones de nuestros aliados como Yape, Entel y otros.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cupones;
