import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShoppingBag, MessageCircle } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { usePerfumes } from "../hooks/usePerfumes";
import { useCart } from "../context/CartContext";
import { useSettings } from "../hooks/useSettings";

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const directSize = searchParams.get("size") || "";
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { perfumesData, loading } = usePerfumes();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const lang = i18n.language || "en";
  const isRtl = lang === "ar";

  // Determine if this is a single product direct checkout or a full cart checkout
  const singleProduct = id ? perfumesData.find((p) => p.id.toString() === id) : null;
  const isDirectCheckout = Boolean(id && singleProduct);

  // Calculate items and totals
  let orderItems = [];
  let subtotal = 0;

  if (isDirectCheckout && singleProduct) {
    let itemPrice = Number(singleProduct.price) || 0;
    if (directSize && singleProduct.sizePrices && singleProduct.sizePrices[directSize]) {
      itemPrice = Number(singleProduct.sizePrices[directSize]);
    }
    orderItems = [
      {
        id: singleProduct.id,
        nameEn: singleProduct.name?.en || "",
        nameAr: singleProduct.name?.ar || "",
        size: directSize,
        price: itemPrice,
        quantity: 1,
        image: singleProduct.images?.[0] || singleProduct.image || "",
      },
    ];
    subtotal = itemPrice;
  } else {
    orderItems = cart.map((item) => ({
      id: item.productId,
      nameEn: item.name?.en || "",
      nameAr: item.name?.ar || "",
      size: item.size || "",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || "",
    }));
    subtotal = cartSubtotal;
  }

  // ─── Egyptian Governorates ───────────────────────────────────────────────────
  const EGYPTIAN_GOVERNORATES = [
    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الغربية", "المنوفية",
    "الشرقية", "كفر الشيخ", "دمياط", "بورسعيد", "الإسماعيلية", "السويس",
    "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر",
    "أسوان", "مطروح", "شمال سيناء", "جنوب سيناء", "البحر الأحمر", "الوادي الجديد",
  ];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  // ─── Reactive shipping cost based on selected city ───────────────────────────
  const shippingCost = useMemo(() => {
    if (!formData.city) return Number(settings.shippingFee) || 0;
    const rates = settings.shippingRates || {};
    const cityRate = rates[formData.city];
    if (cityRate !== undefined) return Number(cityRate);
    const defaultRate = rates["default"];
    if (defaultRate !== undefined) return Number(defaultRate);
    return Number(settings.shippingFee) || 0;
  }, [formData.city, settings]);

  const totalAmount = subtotal + (orderItems.length > 0 ? shippingCost : 0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    setSubmitting(true);
    try {
      // Payload matching firestore.rules strict validation
      const payload = {
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        city: formData.city.trim() || "",
        notes: formData.notes.trim() || "",
        items: orderItems,
        subtotal: Number(subtotal),
        shippingCost: Number(shippingCost),
        totalAmount: Number(totalAmount),
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), payload);

      setLastOrderDetails({
        ...payload,
        customerName: formData.name,
        customerPhone: formData.phone,
        snapshotTotal: Number(totalAmount),
        snapshotSubtotal: Number(subtotal),
        snapshotShipping: Number(shippingCost),
        snapshotCity: formData.city,
        snapshotItems: [...orderItems],
      });

      if (!isDirectCheckout) {
        clearCart();
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error creating order: ", error);
      alert(
        lang === "ar"
          ? "حدث خطأ أثناء إرسال الطلب. يرجى مراجعة البيانات والمحاولة مجدداً."
          : "Error submitting order. Please check details and try again."
      );
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

  // If directly checking out an invalid product ID
  if (id && !singleProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-white pt-20">
        <h2 className="text-2xl font-serif text-dark mb-4">
          {lang === "ar" ? "المنتج غير موجود" : "Product not found"}
        </h2>
        <button
          onClick={() => navigate("/perfumes")}
          className="text-gold hover:underline cursor-pointer"
        >
          {lang === "ar" ? "العودة للتسوق" : "Go back to shopping"}
        </button>
      </div>
    );
  }

  // If regular checkout and cart is empty
  if (!isDirectCheckout && cart.length === 0 && !success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-white pt-20 px-4 text-center">
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-3xl font-serif text-dark mb-3">
          {lang === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"}
        </h2>
        <p className="text-gray-500 max-w-md mb-8">
          {lang === "ar"
            ? "لم تقم بإضافة أي منتجات للسلة بعد. استكشف مجموعتنا الفاخرة واختر ما يعجبك."
            : "You haven't added any items to your cart yet. Discover our premium collection now."}
        </p>
        <button
          onClick={() => navigate("/perfumes")}
          className="px-8 py-3.5 bg-dark text-warm-white font-bold rounded-xl hover:bg-gold hover:text-black transition-colors uppercase tracking-widest text-sm cursor-pointer"
        >
          {lang === "ar" ? "تصفح العطور" : "Explore Perfumes"}
        </button>
      </div>
    );
  }

  if (success && lastOrderDetails) {
    // Use snapshotted values captured at submit time (avoids stale-closure "0" bug)
    const displayTotal    = lastOrderDetails.snapshotTotal    ?? lastOrderDetails.totalAmount ?? 0;
    const displaySubtotal = lastOrderDetails.snapshotSubtotal ?? lastOrderDetails.subtotal    ?? 0;
    const displayShipping = lastOrderDetails.snapshotShipping ?? lastOrderDetails.shippingCost ?? 0;
    const displayCity     = lastOrderDetails.snapshotCity     ?? lastOrderDetails.city         ?? "";
    const displayItems    = lastOrderDetails.snapshotItems    ?? orderItems;

    // Generate WhatsApp confirmation message for customer convenience
    const itemsText = displayItems
      .map(
        (it) =>
          `• ${lang === "ar" ? it.nameAr : it.nameEn} ${
            it.size ? `(${it.size})` : ""
          } × ${it.quantity} = ${it.price * it.quantity} ج.م`
      )
      .join("\n");

    const whatsappSummary =
      lang === "ar"
        ? `مرحباً ريحانة ستور، قمت بعمل طلب جديد:\n\n👤 الاسم: ${formData.name}\n📱 الهاتف: ${formData.phone}\n📍 العنوان: ${formData.address}\n🏙️ المدينة: ${displayCity}\n\n🛍️ المنتجات:\n${itemsText}\n\n🚚 الشحن: ${displayShipping} جنيه\n💵 الإجمالي: ${displayTotal} جنيه مصري.`
        : `Hello RAIHANA Store, I placed a new order:\n\n👤 Name: ${formData.name}\n📱 Phone: ${formData.phone}\n📍 Address: ${formData.address}\n🏙️ City: ${displayCity}\n\n🛍️ Items:\n${itemsText}\n\n🚚 Shipping: ${displayShipping} EGP\n💵 Total: ${displayTotal} EGP.`;

    return (
      <div className="min-h-screen pt-32 pb-16 px-4 bg-warm-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-lg w-full rounded-3xl p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.04)] border border-dark/5"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>

          <h2 className="text-2xl lg:text-3xl font-serif text-dark mb-2">
            {lang === "ar" ? "تم تسجيل طلبك بنجاح!" : "Order Placed Successfully!"}
          </h2>

          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {lang === "ar"
              ? "شكراً لثقتك بريحانة! سيقوم فريقنا بمراجعة طلبك والتواصل معك لتأكيد الشحن."
              : "Thank you for shopping with RAIHANA! Our team will contact you shortly to confirm delivery."}
          </p>

          <div className="bg-warm-white/70 p-4 rounded-2xl border border-dark/5 text-left mb-6 text-sm" dir={isRtl ? "rtl" : "ltr"}>
            {/* Subtotal row */}
            <div className="flex justify-between text-gray-500 mb-1">
              <span>{lang === "ar" ? "المجموع الفرعي:" : "Subtotal:"}</span>
              <span className="font-semibold text-dark">{displaySubtotal} {lang === "ar" ? "جنيه" : "EGP"}</span>
            </div>
            {/* Shipping row */}
            <div className="flex justify-between text-gray-500 mb-2 pb-2 border-b border-dark/10">
              <span>
                {lang === "ar" ? "الشحن" : "Shipping"}
                {displayCity ? ` (${displayCity})` : ""}:
              </span>
              <span className="font-semibold text-dark">{displayShipping} {lang === "ar" ? "جنيه" : "EGP"}</span>
            </div>
            {/* Total row */}
            <div className="flex justify-between font-bold text-dark">
              <span>{lang === "ar" ? "قيمة الطلب الإجمالية:" : "Total Order Amount:"}</span>
              <span className="text-gold">{displayTotal} {lang === "ar" ? "جنيه" : "EGP"}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {lang === "ar" ? "عدد الأصناف: " : "Items count: "}
              {displayItems.reduce((acc, it) => acc + it.quantity, 0)}
            </p>
          </div>

          <div className="space-y-3">
            {settings.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  whatsappSummary
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs shadow-md"
              >
                <MessageCircle size={18} />
                <span>
                  {lang === "ar"
                    ? "تأكيد الطلب عبر واتساب الآن"
                    : "Confirm on WhatsApp Now"}
                </span>
              </a>
            )}

            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 bg-dark text-warm-white font-bold rounded-xl hover:bg-gold hover:text-black transition-colors uppercase tracking-widest text-xs cursor-pointer"
            >
              {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 pb-16 px-4 bg-warm-white"
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft
            size={20}
            className={`transition-transform ${
              isRtl ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1"
            }`}
          />
          <span className="text-sm font-medium uppercase tracking-wider">{t("back")}</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Order Summary */}
          <div className="w-full md:w-1/3 order-2 md:order-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-dark/5 sticky top-28">
              <h3 className="text-lg font-serif text-dark mb-4 border-b border-gray-100 pb-3">
                {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {orderItems.map((item, idx) => {
                  const itName = lang === "ar" ? item.nameAr : item.nameEn;
                  return (
                    <div key={idx} className="flex gap-3 items-center pb-3 border-b border-gray-50 last:border-0">
                      <div className="w-14 h-14 bg-warm-white rounded-xl flex items-center justify-center p-1 shrink-0 overflow-hidden border border-gray-100">
                        <img
                          src={item.image}
                          alt={itName}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-dark text-xs truncate">{itName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.size && (
                            <span className="text-[10px] bg-gold/10 text-gold font-bold px-1.5 py-0.5 rounded">
                              {item.size}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">× {item.quantity}</span>
                        </div>
                        <p className="text-xs font-bold text-gold mt-1">
                          {item.price * item.quantity} {lang === "ar" ? "جنيه" : "EGP"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>{lang === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-semibold text-dark">{subtotal} {lang === "ar" ? "ج.م" : "EGP"}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>{lang === "ar" ? "الشحن" : "Shipping"}</span>
                    <span className="font-semibold text-dark">{shippingCost} {lang === "ar" ? "ج.م" : "EGP"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm font-bold">
                  <span className="text-dark">{lang === "ar" ? "الإجمالي الكلي" : "Total"}</span>
                  <span className="text-gold font-serif text-lg">
                    {totalAmount} {lang === "ar" ? "جنيه" : "EGP"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="w-full md:w-2/3 order-1 md:order-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-dark/5">
              <h2 className="text-2xl font-serif text-dark mb-6">
                {lang === "ar" ? "تفاصيل التوصيل والشحن" : "Delivery Details"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === "ar" ? "الاسم بالكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30 text-sm"
                    placeholder={lang === "ar" ? "أدخل اسمك الكريم" : "Enter your full name"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === "ar" ? "رقم الهاتف للتواصل *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    minLength={8}
                    maxLength={25}
                    dir="ltr"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30 text-left text-sm"
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === "ar" ? "المحافظة / المدينة *" : "City / Governorate *"}
                    </label>
                    <select
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30 text-sm"
                    >
                      <option value="">{lang === "ar" ? "— اختر المحافظة —" : "— Select Governorate —"}</option>
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                    {/* Show shipping cost preview once city is selected */}
                    {formData.city && (
                      <p className="text-xs text-gold mt-1 font-medium">
                        {lang === "ar"
                          ? `🚚 رسوم الشحن إلى ${formData.city}: ${shippingCost} جنيه`
                          : `🚚 Shipping to ${formData.city}: ${shippingCost} EGP`}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === "ar" ? "ملاحظات إضافية" : "Order Notes"}
                    </label>
                    <input
                      type="text"
                      name="notes"
                      maxLength={300}
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30 text-sm"
                      placeholder={lang === "ar" ? "أي تعليمات خاصة بالتسليم" : "Any special instructions"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === "ar" ? "عنوان التوصيل بالتفصيل *" : "Detailed Address *"}
                  </label>
                  <textarea
                    name="address"
                    required
                    minLength={3}
                    maxLength={300}
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-warm-white/30 resize-none text-sm"
                    placeholder={
                      lang === "ar"
                        ? "اسم الشارع، رقم المبنى، الشقة أو علامة مميزة"
                        : "Street name, building number, apartment or landmark"
                    }
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-dark text-warm-white font-bold rounded-xl hover:bg-gold hover:text-black transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-70 disabled:hover:bg-dark flex items-center justify-center cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-warm-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      lang === "ar" ? "تأكيد وإرسال الطلب" : "Confirm & Place Order"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
