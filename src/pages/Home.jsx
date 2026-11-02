import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Hero from '../components/Hero'
import Section from '../components/Section'
import Categories from '../components/Categories'
import About from '../components/About'


import { usePerfumes } from '../hooks/usePerfumes';

const Home = () => {
  const { t } = useTranslation();
  const { perfumesData, loading } = usePerfumes();

  useEffect(() => {
    document.title = t('title_home');
  }, [t]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Hero />
      <About />
      <Categories />
      <Section title={t("best_sellers")} products={perfumesData.filter(p => p.bestSeller)} id="best-sellers" />
      <Section title={t("new_arrivals")} products={perfumesData.filter(p => p.trending)} id="new-arrivals" />
      <Section title={t("exclusive_perfumes")} products={perfumesData.filter(p => p.exclusive)} id="perfumes" />
    </motion.div>
  );
};

export default Home;
