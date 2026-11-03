import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const lang = i18n.language || "en";

  const productName = product?.name?.[lang] || "";
  const productDesc = product?.description?.[lang] || "";

  // Determine the default size and price (always show the minimum starting price)
  let displayPrice = product?.price ? Number(product.price) : null;
  let hasMultiplePrices = false;

  if (product?.sizePrices && Object.keys(product.sizePrices).length > 0) {
    const validPrices = Object.values(product.sizePrices)
      .map(Number)
      .filter((p) => !isNaN(p) && p > 0);
    if (validPrices.length > 0) {
      displayPrice = Math.min(...validPrices);
      hasMultiplePrices = validPrices.length > 1;
    }
  }

  // Pick the size that corresponds to the minimum/default price
  const defaultSize = ["men", "women", "unisex"].includes(product?.category)
    ? (product?.sizePrices?.["50ML"]
        ? "50ML"
        : product?.sizes?.[0] || "50ML")
    : "";

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, defaultSize, 1);
  };

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
      <div className="relative aspect-4/5 bg-warm-white w-full overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Subtle Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-linear-to-t from-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

        <motion.img
          src={product.images?.[0] || product.image}
          alt={productName}
          loading="lazy"
          className="object-cover w-full h-full relative z-0 rounded-xl"
          initial={{ filter: "brightness(0.95)", scale: 1 }}
          whileHover={{ filter: "brightness(1)", scale: 1.05 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      <div className="p-6 flex flex-col grow text-center items-center justify-between relative z-20 bg-white">
        <div className="w-full">
          <h3 className="text-xl font-serif text-dark mb-2 group-hover:text-gold transition-colors duration-300">
            {productName}
          </h3>
          <p className="text-gray-soft text-sm font-light mb-4 line-clamp-2 leading-relaxed">
            {productDesc}
          </p>

          {displayPrice && (
            <div className="text-gold font-bold text-lg mb-4">
              {hasMultiplePrices && (
                <span className="text-xs font-normal text-gray-400 block mb-0.5">
                  {lang === "ar" ? "يبدأ من" : "Starting from"}
                </span>
              )}
              {displayPrice} {lang === "ar" ? "جنيه" : "EGP"}
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="w-full flex items-center gap-2 pt-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-4 bg-dark text-warm-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-gold hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag size={15} />
            <span>{lang === "ar" ? "أضف للسلة" : "Add to Cart"}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:border-gold hover:text-gold transition-colors"
            title={lang === "ar" ? "عرض التفاصيل" : "View Details"}
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
