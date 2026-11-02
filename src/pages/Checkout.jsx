import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { usePerfumes } from "../hooks/usePerfumes";

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const size = searchParams.get("size") || "";
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { perfumesData, loading } = usePerfumes();
  const lang = i18n.language || "en";

  const product = perfumesData.find((p) => p.id.toString() === id);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        productId: product.id,
        productNameEn: product.name?.en || "",
        productNameAr: product.name?.ar || "",
        size: size,
        price: product.price || "N/A",
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert(lang === "ar" ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى." : "Error submitting order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white pt-20">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-white pt-20">
        <h2 className="text-2xl font-serif text-dark mb-4">
          {lang === "ar" ? "المنتج غير موجود" : "Product not found"}
        </h2>
        <button onClick={() => navigate(-1)} className="text-gold hover:underline">
          {lang === "ar" ? "العودة للتسوق" : "Go back to shopping"}
        </button>
      </div>
    );
  }

  const productName = product?.name?.[lang] || "";

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 bg-warm-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full rounded-3xl p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.03)] border border-dark/5"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-serif text-dark mb-2">
            {lang === "ar" ? "تم استلام طلبك بنجاح!" : "Order Received Successfully!"}
          </h2>
          <p className="text-gray-500 mb-8">
            {lang === "ar" 
              ? "سنتواصل معك قريباً لتأكيد الطلب وترتيب الشحن." 
              : "We will contact you shortly to confirm the order and arrange shipping."}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="w-full py-4 bg-dark text-warm-white font-bold rounded-xl hover:bg-gold transition-colors uppercase tracking-widest text-sm"
          >
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 bg-warm-white"
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className={`transition-transform ${lang === "ar" ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1"}`} />
          <span className="text-sm font-medium uppercase tracking-wider">{t("back")}</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Order Summary */}
          <div className="w-full md:w-1/3 order-2 md:order-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-dark/5">
              <h3 className="text-lg font-serif text-dark mb-4 border-b border-gray-100 pb-3">
                {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h3>
              <div className="flex gap-4 items-center mb-4">
                <div className="w-20 h-20 bg-warm-white rounded-xl flex items-center justify-center p-2 shrink-0">
                  <img src={product.images?.[0] || product.image} alt={productName} className="object-contain w-full h-full" />
                </div>
                <div>
                  <h4 className="font-medium text-dark line-clamp-2">{productName}</h4>
                  {size && <p className="text-sm text-gray-500 mt-1">{size}</p>}
                </div>
              </div>
              {product.price && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="text-gray-500">{lang === "ar" ? "السعر" : "Price"}</span>
                  <span className="font-bold text-gold text-lg">{product.price} {lang === "ar" ? "جنيه" : "EGP"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="w-full md:w-2/3 order-1 md:order-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-dark/5">
              <h2 className="text-2xl font-serif text-dark mb-6">
                {lang === "ar" ? "تفاصيل التوصيل" : "Delivery Details"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === "ar" ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30"
                    placeholder={lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30 text-left"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === "ar" ? "عنوان التوصيل" : "Delivery Address"}
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30 resize-none"
                    placeholder={lang === "ar" ? "المحافظة، المدينة، الشارع، رقم المبنى" : "City, Street, Building Number"}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-dark text-warm-white font-bold rounded-xl hover:bg-gold transition-colors uppercase tracking-widest text-sm mt-4 disabled:opacity-70 disabled:hover:bg-dark flex items-center justify-center"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-warm-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    lang === "ar" ? "تأكيد الطلب" : "Confirm Order"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
