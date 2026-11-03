import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSettings } from "../hooks/useSettings";

const CartDrawer = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || "en";
  const isRtl = lang === "ar";
  const { settings } = useSettings();

  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
  } = useCart();

  const shippingCost = Number(settings.shippingFee) || 0;
  // Note: exact shipping per city is calculated at checkout after city selection
  const total = cartSubtotal + (cart.length > 0 ? shippingCost : 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: isRtl ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`relative ml-auto w-full max-w-md bg-[#0d0d0d] text-white shadow-2xl flex flex-col h-full border-${
              isRtl ? "r" : "l"
            } border-gold/20 z-50`}
            style={{ [isRtl ? "marginRight" : "marginLeft"]: "auto" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#121212]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-semibold text-white">
                    {lang === "ar" ? "سلة المشتريات" : "Shopping Cart"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {cartCount}{" "}
                    {lang === "ar"
                      ? cartCount === 1
                        ? "منتج"
                        : "منتجات"
                      : cartCount === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-white/5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-gold/30 flex items-center justify-center text-gray-500 mb-4">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-lg font-serif font-medium text-white mb-2">
                    {lang === "ar" ? "سلتك فارغة حالياً" : "Your cart is empty"}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-6">
                    {lang === "ar"
                      ? "استكشف مجموعتنا الفاخرة من العطور المستوحاة والبخور وأضف ما يناسبك."
                      : "Explore our luxury perfume and incense collection and add your favorites."}
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate("/perfumes");
                    }}
                    className="px-6 py-2.5 rounded-full border border-gold text-gold hover:bg-gold hover:text-black font-medium text-sm transition-all duration-300"
                  >
                    {lang === "ar" ? "تصفح العطور" : "Explore Perfumes"}
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const itemName = item.name?.[lang] || item.name?.en || item.name || "";
                  return (
                    <motion.div
                      layout
                      key={item.cartItemId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="pt-4 first:pt-0 flex gap-4 items-center"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.image}
                          alt={itemName}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {itemName}
                        </h4>
                        {item.size && (
                          <span className="inline-block text-[11px] font-bold text-gold/80 bg-gold/10 px-2 py-0.5 rounded-md mt-1">
                            {item.size}
                          </span>
                        )}
                        <p className="text-sm font-bold text-gold mt-1.5">
                          {item.price} {lang === "ar" ? "جنيه" : "EGP"}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col items-end justify-between h-20 py-1">
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                          title={lang === "ar" ? "إزالة" : "Remove"}
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="flex items-center border border-white/10 rounded-lg bg-white/5 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="p-1 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="p-1 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#121212] space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>{lang === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span className="font-medium text-white">
                      {cartSubtotal} {lang === "ar" ? "جنيه" : "EGP"}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>{lang === "ar" ? "الشحن" : "Shipping"}</span>
                      <span className="font-medium text-white">
                        {shippingCost} {lang === "ar" ? "جنيه" : "EGP"}
                      </span>
                    </div>
                  )}
                  {/* City-based shipping note */}
                  <p className="text-[11px] text-gray-500 italic">
                    {lang === "ar"
                      ? "⚠️ سعر الشحن يُحدَّد حسب المحافظة عند الدفع"
                      : "⚠️ Exact shipping calculated at checkout by city"}
                  </p>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10 text-white">
                    <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
                    <span className="text-gold font-serif text-lg">
                      {total} {lang === "ar" ? "جنيه" : "EGP"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl bg-gold hover:bg-gold/90 text-black font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] cursor-pointer"
                >
                  <span>{lang === "ar" ? "إتمام الشراء" : "Proceed to Checkout"}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
                >
                  {lang === "ar" ? "← متابعة التسوق" : "Continue Shopping →"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

