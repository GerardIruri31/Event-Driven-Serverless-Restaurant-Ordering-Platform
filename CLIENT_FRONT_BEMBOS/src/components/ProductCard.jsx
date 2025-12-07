import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import FavoritosService from '../services/favoritosService';
import AuthService from '../services/authService';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Verificar si el producto está en favoritos al cargar
  useEffect(() => {
    const checkFavorite = async () => {
      if (!AuthService.isAuthenticated()) return;
      
      try {
        const response = await FavoritosService.getFavoritos();
        console.log('Respuesta de favoritos:', response);
        
        // Manejar diferentes estructuras de respuesta
        let listaFavoritos = [];
        if (Array.isArray(response)) {
          listaFavoritos = response;
        } else if (response && Array.isArray(response.favoritos)) {
          listaFavoritos = response.favoritos;
        } else if (response && Array.isArray(response.data)) {
          listaFavoritos = response.data;
        }

        if (Array.isArray(listaFavoritos)) {
          const esFav = listaFavoritos.some(fav => fav.nombre === product.id);
          setIsFavorite(esFav);
        }
      } catch (error) {
        console.error('Error al verificar favorito:', error);
      }
    };

    checkFavorite();
  }, [product.id]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    
    // Verificar si está autenticado
    if (!AuthService.isAuthenticated()) {
      alert('⚠️ Debes iniciar sesión para agregar favoritos');
      navigate('/login');
      return;
    }

    setLoadingFavorite(true);

    try {
      const favoritoData = {
        nombre: product.id,
        descripcion: product.description,
        precio: product.price
      };

      if (isFavorite) {
        await FavoritosService.removeFavorito(favoritoData);
        setIsFavorite(false);
      } else {
        await FavoritosService.addFavorito(favoritoData);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      alert('Error al actualizar favoritos. Intenta nuevamente.');
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden group bg-white p-4">
        <img 
          src={product.imageUrl || import.meta.env.VITE_PLACEHOLDER_IMAGE} 
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-[#E31E24] text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}
        {/* Heart Icon */}
        <button
          onClick={handleToggleFavorite}
          disabled={loadingFavorite}
          className="absolute top-2 left-2 p-1.5 rounded-full bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {loadingFavorite ? (
            <div className="w-4 h-4 border-2 border-[#0033A0] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Heart 
              size={18} 
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col grow">
        <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 min-h-12 font-display uppercase tracking-wide">{product.name}</h3>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 grow font-sans">{product.description}</p>
        
        {/* Price and Action */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 font-display">S/ {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through font-sans">S/ {product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            {product.discount && (
              <span className="text-[#E31E24] font-bold text-sm font-sans">-{product.discount}%</span>
            )}
          </div>
          
          <button 
            onClick={() => navigate(`/producto/${product.id}`, {
              state: { tenantId: product.tenantId, type: product.type }
            })}
            className="bg-[#0033A0] hover:bg-blue-800 text-white px-4 py-2 rounded-full flex items-center justify-center transition-colors shadow-md font-bold text-sm uppercase tracking-wider"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
