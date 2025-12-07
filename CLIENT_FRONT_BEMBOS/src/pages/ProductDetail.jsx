import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductService from '../services/productService';
import ComboService from '../services/comboService';

const HAMBURGER_OPTIONS = [
  { id: 'queso-tocino-regular', name: 'Queso Tocino Regular', price: 0, image: '🍔' },
  { id: 'queso-tocino-mediana', name: 'Queso Tocino Mediana', price: 3.00, image: '🍔' },
  { id: 'queso-tocino-grande', name: 'Queso Tocino Grande', price: 6.00, image: '🍔' }
];

const FRIES_OPTIONS = [
  { id: 'papa-mediana', name: 'Papa Mediana', price: 1.00, image: '🍟' },
  { id: 'papa-grande', name: 'Papa Grande', price: 2.00, image: '🍟' }
];

const DRINKS_OPTIONS = [
  { id: 'inca-kola-500', name: 'Inca Kola Sabor Original 500 ml', price: 0, image: '🥤' },
  { id: 'coca-cola-500', name: 'Coca Cola Sabor Original 500 ml', price: 0, image: '🥤' },
  { id: 'inca-kola-sin-azucar', name: 'Inca kola Sin Azúcar 500 ml', price: 0, image: '🥤' },
  { id: 'coca-cola-sin-azucar', name: 'Coca Cola Sin Azúcar 500 ml', price: 0, image: '🥤' },
  { id: 'san-luis-gas', name: 'San Luis Sin Gas 625 ml', price: 0, image: '💧' },
  { id: 'sprite-500', name: 'Sprite 500 ml', price: 0, image: '🥤' },
  { id: 'fanta-500', name: 'Fanta 500ml', price: 0, image: '🥤' }
];

const SAUCE_OPTIONS = [
  { id: 'aji-bembos', name: '2 Ají Bembos', image: '🌶️' },
  { id: 'ketchups', name: '2 Ketchups', image: '🍅' },
  { id: 'mayonesas', name: '2 Mayonesas', image: '🥚' }
];

