import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-[#193058] p-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute right-10 top-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute left-10 bottom-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          </div>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg"
          >
            <Check size={48} className="text-white stroke-[3]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2 relative z-10"
          >
            ¡Pago realizado con éxito!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg relative z-10"
          >
            Tu pedido está en camino
          </motion.p>
        </div>

        <div className="p-8">
          <div className="flex flex-col gap-4 justify-center">
            <button 
              onClick={() => navigate('/menu')}
              className="w-full px-8 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-[#193058] hover:text-[#193058] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Seguir comprando
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full px-8 py-3.5 rounded-xl bg-[#193058] text-white font-semibold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              Volver al inicio
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
