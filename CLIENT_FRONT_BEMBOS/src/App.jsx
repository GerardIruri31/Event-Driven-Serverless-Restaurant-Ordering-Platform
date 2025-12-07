import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Promos from './pages/Promos'
import Checkout from './pages/Checkout'
import ProductDetail from './pages/ProductDetail'
import Locales from './pages/Locales'
import Login from './pages/Login'
import Register from './pages/Register'
import Cupones from './pages/Cupones'
import Favoritos from './pages/Favoritos'
import CartDrawer from './components/CartDrawer'
import { CartProvider } from './context/CartContext'
import PaymentSuccess from './pages/PaymentSuccess'
import Orders from './pages/Orders'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-white font-sans">
          <Header />
          <CartDrawer />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/promociones" element={<Promos />} />
              <Route path="/cupones" element={<Cupones />} />
              <Route path="/producto/:productId" element={<ProductDetail />} />
              <Route path="/locales" element={<Locales />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pago-exitoso" element={<PaymentSuccess />} />
              <Route path="/pedidos" element={<Orders />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