const EXTRAS_OPTIONS = [
  { id: 'helado-sundae', name: 'Helado Sundae Princesa', price: 5.90, image: '🍦' },
  { id: 'nuggets-6', name: '6 Nuggets', price: 7.90, image: '🍗' },
  { id: 'salchipapa', name: 'Salchipapa', price: 10.90, image: '🌭' },
  { id: 'cheese-fingers', name: '4 Cheese Fingers', price: 13.90, image: '🧀' }
];

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  
  // Obtener tenantId y type de la URL state o del localStorage
  const { tenantId: urlTenantId, type: urlType } = location.state || {};
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  
  // Cargar producto del backend
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Intentar obtener tenantId del state o extraerlo del productId
        let detectedTenantId = urlTenantId;
        let detectedType = urlType;
        
        // Lógica de detección automática si no viene en el state
        if (!detectedTenantId) {
          const lowerId = productId.toLowerCase();
          if (lowerId.includes('loncherita')) {
            detectedTenantId = 'Loncherita';
            detectedType = 'combo';
          } else if (lowerId.includes('black_friday') || lowerId.includes('promo_personal')) {
            detectedTenantId = 'Promocion_Personal';
            detectedType = 'combo';
          } else if (lowerId.includes('promo_doble') || lowerId.includes('para_2')) {
            detectedTenantId = 'Promociones_para_2';
            detectedType = 'combo';
          } else if (lowerId.includes('familiar') && !lowerId.includes('yape')) {
            detectedTenantId = 'Promociones_para_compartir';
            detectedType = 'combo';
          } else if (lowerId.includes('yape') || lowerId.includes('entel') || lowerId.includes('cupon')) {
            detectedTenantId = 'Cupones';
            detectedType = 'combo';
          } else {
            // Por defecto, asumir que es un producto de hamburguesas
            detectedTenantId = 'Hamburguesa';
            detectedType = 'product';
          }
        }
        
        let data;
        
        // Función auxiliar para intentar cargar combo de diferentes tenants si falla
        const fetchComboWithFallback = async (initialTenant) => {
          const tenantsToTry = [
            initialTenant,
            'Combos',
            'Loncherita',
            'Promocion_Personal',
            'Promociones_para_2',
            'Promociones_para_compartir',
            'Cupones'
          ];
          
          // Eliminar duplicados y nulos
          const uniqueTenants = [...new Set(tenantsToTry.filter(Boolean))];
          
          for (const tenant of uniqueTenants) {
            try {
              const result = await ComboService.getComboDetail(tenant, productId);
              if (result) return { data: result, tenantId: tenant };
            } catch (e) {
              // Continuar al siguiente tenant
              continue;
            }
          }
          throw new Error('Producto no encontrado en ninguna categoría de combos');
        };

        if (detectedType === 'combo') {
          const result = await fetchComboWithFallback(detectedTenantId);
          data = result.data;
          detectedTenantId = result.tenantId; // Actualizar con el tenant real donde se encontró

          setProduct({
            id: data.nombre,
            name: data.nombre.replace(/_/g, ' ').toUpperCase(),
            description: data.descripcion,
            basePrice: data.precio,
            price: data.precio,
            originalPrice: data.porcentaje > 0 ? data.precio / (1 - data.porcentaje / 100) : null,
            discount: data.porcentaje > 0 ? data.porcentaje : null,
            image: data.imagen,
            stock: data.stock,
            tipo_promocion: data.tipo_promocion,
            porcentaje: data.porcentaje,
            productos: data.Productos,
            puntos_relacion: data.puntos_relacion,
            tenantId: detectedTenantId,
            type: 'combo'
          });
        } else {
          // Lógica similar para productos si fuera necesario, pero por ahora mantenemos simple
          try {
            data = await ProductService.getProductDetail(detectedTenantId, productId);
          } catch (err) {
            // Si falla en Hamburguesa, intentar en otras categorías comunes
            if (detectedTenantId === 'Hamburguesa') {
               try {
                 data = await ProductService.getProductDetail('Pollo', productId);
                 detectedTenantId = 'Pollo';
               } catch (e2) {
                 throw err; // Lanzar el error original si falla también
               }
            } else {
              throw err;
            }
          }

          // Calcular precio original si hay descuento
          let originalPrice = null;
          if (data.porcentaje && data.porcentaje > 0) {
            // Asumimos que para productos también viene en 0-100 si es consistente con combos
            // Pero verificamos si es < 1 (decimal) o > 1 (entero)
            const pct = data.porcentaje > 1 ? data.porcentaje / 100 : data.porcentaje;
            originalPrice = data.precio / (1 - pct);
          }

          setProduct({
            id: data.nombre_producto,
            name: data.nombre_producto.replace(/_/g, ' ').toUpperCase(),
            description: data.descripcion,
            basePrice: data.precio,
            price: data.precio,
            originalPrice: originalPrice,
            image: data.imagen,
            stock: data.stock,
            tipo_promocion: data.tipo_promocion,
            porcentaje: data.porcentaje,
            tamano: data.tamano,
            precio_extra: data.precio_extra,
            puntos_extra: data.puntos_extra,
            puntos_general: data.puntos_general,
            tenantId: detectedTenantId,
            type: 'product'
          });
          
          // Si hay tamaños disponibles, seleccionar el primero por defecto
          if (data.tamano && data.tamano.length > 0) {
            setSelectedSize(data.tamano[0]);
          }
        }
      } catch (err) {
        console.error('Error al cargar producto:', err);
        setError('Error al cargar el producto. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, urlTenantId, urlType]);

  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let total = product.basePrice;
    
    // Agregar precio extra si hay un tamaño seleccionado que no sea el básico
    if (selectedSize && product.precio_extra) {
      const size = selectedSize.toLowerCase();
      if (size === 'mediano' || size === 'mediana') {
        total += product.precio_extra;
      } else if (size === 'grande') {
        total += product.precio_extra * 2;
      }
    }
    
    return total * quantity;
  };

  // Función para validar si se puede agregar al carrito
  const canProceedToNext = () => {
    if (!product) return false;
    // Si el producto tiene tamaños, debe haber uno seleccionado
    if (product.tamano && product.tamano.length > 0 && !selectedSize) {
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: `${product.id}-${selectedSize || 'default'}-${Date.now()}`,
      ...product,
      quantity,
      selectedSize,
      totalPrice: calculateTotalPrice()
    };
    
    addToCart(cartItem);
    navigate('/menu');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#0033A0]"></div>
          <p className="text-gray-600 mt-4">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Producto no encontrado'}</p>
          <button 
            onClick={() => navigate('/menu')}
            className="bg-[#0033A0] text-white px-6 py-2 rounded-full hover:bg-blue-800 transition-colors"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FFD11A] py-2 px-4">
        <div className="container mx-auto">
          <p className="text-[#193058] text-sm font-semibold">
            ¡Comienza tu pedido! Elige tu dirección
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:text-[#0033A0]">Inicio</button>
          <span>›</span>
          <button onClick={() => navigate('/menu')} className="hover:text-[#0033A0]">Menú</button>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Product Image and Details */}
          <div className="relative">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
            >
              <Heart
                size={24}
                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>
            
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto rounded-lg object-contain bg-white p-4"
              onError={(e) => {
                e.target.src = import.meta.env.VITE_PLACEHOLDER_IMAGE;
              }}
            />
            
            <div className="mt-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-600 mb-4 text-lg">{product.description}</p>
              
              {/* Stock info */}
              {product.stock !== undefined && (
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `Stock disponible: ${product.stock}` : 'Sin stock'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  S/ {product.basePrice.toFixed(2)}
                </span>
                {product.porcentaje > 0 && (
                  <span className="bg-[#E31E24] text-white px-3 py-1 rounded text-sm font-bold">
                    -{product.porcentaje}%
                  </span>
                )}
              </div>

              {/* Promotion info */}
              {product.tipo_promocion && product.tipo_promocion !== 'Sin promocion' && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm font-semibold text-yellow-800">
                    🎉 {product.tipo_promocion}
                  </p>
                </div>
              )}

              {/* Points info */}
              {product.puntos_general > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    ⭐ Gana <strong>{product.puntos_general}</strong> puntos con esta compra
                    {product.puntos_extra > 0 && ` (+ ${product.puntos_extra} puntos extra)`}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <span className="text-gray-400">📍</span> Retiro en local
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <span className="text-gray-400">🚚</span> Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right: Options and Add to Cart */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Personaliza tu pedido</h2>
            
            {/* Size selection (if available) */}
            {product.tamano && product.tamano.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Tamaño</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.tamano.map((tamano) => (
                    <button
                      key={tamano}
                      onClick={() => setSelectedSize(tamano)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedSize === tamano
                          ? 'border-[#0033A0] bg-blue-50'
                          : 'border-gray-200 hover:border-[#0033A0]'
                      }`}
                    >
                      <div className="font-semibold capitalize">{tamano}</div>
                      {product.precio_extra > 0 && (tamano.toLowerCase() === 'mediano' || tamano.toLowerCase() === 'mediana' || tamano.toLowerCase() === 'grande') && (
                        <div className="text-sm text-[#0033A0] font-bold mt-1">
                          +S/ {(tamano.toLowerCase() === 'grande' ? product.precio_extra * 2 : product.precio_extra).toFixed(2)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Combo products (if it's a combo) */}
            {product.productos && product.productos.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Incluye:</h3>
                <ul className="space-y-2">
                  {product.productos.map((prod, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="text-[#0033A0]">✓</span>
                      <span className="capitalize">
                        {prod.cantidad_de_ese_producto_que_usa}x {prod.Nombre.replace(/_/g, ' ')} ({prod.tamano})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity selector */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Cantidad</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-10 h-10 rounded-full bg-[#0033A0] text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Price summary */}
            <div className="border-t-2 border-gray-200 pt-4 mb-6">
              <div className="flex items-center justify-between text-lg mb-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-bold">S/ {(product.basePrice * quantity).toFixed(2)}</span>
              </div>
              {selectedSize && product.precio_extra > 0 && (selectedSize.toLowerCase() === 'mediano' || selectedSize.toLowerCase() === 'mediana' || selectedSize.toLowerCase() === 'grande') && (
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Tamaño extra:</span>
                  <span>+S/ {((selectedSize.toLowerCase() === 'grande' ? product.precio_extra * 2 : product.precio_extra) * quantity).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-2xl font-bold text-[#0033A0] mt-3">
                <span>Total:</span>
                <span>S/ {calculateTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-full font-bold text-lg transition-colors ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#0033A0] text-white hover:bg-blue-800'
              }`}
            >
              {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>

            <button
              onClick={() => navigate('/menu')}
              className="w-full mt-3 py-3 border-2 border-[#0033A0] text-[#0033A0] rounded-full font-bold hover:bg-blue-50 transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded object-cover" />
              <div>
                <h3 className="font-bold text-gray-900">{product.name}</h3>
                <p className="text-2xl font-bold text-[#0033A0]">
                  S/ {calculateTotalPrice().toFixed(2)}
                </p>
                {product.originalPrice && (
                  <p className="text-sm text-gray-400 line-through">
                    S/ {(product.originalPrice * quantity).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-[#0033A0] text-[#0033A0] flex items-center justify-center hover:bg-[#0033A0] hover:text-white transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-[#0033A0] text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canProceedToNext()}
                className={`px-8 py-3 font-bold rounded-full transition-colors ${
                  canProceedToNext()
                    ? 'bg-[#0033A0] text-white hover:bg-blue-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                AGREGAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
