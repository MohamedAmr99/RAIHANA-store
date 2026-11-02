import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";

const Section = ({ title, products, id }) => {
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  });

  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const scrollContainerRef = useRef(null);

  const scroll = (dir) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.85;
      const scrollValue =
        dir === "next"
          ? isRTL
            ? -scrollAmount
            : scrollAmount
          : isRTL
            ? scrollAmount
            : -scrollAmount;
      scrollContainerRef.current.scrollBy({
        left: scrollValue,
        behavior: "smooth",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section id={id} className="py-24 px-4 bg-warm-white w-full">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif text-dark mb-4">{title}</h2>
          <div className="w-16 h-px bg-gold mx-auto"></div>
        </motion.div>

        <div className="relative">
          {/* Scroll Arrows for Mobile */}
          <button
            onClick={() => scroll("prev")}
            aria-label="Scroll left"
            className={`md:hidden absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm text-dark rounded-full shadow-lg border border-gold/20 hover:bg-gold hover:text-white transition-colors ${isRTL ? "-right-4" : "-left-4"}`}
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            onClick={() => scroll("next")}
            aria-label="Scroll right"
            className={`md:hidden absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm text-dark rounded-full shadow-lg border border-gold/20 hover:bg-gold hover:text-white transition-colors ${isRTL ? "-left-4" : "-right-4"}`}
          >
            {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          <motion.div
            ref={(node) => {
              scrollContainerRef.current = node;
              inViewRef(node);
            }}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 pb-8 md:pb-0"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[85vw] min-w-[280px] max-w-[320px] shrink-0 snap-center md:w-auto md:min-w-0 md:max-w-none md:shrink"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Section;
