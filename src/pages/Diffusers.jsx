import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import { usePerfumes } from '../hooks/usePerfumes';

const FILTERS = [
  { id: 'all', label: 'all_collection' },
  { id: 'steam', label: 'steam' },
  { id: 'charcoal', label: 'charcoal' },
  { id: 'electric', label: 'electric' }
];

const Diffusers = () => {
  const { t } = useTranslation();
  const { perfumesData, loading } = usePerfumes();

  useEffect(() => {
    document.title = t('title_diffusers');
  }, [t]);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter first by category=diffusers, then by the specific type sub-filter
  const diffusersProducts = perfumesData.filter(p => p.category === 'diffusers');
  const filteredProducts = diffusersProducts.filter(product => {
    if (activeFilter === 'all') return true;
    return product.type === activeFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-warm-white flex flex-col pt-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 w-full flex-grow">
        
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
           className="text-center mb-12"
        >
          <h1 className="text-5xl font-serif text-dark mb-4">{t("diffusers_page")}</h1>
          <div className="w-16 h-[1px] bg-gold mx-auto mb-6"></div>
          <p className="text-gray-soft max-w-2xl mx-auto font-light">
            {t("diffusers_page_desc")}
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-all duration-300 border ${
                activeFilter === filter.id 
                  ? 'bg-dark text-white border-dark' 
                  : 'bg-transparent text-gray-500 border-gray-300 hover:border-gold hover:text-dark'
              }`}
            >
              {t(filter.label)}
            </button>
          ))}
        </div>

        {/* Animated Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-20 font-light">
            No products found in this category yet.
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 pb-24">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Diffusers;
