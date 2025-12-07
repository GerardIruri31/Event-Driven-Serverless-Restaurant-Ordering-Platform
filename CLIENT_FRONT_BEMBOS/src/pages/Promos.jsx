import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ComboService from '../services/comboService';

const PROMO_SECTIONS = [
  { id: 'compartir', title: 'Para Compartir', tenantId: 'Promociones_para_compartir' },
  { id: 'para2', title: 'Promociones para 2', tenantId: 'Promociones_para_2' },
  { id: 'personal', title: 'Promoción Personal', tenantId: 'Promocion_Personal' },
  { id: 'cupones', title: 'Cupones', tenantId: 'Cupones' }
];

const Promos = () => {
  const [promosData, setPromosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllPromos = async () => {
      setLoading(true);
      try {
        const promises = PROMO_SECTIONS.map(async (section) => {
          const data = await ComboService.getCombosByTenant(section.tenantId);
          return {
            sectionId: section.id,
            data: data.map(combo => ({
              id: combo.nombre,
              name: combo.nombre.replace(/_/g, ' ').toUpperCase(),
              description: combo.descripcion,
              price: combo.precio,
              originalPrice: combo.porcentaje > 0 ? combo.precio / (1 - combo.porcentaje / 100) : null,
              discount: combo.porcentaje > 0 ? combo.porcentaje : null,
              stock: combo.stock,
              imageUrl: combo.imagen,
              category: 'promos',
              tenantId: section.tenantId,
              type: 'combo'
            }))
          };
        });

        const results = await Promise.all(promises);
        const newPromosData = results.reduce((acc, curr) => {
          acc[curr.sectionId] = curr.data;
          return acc;
        }, {});

        setPromosData(newPromosData);
      } catch (err) {
        console.error('Error al cargar promociones:', err);
        setError('Error al cargar las promociones. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadAllPromos();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#0033A0] mb-8 text-center uppercase font-display">
          Promociones Exclusivas
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0033A0]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {PROMO_SECTIONS.map((section) => (
              <div key={section.id}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-[#FFD11A] inline-block pb-1">
                  {section.title}
                </h2>
                
                {promosData[section.id] && promosData[section.id].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {promosData[section.id].map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No hay promociones disponibles en esta categoría.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promos;
