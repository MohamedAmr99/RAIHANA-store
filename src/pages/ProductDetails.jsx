import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../hooks/useSettings";
import { usePerfumes } from "../hooks/usePerfumes";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { perfumesData, loading } = usePerfumes();

  const product = perfumesData.find((p) => p.id.toString() === id);
  const lang = i18n.language || "en";

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");

  const images =
    product?.images?.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];
  const defaultSizes = ["men", "women", "unisex"].includes(product?.category)
    ? ["50ML", "100ML"]
    : [];
  const sizes = useMemo(() => product?.sizes || defaultSizes, [product]);

  useEffect(() => {
    if (product) {
      setActiveImgIdx(0);
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
      }
    }
  }, [product, sizes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <h2 className="text-2xl font-serif text-dark mb-4">
          {lang === "ar" ? "المنتج غير موجود" : "Product not found"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-gold hover:underline"
        >
          {lang === "ar" ? "العودة للتسوق" : "Go back to shopping"}
        </button>
      </div>
    );
  }

  const productName = product?.name?.[lang] || "";
  const productDesc = product?.description?.[lang] || "";
  const productNotes = product?.notes?.[lang] || [];

  const topNotes = productNotes[0] || (lang === "ar" ? "غير متوفر" : "N/A");
  const middleNotes = productNotes[1] || (lang === "ar" ? "غير متوفر" : "N/A");
  const baseNotes = productNotes[2] || (lang === "ar" ? "غير متوفر" : "N/A");

  const defaultMsg =
    lang === "ar"
      ? `مرحبًا، أريد معرفة سعر عطر ${productName} (حجم ${selectedSize})`
      : `Hello, I want to know the price of ${productName} (${selectedSize} size)`;

  const whatsappMsg = (settings.whatsappTemplate || defaultMsg)
    .replace("{product}", productName)
    .replace("{size}", selectedSize);

  const nextImg = () => setActiveImgIdx((p) => (p + 1) % images.length);
  const prevImg = () =>
    setActiveImgIdx((p) => (p - 1 + images.length) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen pt-24 pb-12 px-4 bg-warm-white flex lg:items-center"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors group"
          >
            <ArrowLeft
              size={20}
              className={`transition-transform ${lang === "ar" ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1"}`}
            />
            <span className="text-sm font-medium uppercase tracking-wider">
              {t("back")}
            </span>
          </button>
        </div>

        <div className="bg-white w-full rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="lg:w-1/2 relative h-96 sm:h-[500px] lg:h-[700px] bg-beige flex items-center justify-center group shrink-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImgIdx}
                src={images[activeImgIdx]}
                alt={productName}
                className="w-full h-full object-contain p-8 lg:p-16 mix-blend-multiply drop-shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -50) {
                    nextImg();
                  } else if (offset.x > 50) {
                    prevImg();
                  }
                }}
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  aria-label="Previous image"
                  className="absolute left-2 lg:left-6 p-2 lg:p-4 rounded-full bg-white/60 lg:bg-white/40 backdrop-blur-md shadow-sm hover:bg-white hover:shadow-md text-dark transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImg}
                  aria-label="Next image"
                  className="absolute right-2 lg:right-6 p-2 lg:p-4 rounded-full bg-white/60 lg:bg-white/40 backdrop-blur-md shadow-sm hover:bg-white hover:shadow-md text-dark transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-4 lg:bottom-8 flex gap-2 lg:gap-3 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIdx(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === activeImgIdx ? "bg-gold w-6 lg:w-8" : "bg-dark/30 w-2 hover:bg-dark/50"}`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            <div>
              <div className="uppercase tracking-widest text-gold text-xs lg:text-sm font-semibold mb-3">
                {t(product.category)} {t("collection")}
              </div>
              <h1 className="text-4xl lg:text-5xl md:text-6xl font-serif text-dark mb-6 tracking-tight leading-tight">
                {productName}
              </h1>
              {product?.price && (
                <div className="text-2xl font-bold text-gold mb-6">
                  {product.price} {lang === "ar" ? "جنيه" : "EGP"}
                </div>
              )}
              <div className="w-16 h-1 bg-gold mb-8 rounded-full"></div>

              <p className="text-gray-600 font-light leading-relaxed mb-10 text-base lg:text-lg">
                {productDesc}
              </p>

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-10">
                  <span className="text-xs lg:text-sm uppercase tracking-widest text-gray-400 block mb-4">
                    {lang === "ar" ? "اختر الحجم" : "Select Size"}
                  </span>
                  <div className="flex gap-4">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-8 py-3 rounded-full text-sm font-bold transition-all border-2 ${selectedSize === size ? "bg-dark border-dark text-white shadow-lg scale-105" : "bg-transparent border-gray-200 text-gray-500 hover:border-gold hover:text-dark"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {!["diffusers", "incense"].includes(product.category) && (
                <div className="space-y-5 mb-12 bg-warm-white/50 border border-dark/5 p-6 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-dark/5 pb-4 gap-2 sm:gap-6">
                    <span className="text-[11px] lg:text-xs uppercase tracking-widest text-gray-500 shrink-0 font-medium">
                      {t("top_notes")}
                    </span>
                    <span className="text-sm lg:text-base text-dark font-medium sm:text-right">
                      {topNotes}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-dark/5 pb-4 gap-2 sm:gap-6">
                    <span className="text-[11px] lg:text-xs uppercase tracking-widest text-gray-500 shrink-0 font-medium">
                      {t("middle_notes")}
                    </span>
                    <span className="text-sm lg:text-base text-dark font-medium sm:text-right">
                      {middleNotes}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-6">
                    <span className="text-[11px] lg:text-xs uppercase tracking-widest text-gray-500 shrink-0 font-medium">
                      {t("base_notes")}
                    </span>
                    <span className="text-sm lg:text-base text-dark font-medium sm:text-right">
                      {baseNotes}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {["men", "women", "unisex"].includes(product.category) ? (
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-5 lg:py-6 bg-dark text-warm-white uppercase tracking-widest text-sm lg:text-base font-bold hover:bg-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-1 transition-all duration-300 rounded-xl mt-auto overflow-hidden group relative"
              >
                <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-out_infinite]" />
                <MessageCircle size={20} className="relative z-10" />
                <span className="relative z-10">{t("inquire_whatsapp")}</span>
              </a>
            ) : (
              <button
                onClick={() => navigate(`/checkout/${product.id}?size=${selectedSize}`)}
                className="flex items-center justify-center gap-3 w-full py-5 lg:py-6 bg-dark text-warm-white uppercase tracking-widest text-sm lg:text-base font-bold hover:bg-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-1 transition-all duration-300 rounded-xl mt-auto overflow-hidden group relative"
              >
                <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-out_infinite]" />
                <ShoppingBag size={20} className="relative z-10" />
                <span className="relative z-10">{lang === "ar" ? "إتمام الطلب" : "Checkout"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
