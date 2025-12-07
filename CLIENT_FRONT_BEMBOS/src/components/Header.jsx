import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, User, ShoppingCart, Menu, MapPin, Star, Heart, Package, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AuthService from '../services/authService';
import BembosLogo from '../assets/Bembos_logo_white.svg';

const Header = () => {
  const navigate = useNavigate();
  const { cartCount, cartTotal, toggleCart } = useCart();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación al cargar
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = AuthService.getUserData();
        setUser(userData);
      }
    };

    checkAuth();
    
    // Escuchar cambios en el localStorage (cuando se hace login/logout)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    }
  };

  return (
    <header className="w-full font-sans">
      {/* Yellow CTA Bar */}
      <div className="bg-[#FFD11A] py-2 px-4 hidden md:block">
        <a href="https://www.bembos.com.pe/inventory/source/" className="container mx-auto flex items-center justify-center gap-2 text-sm hover:underline">
          <MapPin size={18} className="text-[#193058]" />
          <span className="text-[#193058] font-semibold">¡Comienza tu pedido! Elige tu dirección</span>
        </a>
      </div>

      {/* Main Navigation - Blue Bar */}
      <div className="bg-[#0033A0] py-3 px-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center gap-4">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/">
              <img 
                src={BembosLogo} 
                alt="Bembos" 
                className="h-12 md:h-14"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-6 font-bold text-white text-sm">
            <a href="/menu" className="flex items-center gap-2 hover:text-[#FFD11A] transition-colors">
              <Menu size={18} />
              <span>MENÚ</span>
            </a>
            <a href="/promociones" className="flex items-center gap-2 hover:text-[#FFD11A] transition-colors">
              <Star size={18} />
              <span>PROMOS EXCLUSIVAS</span>
            </a>
            <a href="/cupones" className="flex items-center gap-2 hover:text-[#FFD11A] transition-colors">
              <Package size={18} />
              <span>CUPONES</span>
            </a>
            <a href="/locales" className="flex items-center gap-2 hover:text-[#FFD11A] transition-colors">
              <MapPin size={18} />
              <span>LOCALES</span>
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Phone */}
            <a href="tel:01419-1919" className="hidden md:flex items-center gap-2 text-white text-sm hover:text-[#FFD11A] transition-colors">
              <Phone size={16} />
              <div className="flex flex-col leading-tight">
                <span className="font-normal text-xs">Llámanos</span>
                <span className="font-bold">01419-1919</span>
              </div>
            </a>

            {/* Login / User */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => navigate('/favoritos')}
                  className="flex items-center gap-2 text-white text-sm hover:text-[#FFD11A] transition-colors"
                >
                  <User size={16} />
                  <div className="flex flex-col leading-tight">
                    <span className="font-normal text-xs">Hola,</span>
                    <span className="font-bold">{user?.nombre || 'Usuario'}</span>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-red-400 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <a href="/login" className="hidden md:flex items-center gap-2 text-white text-sm hover:text-[#FFD11A] transition-colors">
                <User size={16} />
                <div className="flex flex-col leading-tight">
                  <span className="font-normal text-xs">Hola,</span>
                  <span className="font-bold">Iniciar Sesión</span>
                </div>
              </a>
            )}

            {/* Cart Button */}
            <button 
              onClick={toggleCart}
              className="bg-[#FFD11A] text-[#0033A0] px-4 py-2 rounded-full flex items-center gap-2 hover:bg-yellow-300 transition-colors font-bold"
            >
              <ShoppingCart size={20} />
              <span className="hidden md:inline">S/ {cartTotal.toFixed(2)}</span>
              {cartCount > 0 && (
                <span className="bg-[#0033A0] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - White Bar */}
      <div className="bg-white border-b border-gray-200 py-2 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-end gap-6 text-sm">
          <a href="https://www.bembos.com.pe/beneficios" className="flex items-center gap-1 text-gray-700 hover:text-[#0033A0] transition-colors">
            <Star size={14} />
            <span>Mis Puntos</span>
          </a>
          <a href="/favoritos" className="flex items-center gap-1 text-gray-700 hover:text-[#0033A0] transition-colors">
            <Heart size={14} />
            <span>Mis Favoritos</span>
          </a>
          <a href="/pedidos" className="flex items-center gap-1 text-gray-700 hover:text-[#0033A0] transition-colors">
            <Package size={14} />
            <span>Sigue tu pedido</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
