import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const lang = i18n.language || "en";

  const productName = product?.name?.[lang] || "";
  const productDesc = product?.description?.[lang] || "";

  const defaultMsg =
    lang === "ar"
      ? `مرحبًا، أريد معرفة سعر عطر ${productName}`
      : `Hello, I want to know the price of ${productName}`;

  const whatsappMsg = (settings.whatsappTemplate || defaultMsg)
    .replace("{product}", productName)
    .replace("{size}", ""); // No size selection on card

  return (
      <motion.div
        className="relative bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-500 border border-transparent hover:border-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col h-full group cursor-pointer"
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
          },
        }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative aspect-4/5 bg-warm-white w-full overflow-hidden flex items-center justify-center p-8">
          {/* Subtle Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-linear-to-t from-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

          <motion.img
            src={product.images?.[0] || product.image}
            alt={productName}
            loading="lazy"
            className="object-contain w-full h-full relative z-0"
            initial={{ filter: "brightness(0.95)", scale: 1 }}
            whileHover={{ filter: "brightness(1)", scale: 1.08 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>

        <div className="p-6 flex flex-col grow text-center items-center justify-between relative z-20 bg-white">
          <div>
            <h3 className="text-xl font-serif text-dark mb-2 group-hover:text-gold transition-colors duration-300">
              {productName}
            </h3>
            <p className="text-gray-soft text-sm font-light mb-6 leading-relaxed">
              {productDesc}
            </p>
            {product?.price && (
              <p className="text-gold font-bold mb-4">
                {product.price} {lang === "ar" ? "جنيه" : "EGP"}
              </p>
            )}
          </div>

          {["men", "women", "unisex"].includes(product.category) ? (
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking button
              className="px-6 py-2 border border-dark text-dark text-sm uppercase tracking-wider hover:bg-gold hover:border-gold hover:text-white hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 rounded-full w-full inline-block"
            >
              {t("inquire_now")}
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/checkout/${product.id}`);
              }}
              className="px-6 py-2 border border-dark text-dark text-sm uppercase tracking-wider hover:bg-gold hover:border-gold hover:text-white hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 rounded-full w-full inline-block"
            >
              {lang === "ar" ? "اطلب الآن" : "Order Now"}
            </button>
          )}
        </div>
      </motion.div>
  );
};

export default ProductCard;
