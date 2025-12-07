import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Banner from '../components/Banner';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import ComboService from '../services/comboService';
import ProductService from '../services/productService';



const ProductCarousel = ({ title, products, bgColor = 'bg-white' }) => {
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className={`${bgColor} py-8`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase">
            {title}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex w-10 h-10 rounded-full border-2 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex w-10 h-10 rounded-full border-2 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white items-center justify-center transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => (
            <div key={product.id} className="flex-none w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [promos, setPromos] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        // 1. Promociones: Promocion_Personal (Combos API)
        const promosData = await ComboService.getCombosByTenant('Promocion_Personal');
        setPromos(promosData.map(c => mapComboToProduct(c, 'Promocion_Personal')));

        // 2. Recomendados: Hamburguesa (Products API)
        const recommendedData = await ProductService.getProductsByTenant('Hamburguesa');
        setRecommended(recommendedData.map(mapProductToProduct));

        // 3. Más Vendidos: Combos (Combos API)
        const bestSellersData = await ComboService.getCombosByTenant('Combos');
        setBestSellers(bestSellersData.map(c => mapComboToProduct(c, 'Combos')));

      } catch (error) {
        console.error('Error al cargar datos del home:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const mapComboToProduct = (combo, tenantId = 'Combos') => ({
    id: combo.nombre,
    name: combo.nombre.replace(/_/g, ' ').toUpperCase(),
    description: combo.descripcion,
    price: combo.precio,
    originalPrice: combo.porcentaje > 0 ? combo.precio / (1 - combo.porcentaje / 100) : null,
    discount: combo.porcentaje > 0 ? combo.porcentaje : null,
    imageUrl: combo.imagen,
    stock: combo.stock,
    tenantId: tenantId,
    type: 'combo'
  });

  const mapProductToProduct = (product) => ({
    id: product.nombre_producto,
    name: product.nombre_producto.replace(/_/g, ' ').toUpperCase(),
    description: product.descripcion,
    price: product.precio,
    stock: product.stock,
    imageUrl: product.imagen,
    category: 'hamburguesas',
    tenantId: 'Hamburguesa',
    type: 'product'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />
      <CategoryNav />
      
      {/* PROMOCIONES Section */}
      <ProductCarousel title="PROMOCIONES" products={promos} />

      {/* RECOMENDADOS PARA TI Section */}
      <ProductCarousel title="RECOMENDADOS PARA TI" products={recommended} bgColor="bg-gray-100" />

      {/* LOS MÁS VENDIDOS Section */}
      <ProductCarousel title="LOS MÁS VENDIDOS" products={bestSellers} />

      {/* Delivery Coverage Section */}
      <section className="bg-[#0033A0] py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 italic">
              ¡BEMBOS AL RESCATE DE TU ANTOJO!
            </h2>
            <p className="text-lg mb-6">
              Descubre nuestras zonas de delivery y recibe tu pedido rapidito.
            </p>
            <a 
              href="https://mcprod.bembos.desarrollongr.com.pe/deliverycoverage" 
              className="inline-block bg-[#FFD11A] text-[#0033A0] font-bold py-3 px-8 rounded-full hover:bg-yellow-300 transition-colors"
            >
              Encuéntralas aquí
            </a>
          </div>
          <div className="md:w-1/2 flex justify-center">
             <img 
               src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500" 
               alt="Delivery Zone" 
               className="max-h-[300px] object-contain rounded-lg shadow-lg"
               onError={(e) => e.target.style.display = 'none'}
             />
          </div>
        </div>
      </section>

      {/* Loyalty Program Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row-reverse items-center justify-between gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] mb-4 italic">
              PROGRAMA DE LEALTAD
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              ¡Alcanza Destinados y que nadie te pare! Delivery Gratis + Nuggets x4 de regalo en tu pedido.
            </p>
            <a 
              href="https://www.bembos.com.pe/beneficios" 
              className="inline-block bg-[#0033A0] text-white font-bold py-3 px-8 rounded-full hover:bg-blue-800 transition-colors"
            >
              Descúbrelo aquí
            </a>
          </div>
          <div className="md:w-1/2 flex justify-center">
             <img 
               src="https://bucket-bembos-utec.s3.amazonaws.com/imagenes_decoracion/banner_relacion.png" 
               alt="Loyalty Program" 
               className="max-h-[300px] object-contain rounded-lg shadow-lg"
               onError={(e) => e.target.style.display = 'none'}
             />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Preguntas frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-[#0033A0] mb-2">1. Tiendas de hamburguesas cerca de ti</h3>
              <p className="text-gray-600">
                Solo ingresa tu ubicación en <a href="https://www.bembos.com.pe/locales" className="text-blue-600 underline">https://www.bembos.com.pe/locales</a> y encuentra las tiendas más cercanas para que disfrutes rápido de tus hamburguesas favoritas.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-[#0033A0] mb-2">2. ¿Cuáles son las mejores hamburguesas de Perú?</h3>
              <p className="text-gray-600">
                ¡Las nuestras, obvio! Las que se hacen con calle y sabor. En Bembos, mezclamos lo criollo con lo que te provoca para que cada mordida grite ¡Qué rico ser peruano!
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-[#0033A0] mb-2">3. ¿Dónde pedir hamburguesa por delivery?</h3>
              <p className="text-gray-600">
                ¡Fácil! Pide por nuestra web, la app o llama al 01419-1919. Tu Bembos llega directo a tu puerta, ¡Como debe ser!
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
             <p className="text-gray-600 max-w-2xl mx-auto">
               Pide las mejores hamburguesas en Bembos: disfruta de nuestras clásicas, prueba sabores peruanos como la A lo Pobre, y aprovecha nuestras ofertas como A la Parrilla, combos y más, ¡Todo a un clic de distancia!
             </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
