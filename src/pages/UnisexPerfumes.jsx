import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePerfumes } from "../hooks/usePerfumes";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";

const UnisexPerfumes = () => {
  const { t } = useTranslation();
  const { perfumesData, loading } = usePerfumes();

  useEffect(() => {
    document.title = t('title_unisex');
  }, [t]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unisexPerfumes = perfumesData.filter((p) => p.category === "unisex");

  return (
    <motion.div
      className="min-h-screen bg-warm-white flex flex-col pt-24 pb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Luxury Section Header */}
        <div className="text-center mb-16 pt-8">
          <Link
            to="/perfumes"
            className="text-gray-400 hover:text-gold text-sm uppercase tracking-widest mb-6 inline-block transition-colors duration-300"
          >
            {document.documentElement.dir === "rtl" ? "→" : "←"}{" "}
            {t("back_to_categories")}
          </Link>
          <h1 className="text-5xl font-serif text-dark mb-4">
            {t("unisex_perfumes")}
          </h1>
          <div className="w-16 h-[1px] bg-gold mx-auto mb-6"></div>
          <p className="text-gray-soft max-w-2xl mx-auto font-light">
            {t("unisex_perfumes_desc")}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {unisexPerfumes.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UnisexPerfumes;
