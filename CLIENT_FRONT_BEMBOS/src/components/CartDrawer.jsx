import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { 
    isCartOpen, 
    toggleCart, 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartTotal 
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#193058] text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Mi Pedido</h2>
              <button onClick={toggleCart} className="hover:text-yellow-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-lg font-semibold mb-2">Tu carrito está vacío</p>
                  <p className="text-sm">¡Agrega algunas hamburguesas deliciosas!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 border-b border-gray-100 pb-4">
                      <img 
                        src={item.imageUrl || item.image} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded-md"
                        onError={(e) => e.target.src = 'https://placehold.co/80x80?text=Producto'}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-[#193058] text-sm line-clamp-2">{item.name}</h3>
                        
                        {/* Show selections if exists */}
                        {item.selections && (
                          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                            {Object.entries(item.selections).map(([key, items]) => {
                              if (items && items.length > 0) {
                                return (
                                  <div key={key}>
                                    <span className="font-semibold capitalize">{key}: </span>
                                    {items.map((sel, idx) => (
                                      <span key={idx}>
                                        {sel.name} {sel.quantity > 1 ? `x${sel.quantity}` : ''}
                                        {idx < items.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                        
                        <p className="text-[#0033A0] font-bold mt-1">
                          S/ {((item.totalPrice || item.price) * item.quantity).toFixed(2)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 text-[#193058]"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm font-bold text-[#193058]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 text-[#193058]"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-bold">Total a pagar</span>
                  <span className="text-2xl font-extrabold text-[#193058]">S/ {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#ffb500] hover:bg-[#e5a300] text-[#193058] font-bold py-3 rounded-full transition-colors uppercase tracking-wide"
                >
                  Continuar Compra
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
