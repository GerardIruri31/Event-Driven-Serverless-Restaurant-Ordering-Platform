import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import FavoritosService from '../services/favoritosService';
import AuthService from '../services/authService';
import { useCart } from '../context/CartContext';

const Favoritos = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar autenticación
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadFavoritos();
  }, [navigate]);

  const loadFavoritos = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await FavoritosService.getFavoritos();
      setFavoritos(data);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
      setError('Error al cargar tus favoritos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favorito) => {
    try {
      await FavoritosService.removeFavorito(favorito);
      setFavoritos(favoritos.filter(fav => fav.nombre !== favorito.nombre));
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
      alert('Error al eliminar favorito. Intenta nuevamente.');
    }
  };

  const handleAddToCart = (favorito) => {
    // Convertir favorito al formato de producto del carrito
    const cartItem = {
      id: favorito.nombre,
      name: favorito.nombre.replace(/_/g, ' ').toUpperCase(),
      description: favorito.descripcion,
      price: favorito.precio,
      imageUrl: favorito.imagen || import.meta.env.VITE_PLACEHOLDER_IMAGE,
      quantity: 1
    };

    addToCart(cartItem);
    alert('✓ Producto agregado al carrito');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#0033A0]"></div>
          <p className="text-gray-600 mt-4">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-[#FFD11A] py-3 px-4">
        <div className="container mx-auto">
          <p className="text-[#193058] text-sm font-semibold text-center">
            ¡Tus productos favoritos en un solo lugar!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart size={32} className="text-[#E31E24] fill-[#E31E24]" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase font-display">
              Mis Favoritos
            </h1>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="bg-[#0033A0] text-white px-6 py-2 rounded-full font-bold hover:bg-blue-800 transition-colors"
          >
            Ver Menú
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadFavoritos}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Favoritos Grid */}
        {!error && favoritos.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes favoritos todavía
            </h2>
            <p className="text-gray-600 mb-6">
              Explora nuestro menú y agrega tus productos favoritos
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-[#0033A0] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors inline-flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Ir al Menú
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {favoritos.length} {favoritos.length === 1 ? 'producto favorito' : 'productos favoritos'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoritos.map((favorito, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
                >
                  {/* Image placeholder */}
                  <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {favorito.imagen ? (
                      <img 
                        src={favorito.imagen} 
                        alt={favorito.nombre} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    
                    <div className={`flex items-center justify-center w-full h-full absolute inset-0 ${favorito.imagen ? 'hidden' : ''}`}>
                      <Heart size={48} className="text-gray-300" />
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveFavorite(favorito)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:bg-red-50 group z-10"
                      title="Eliminar de favoritos"
                    >
                      <Trash2 size={18} className="text-gray-600 group-hover:text-red-600" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 min-h-12 uppercase">
                      {favorito.nombre.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {favorito.descripcion}
                    </p>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        S/ {favorito.precio.toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => handleAddToCart(favorito)}
                        className="bg-[#0033A0] hover:bg-blue-800 text-white px-4 py-2 rounded-full flex items-center justify-center transition-colors shadow-md font-bold text-sm"
                        title="Agregar al carrito"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Clear All Button */}
        {favoritos.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={async () => {
                if (window.confirm('¿Estás seguro de eliminar todos tus favoritos?')) {
                  try {
                    for (const fav of favoritos) {
                      await FavoritosService.removeFavorito(fav);
                    }
                    setFavoritos([]);
                  } catch (err) {
                    console.error('Error al limpiar favoritos:', err);
                    alert('Error al limpiar favoritos. Intenta nuevamente.');
                  }
                }
              }}
              className="text-red-600 hover:text-red-800 font-semibold text-sm hover:underline"
            >
              Limpiar todos los favoritos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;
