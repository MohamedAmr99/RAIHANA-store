import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const categoriesData = [
  {
    id: "perfumes",
    title: "Perfumes",
    subcategories: ["Men", "Women", "Unisex"],
    image: "images/perfume.png",
  },
  {
    id: "incense",
    title: "Incense",
    subcategories: ["Oud", "Bakhoor", "Incense Sticks"],
    image: "images/incense.png",
  },
  {
    id: "diffusers",
    title: "Diffusers",
    subcategories: ["Reed", "Electric", "Aroma Oils"],
    image: "images/Diffusers.png",
  },
];

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    if (category.id === "perfumes") {
      navigate("/perfumes");
    } else if (category.id === "incense") {
      navigate("/incense");
    } else if (category.id === "diffusers") {
      navigate("/diffusers");
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative h-40 sm:h-64 md:h-96 rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
    >
      {/* Background Image with Hover Scale */}
      <motion.img
        src={category.image}
        alt={category.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/50"></div>

      {/* Content */}
      <div className="absolute inset-0 p-2 md:p-8 flex flex-col justify-end items-center text-center">
        <h3 className="text-base sm:text-2xl md:text-3xl font-serif text-white mb-1 md:mb-4 tracking-wider">
          {t(category.title)}
        </h3>
        <div className="flex flex-wrap justify-center gap-1 md:gap-2 transform translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {category.subcategories.map((sub, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 md:px-3 md:py-1 bg-white/20 backdrop-blur-sm text-white text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider rounded-full border border-white/30"
            >
              {t(sub)}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Categories = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
    rootMargin: "50px 0px 0px 0px",
  });

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
    <section id="categories" className="py-24 px-4 bg-warm-white w-full">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif text-dark mb-4">
            {t("shop_by_category")}
          </h2>
          <div className="w-16 h-px bg-gold mx-auto"></div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8"
        >
          {categoriesData.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;
