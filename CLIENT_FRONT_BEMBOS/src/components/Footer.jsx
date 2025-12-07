import React from 'react';
import { Facebook, Youtube, Twitter, Instagram, BookOpen } from 'lucide-react';
import bembosLogo from '../assets/Bembos_logo.svg';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Social */}
          <div>
            <img 
              src={bembosLogo} 
              alt="Bembos" 
              className="h-16 mb-6"
            />
            <p className="text-sm text-gray-600 mb-4 font-semibold">Síguenos en</p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/bembos/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#0033A0] hover:text-white flex items-center justify-center transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.youtube.com/user/BembosCanal" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#0033A0] hover:text-white flex items-center justify-center transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://twitter.com/BembosOficial" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#0033A0] hover:text-white flex items-center justify-center transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/bembosoficial" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#0033A0] hover:text-white flex items-center justify-center transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Nuestros Productos */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Nuestros Productos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.bembos.com.pe/menu/promociones" className="text-gray-600 hover:text-[#0033A0] transition-colors">Promociones</a></li>
              <li><a href="https://www.bembos.com.pe/menu/combos" className="text-gray-600 hover:text-[#0033A0] transition-colors">Combos</a></li>
              <li><a href="https://www.bembos.com.pe/menu/hamburguesas" className="text-gray-600 hover:text-[#0033A0] transition-colors">Hamburguesas</a></li>
              <li><a href="https://www.bembos.com.pe/menu/pollo" className="text-gray-600 hover:text-[#0033A0] transition-colors">Pollo</a></li>
              <li><a href="https://www.bembos.com.pe/menu/complementos" className="text-gray-600 hover:text-[#0033A0] transition-colors">Complementos</a></li>
              <li><a href="https://www.bembos.com.pe/menu/menus" className="text-gray-600 hover:text-[#0033A0] transition-colors">Menús</a></li>
              <li><a href="https://www.bembos.com.pe/menu/helados" className="text-gray-600 hover:text-[#0033A0] transition-colors">Helados</a></li>
              <li><a href="https://www.bembos.com.pe/menu/bebidas" className="text-gray-600 hover:text-[#0033A0] transition-colors">Bebidas</a></li>
              <li><a href="https://www.bembos.com.pe/menu/loncheritas" className="text-gray-600 hover:text-[#0033A0] transition-colors">Loncheritas</a></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-[#0033A0] transition-colors">Comprobante electrónico</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#0033A0] transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#0033A0] transition-colors">Términos y condiciones de promociones</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#0033A0] transition-colors">Políticas de datos personales</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#0033A0] transition-colors">Derechos Arco</a></li>
              <li><a href="https://www.bembos.com.pe/politicas-de-cookies" className="text-gray-600 hover:text-[#0033A0] transition-colors">Política de cookies</a></li>
            </ul>
          </div>

          {/* Libro de Reclamaciones & Métodos de Pago */}
          <div>
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Libro de Reclamaciones</h3>
              <a href="https://www.bembos.com.pe/bembos-reclamaciones/" className="inline-block">
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <BookOpen size={32} className="text-[#0033A0]" />
                  <span className="text-xs font-bold text-gray-700">LIBRO DE<br/>RECLAMACIONES</span>
                </div>
              </a>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Métodos de Pago</h3>
              <div className="flex gap-2">
                <img src="https://www.bembos.com.pe/media/wysiwyg/bembos/pagos.png" alt="Métodos de Pago" className="h-8" />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Bembos App</h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="inline-block">
                  <img 
                    src="https://www.bembos.com.pe/media/wysiwyg/bembos/google-play.png" 
                    alt="Google Play" 
                    className="h-10"
                  />
                </a>
                <a href="#" className="inline-block">
                  <img 
                    src="https://www.bembos.com.pe/media/wysiwyg/bembos/app-store.png" 
                    alt="App Store" 
                    className="h-10"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
