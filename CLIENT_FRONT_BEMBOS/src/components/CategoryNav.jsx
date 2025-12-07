import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import local images for buttons
import imgPromos from '../assets/botones/CATEGORIA_DESKTOP_-_PROMOS_EXCL.webp';
import imgCombos from '../assets/botones/CATEGORIA_DESKTOP_-_COMBOS.webp';
import imgHamburguesas from '../assets/botones/CATEGORIA_DESKTOP_-_HAMBURGUESA.webp';
import imgMenus from '../assets/botones/CATEGORIA_DESKTOP_-_MENUS.webp';
import imgPollo from '../assets/botones/CATEGORIA_DESKTOP_-_POLLO.webp';
import imgLoncheritas from '../assets/botones/Loncherita_hamburguesa_384x320.webp';
import imgComplementos from '../assets/botones/CATEGORIA_DESKTOP_-_COMPLEMENTOS_3.webp';

const categories = [
  {
    id: 1,
    name: 'Semana Bravaza',
    image: imgComplementos, // Using complementos as placeholder for Semana Bravaza
    link: '/promociones'
  },
  {
    id: 2,
    name: 'Promos Exclusivas',
    image: imgPromos,
    link: '/promociones'
  },
  {
    id: 3,
    name: 'Combos',
    image: imgCombos,
    link: '/menu#combos'
  },
  {
    id: 4,
    name: 'Hamburguesas',
    image: imgHamburguesas,
    link: '/menu#hamburguesas'
  },
  {
    id: 5,
    name: 'Bembos Menús',
    image: imgMenus,
    link: '/menu#bembos_menus'
  },
  {
    id: 6,
    name: 'Pollo',
    image: imgPollo,
    link: '/menu#pollo'
  },
  {
    id: 7,
    name: 'Loncheritas',
    image: imgLoncheritas,
    link: '/menu#loncherita'
  }
];

const CategoryNav = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white py-6 border-b border-gray-200 relative">
      <div className="container mx-auto px-4 md:px-12 relative">
        
        {/* Left Navigation Button */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50 text-[#0033A0] hidden md:flex transition-transform hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <div 
          ref={scrollRef}
          className="flex items-center justify-start gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
        >
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.link}
              className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-6 py-3 shadow-sm hover:shadow-md hover:border-[#0033A0] transition-all min-w-max group"
            >
              <span className="text-lg font-bold text-gray-700 group-hover:text-[#0033A0] transition-colors whitespace-nowrap">
                {category.name}
              </span>
              <img
                src={category.image}
                alt={category.name}
                className="w-12 h-12 object-contain"
              />
            </a>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50 text-[#0033A0] hidden md:flex transition-transform hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>

      </div>
    </div>
  );
};

export default CategoryNav;
