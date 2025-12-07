import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load from local storage on initial render
    const savedCart = localStorage.getItem('bembos_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Save to local storage whenever cart changes
    localStorage.setItem('bembos_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Create a unique identifier considering size variations and product specifics
      const productKey = product.selectedSize 
        ? `${product.nombre_producto || product.nombre_combo || product.name}-${product.selectedSize}` 
        : (product.nombre_producto || product.nombre_combo || product.name || product.id);
      
      const existingItem = prevItems.find(item => {
        const itemKey = item.selectedSize 
          ? `${item.nombre_producto || item.nombre_combo || item.name}-${item.selectedSize}` 
          : (item.nombre_producto || item.nombre_combo || item.name || item.id);
        return itemKey === productKey;
      });

      if (existingItem) {
        return prevItems.map(item => {
          const itemKey = item.selectedSize 
            ? `${item.nombre_producto || item.nombre_combo || item.name}-${item.selectedSize}` 
            : (item.nombre_producto || item.nombre_combo || item.name || item.id);
          return itemKey === productKey
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item;
        });
      }
      
      // Add new item with standardized structure
      return [...prevItems, { 
        ...product, 
        quantity: product.quantity || 1,
        // Ensure we have all needed fields for display
        name: product.name || product.nombre_producto || product.nombre_combo,
        price: product.price || product.precio || 0,
        imageUrl: product.imageUrl || product.imagen || product.image
      }];
    });
    setIsCartOpen(true); // Open cart when adding item
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartItemForOrder = (item) => {
    // Transform cart item to order format for backend
    return {
      nombre_producto: item.nombre_producto || item.nombre_combo || item.name,
      tenant_id: item.tenant_id || 'default',
      cantidad: item.quantity,
      precio_unitario: item.price || item.precio || 0,
      precio_total: (item.totalPrice || item.price || item.precio || 0) * item.quantity,
      size: item.selectedSize || null,
      observaciones: item.observations || null
    };
  };

  const prepareOrderData = (customerData) => {
    // Prepare complete order for backend submission
    return {
      cliente: customerData,
      items: cartItems.map(item => getCartItemForOrder(item)),
      total: cartTotal,
      fecha: new Date().toISOString(),
      estado: 'PENDIENTE'
    };
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      toggleCart,
      cartTotal,
      cartCount,
      prepareOrderData,
      getCartItemForOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};
