import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  X,
  TrendingUp,
  Star,
  Gem,
  ChevronDown,
  Save,
  RefreshCw,
  ShoppingCart,
  GripVertical,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { perfumesData as localSeedData } from "../data/perfumes";
import { useSettings } from "../hooks/useSettings";
import { motion, Reorder, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────
// Cloudinary Config
// ─────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = "dqba8q19x";
const CLOUDINARY_UPLOAD_PRESET = "Raihana Store";

const CATEGORY_COLORS = {
  men: "bg-blue-100 text-blue-800",
  women: "bg-pink-100 text-pink-800",
  unisex: "bg-purple-100 text-purple-800",
  incense: "bg-amber-100 text-amber-800",
  diffusers: "bg-teal-100 text-teal-800",
};

const EMPTY_FORM = {
  nameEn: "",
  nameAr: "",
  descEn: "",
  descAr: "",
  category: "unisex",
  type: "inspired",
  image: "", // Keep for legacy
  images: [], // New multi-image array
  sizes: ["50ML", "100ML"], // Default sizes
  topNotesEn: "",
  middleNotesEn: "",
  baseNotesEn: "",
  topNotesAr: "",
  middleNotesAr: "",
  baseNotesAr: "",
  trending: false,
  bestSeller: false,
  exclusive: false,
  price: "",
  price100ml: "",
};

// ─────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────
// Cloudinary Upload
// ─────────────────────────────────────────
const uploadToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (xhr.status === 200) resolve(res.secure_url);
      else reject(new Error(res.error?.message || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Upload error"));
    xhr.send(formData);
  });
};

// ─────────────────────────────────────────
// Product Form Modal
// ─────────────────────────────────────────
const ProductModal = ({ isOpen, onClose, onSave, editingProduct }) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        nameEn: editingProduct.name?.en || "",
        nameAr: editingProduct.name?.ar || "",
        descEn: editingProduct.description?.en || "",
        descAr: editingProduct.description?.ar || "",
        category: editingProduct.category || "unisex",
        type: editingProduct.type || "inspired",
        image: editingProduct.image || "",
        images:
          editingProduct.images ||
          (editingProduct.image ? [editingProduct.image] : []),
        sizes: editingProduct.sizes || ["50ML", "100ML"],
        topNotesEn: editingProduct.notes?.en?.[0] || "",
        middleNotesEn: editingProduct.notes?.en?.[1] || "",
        baseNotesEn: editingProduct.notes?.en?.[2] || "",
        topNotesAr: editingProduct.notes?.ar?.[0] || "",
        middleNotesAr: editingProduct.notes?.ar?.[1] || "",
        baseNotesAr: editingProduct.notes?.ar?.[2] || "",
        trending: editingProduct.trending || false,
        bestSeller: editingProduct.bestSeller || false,
        exclusive: editingProduct.exclusive || false,
        price:
          editingProduct.sizePrices?.["50ML"] || editingProduct.price || "",
        price100ml:
          editingProduct.sizePrices?.["100ML"] ||
          editingProduct.price100ml ||
          "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setUploadProgress(0);
  }, [editingProduct, isOpen]);

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadToCloudinary(file, setUploadProgress);
      const updatedImages = [...(formData.images || []), url];
      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
        image: prev.image || url, // Primary fallback
      }));
    } catch (err) {
      alert("فشل رفع الصورة: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: updated,
      image: updated[0] || "",
    }));
  };

  const toggleSize = (size) => {
    const updated = formData.sizes.includes(size)
      ? formData.sizes.filter((s) => s !== size)
      : [...formData.sizes, size];
    set("sizes", updated);
  };

  const handleCategoryChange = (newCat) => {
    let newType = "inspired";
    if (newCat === "incense") newType = "oud_category";
    if (newCat === "diffusers") newType = "steam";
    setFormData((p) => ({ ...p, category: newCat, type: newType }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {editingProduct ? "✏️ تعديل المنتج" : "➕ إضافة منتج جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* English */}
            <div className="space-y-4">
              <h3 className="font-bold text-gold border-b pb-2 flex items-center gap-2">
                🇬🇧 English Entry
              </h3>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                  Name
                </label>
                <input
                  value={formData.nameEn}
                  onChange={(e) => set("nameEn", e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                  Description
                </label>
                <textarea
                  value={formData.descEn}
                  onChange={(e) => set("descEn", e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Top Note", "topNotesEn"],
                  ["Middle Note", "middleNotesEn"],
                  ["Base Note", "baseNotesEn"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                      {label}
                    </label>
                    <input
                      value={formData[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Arabic */}
            <div className="space-y-4" dir="rtl">
              <h3 className="font-bold text-gold border-b pb-2 flex items-center gap-2">
                🇪🇬 النسخة العربية
              </h3>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                  الاسم
                </label>
                <input
                  value={formData.nameAr}
                  onChange={(e) => set("nameAr", e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                  الوصف
                </label>
                <textarea
                  value={formData.descAr}
                  onChange={(e) => set("descAr", e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["الرائحة العليا", "topNotesAr"],
                  ["الوسطى", "middleNotesAr"],
                  ["القاعدة", "baseNotesAr"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                      {label}
                    </label>
                    <input
                      value={formData[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="border-t pt-6 space-y-5">
            <h3 className="font-bold text-gray-700">⚙️ الإعدادات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                >
                  {(settings.categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              {/* Type */}
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => set("type", e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {["men", "women", "unisex"].includes(formData.category) && (
                    <>
                      <option value="inspired">Inspired</option>
                      <option value="niche">Niche</option>
                      <option value="oil">Oil</option>
                    </>
                  )}
                  {formData.category === "incense" && (
                    <>
                      <option value="oud_category">Oud</option>
                      <option value="wooden_sticks">Wooden Sticks</option>
                      <option value="pyramidal">Pyramidal</option>
                    </>
                  )}
                  {formData.category === "diffusers" && (
                    <>
                      <option value="steam">Steam</option>
                      <option value="charcoal">Charcoal</option>
                      <option value="electric">Electric</option>
                    </>
                  )}
                </select>
              </div>
              {/* Price */}
              {["men", "women", "unisex"].includes(formData.category) ? (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                      سعر 50ML (جنيه) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder="e.g. 650"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                      سعر 100ML (جنيه) *
                    </label>
                    <input
                      type="number"
                      value={formData.price100ml}
                      onChange={(e) => set("price100ml", e.target.value)}
                      placeholder="e.g. 950"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1 text-gray-500">
                    السعر (جنيه) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                  />
                </div>
              )}

              {/* Multi-Image Section */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest mb-2 text-gray-500">
                  الصور (يمكنك إضافة أكثر من صورة)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {formData.images?.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label
                    className={`flex flex-col items-center justify-center gap-1 aspect-square border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? "border-yellow-400 bg-yellow-50" : "border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"}`}
                  >
                    <Upload
                      size={20}
                      className={
                        uploading
                          ? "animate-bounce text-yellow-500"
                          : "text-gray-400"
                      }
                    />
                    <span className="text-[10px] font-bold text-gray-500">
                      {uploading ? `${uploadProgress}%` : "إضافة صورة"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Sizes Section */}
              <div className="md:col-span-2 pt-2">
                <label className="block text-xs uppercase tracking-widest mb-3 text-gray-500">
                  الأحجام المتوفرة
                </label>
                <div className="flex gap-4">
                  {["50ML", "100ML"].map((size) => (
                    <label
                      key={size}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.sizes?.includes(size) ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}
                        onClick={() => toggleSize(size)}
                      >
                        {formData.sizes?.includes(size) && (
                          <span className="text-white text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                ["trending", "🔥 Trending"],
                ["bestSeller", "⭐ Best Seller"],
                ["exclusive", "💎 Exclusive"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData[key] ? "bg-yellow-400 border-yellow-400" : "border-gray-300"}`}
                    onClick={() => set(key, !formData[key])}
                  >
                    {formData[key] && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              حفظ المنتج
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Categories Tab
// ─────────────────────────────────────────
const CategoriesTab = () => {
  const { settings, saveSettings } = useSettings();
  const [newCat, setNewCat] = useState({ nameAr: "", nameEn: "", id: "" });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.nameAr || !newCat.nameEn || !newCat.id) return;

    // Check for duplicates
    if (settings.categories?.find((c) => c.id === newCat.id)) {
      alert("المعرف (ID) موجود مسبقاً، يرجى اختيار اسم فريد.");
      return;
    }

    const updated = [...(settings.categories || []), newCat];
    await saveSettings({ ...settings, categories: updated });
    setNewCat({ nameAr: "", nameEn: "", id: "" });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "حذف هذا التصنيف قد يؤدي لمشاكل في عرض المنتجات المرتبطة به. هل تريد الاستمرار؟",
      )
    )
      return;
    const updated = settings.categories.filter((c) => c.id !== id);
    await saveSettings({ ...settings, categories: updated });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            📁 إدارة التصنيفات
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            أضف أو احذف تصنيفات العطور، البخور، والفواحات
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-yellow-500 transition-all shadow-lg"
        >
          <Plus size={18} />
          {isAdding ? "إغلاق" : "إضافة تصنيف"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                  الاسم بالعربي
                </label>
                <input
                  value={newCat.nameAr}
                  onChange={(e) =>
                    setNewCat({ ...newCat, nameAr: e.target.value })
                  }
                  placeholder="مثال: مجموعتنا الجديدة"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                  Name (English)
                </label>
                <input
                  value={newCat.nameEn}
                  onChange={(e) =>
                    setNewCat({ ...newCat, nameEn: e.target.value })
                  }
                  placeholder="Example: New Collection"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                  المعرف (Unique ID)
                </label>
                <input
                  value={newCat.id}
                  onChange={(e) =>
                    setNewCat({
                      ...newCat,
                      id: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    })
                  }
                  placeholder="new_collection"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm font-mono"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors shadow-lg"
              >
                إضافة لـ Firebase
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs text-gray-400 uppercase tracking-widest">
              <th className="p-4">التصنيف</th>
              <th className="p-4">المعرف</th>
              <th className="p-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(settings.categories || []).map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4">
                  <div className="font-bold text-gray-800">{c.nameAr}</div>
                  <div className="text-xs text-gray-400">{c.nameEn}</div>
                </td>
                <td className="p-4">
                  <code className="bg-gray-100 px-2 py-1 rounded text-pink-600 text-xs">
                    {c.id}
                  </code>
                </td>
                <td className="p-4 text-left">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────
const EGYPTIAN_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الغربية", "المنوفية",
  "الشرقية", "كفر الشيخ", "دمياط", "بورسعيد", "الإسماعيلية", "السويس",
  "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر",
  "أسوان", "مطروح", "شمال سيناء", "جنوب سيناء", "البحر الأحمر", "الوادي الجديد",
];

const SettingsTab = () => {
  const { t } = useTranslation();
  const { settings, saveSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setF = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // ─── Shipping rates helpers ───────────────────────────────────────────────────
  const shippingRates = form.shippingRates || {};
  const setRate = (city, val) =>
    setForm((p) => ({
      ...p,
      shippingRates: { ...(p.shippingRates || {}), [city]: val === "" ? undefined : Number(val) },
    }));
  const setDefaultRate = (val) =>
    setForm((p) => ({
      ...p,
      shippingRates: { ...(p.shippingRates || {}), default: val === "" ? undefined : Number(val) },
    }));

  const fields = [
    {
      key: "whatsappNumber",
      label: "رقم الواتساب",
      type: "text",
      dir: "ltr",
      placeholder: "201112522926",
      hint: "ادخل الرقم بدون + مثال: 201112522926",
    },
    {
      key: "storeName",
      label: "اسم المتجر",
      type: "text",
      placeholder: "RAIHANA",
    },
    {
      key: "whatsappTemplate",
      label: t("whatsapp_template"),
      type: "text",
      placeholder: "مرحبًا ريحانة، أود الاستفسار عن عطر: {product}",
    },
    {
      key: "email",
      label: "البريد الإلكتروني",
      type: "email",
      dir: "ltr",
      placeholder: "info@example.com",
    },
    {
      key: "address",
      label: "العنوان",
      type: "text",
      placeholder: "القاهرة، مصر",
    },
    {
      key: "instagramUrl",
      label: "رابط انستجرام",
      type: "text",
      dir: "ltr",
      placeholder: "https://instagram.com/...",
    },
    {
      key: "facebookPixelId",
      label: "معرف بيكسل فيسبوك (Pixel ID)",
      type: "text",
      dir: "ltr",
      placeholder: "123456789012345",
      hint: "أدخل رقم الـ ID فقط",
    },
  ];

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        ⚙️ إعدادات المتجر
      </h2>
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6"
      >
        {fields.map(({ key, label, type, dir, placeholder, hint }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {label}
            </label>
            <input
              type={type}
              dir={dir || "auto"}
              value={form[key] || ""}
              onChange={(e) => setF(key, e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
          </div>
        ))}

        {/* ─── Shipping Rates Section ─────────────────────────────────────────── */}
        <div className="border-t pt-6">
          <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
            🚚 أسعار الشحن لكل محافظة
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            اتركها فارغة لاستخدام السعر الافتراضي. السعر بالجنيه المصري.
          </p>

          {/* Default rate */}
          <div className="flex items-center gap-3 mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <label className="text-sm font-semibold text-amber-800 w-40 shrink-0">
              🌍 سعر افتراضي (باقي المحافظات)
            </label>
            <input
              type="number"
              min="0"
              dir="ltr"
              value={shippingRates["default"] ?? ""}
              onChange={(e) => setDefaultRate(e.target.value)}
              placeholder="80"
              className="w-28 p-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-center"
            />
            <span className="text-xs text-amber-700">جنيه</span>
          </div>

          {/* Per-governorate rates grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
            {EGYPTIAN_GOVERNORATES.map((gov) => (
              <div key={gov} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                <label className="text-sm text-gray-700 flex-1 truncate">{gov}</label>
                <input
                  type="number"
                  min="0"
                  dir="ltr"
                  value={shippingRates[gov] ?? ""}
                  onChange={(e) => setRate(gov, e.target.value)}
                  placeholder={String(shippingRates["default"] ?? "—")}
                  className="w-20 p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-center"
                />
                <span className="text-xs text-gray-400">ج.م</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${saved ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-yellow-500"}`}
          >
            <Save size={16} />
            {saved ? "✓ تم الحفظ بنجاح!" : "حفظ الإعدادات"}
          </button>
        </div>
      </form>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-bold text-amber-800 mb-2">📱 رقم الواتساب</h3>
        <p className="text-sm text-amber-700">
          أي تغيير في الرقم هينعكس فوراً على كل أزرار "استفسر عبر واتساب" في
          الموقع بالكامل.
        </p>
        {form.whatsappNumber && (
          <a
            href={`https://wa.me/${form.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm text-green-700 font-medium hover:underline"
          >
            🟢 اختبر الرابط &rarr;
          </a>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────
export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  // Auth & Page Title
  useEffect(() => {
    document.title = t("title_admin");
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [t]);

  // Fetch products (public read — always fetch)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "perfumes"), (snap) => {
      const prods = [];
      snap.forEach((d) => prods.push({ id: d.id, ...d.data() }));
      // Sort by order field if available
      prods.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProducts(prods);
    });
    return unsub;
  }, []);

  // Fetch orders (admin only — require auth)
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const ords = [];
      snap.forEach((d) => ords.push({ id: d.id, ...d.data() }));
      ords.sort(
        (a, b) =>
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
      );
      setOrders(ords);
    });
    return unsub;
  }, [user]);

  const toggleOrderStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    await setDoc(
      doc(db, "orders", orderId),
      { status: newStatus },
      { merge: true },
    );
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    await deleteDoc(doc(db, "orders", orderId));
  };

  const saveOrderToFirebase = async () => {
    setSavingOrder(true);
    try {
      const batch = writeBatch(db);
      products.forEach((product, index) => {
        if (!product.id) throw new Error("Product is missing an ID");
        const ref = doc(db, "perfumes", product.id.toString());
        batch.set(ref, { order: index }, { merge: true });
      });
      await batch.commit();
      setOrderChanged(false);
      alert("تم حفظ الترتيب بنجاح!");
    } catch (err) {
      console.error("Failed to save order:", err);
      if (
        err.message.includes("permission") ||
        err.code === "permission-denied"
      ) {
        alert("عذراً، ليس لديك صلاحية لحفظ الترتيب. يرجى تسجيل الدخول أولاً.");
      } else {
        alert("حدث خطأ أثناء حفظ الترتيب: " + err.message);
      }
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSaveProduct = async (formData) => {
    if (!auth.currentUser) {
      alert(
        "⚠️ عذراً، أنت غير مسجل الدخول في Firebase! يرجى تسجيل الدخول أولاً من صفحة /login.",
      );
      navigate("/login");
      return;
    }

    const currentEmail = auth.currentUser.email?.toLowerCase();
    const ALLOWED_ADMINS = ["amohamedamr99@gmail.com", "admin@store.com"];
    if (!ALLOWED_ADMINS.includes(currentEmail)) {
      alert(
        `⚠️ الحساب المسجل به حالياً (${auth.currentUser.email}) ليس هو الحساب المعتمد للأدمن.`,
      );
      return;
    }

    const productId = editingProduct
      ? editingProduct.id
      : Date.now().toString();
    const payload = {
      name: { en: formData.nameEn, ar: formData.nameAr },
      description: { en: formData.descEn, ar: formData.descAr },
      notes: {
        en: [formData.topNotesEn, formData.middleNotesEn, formData.baseNotesEn],
        ar: [formData.topNotesAr, formData.middleNotesAr, formData.baseNotesAr],
      },
      category: formData.category,
      type: formData.type,
      image: formData.image,
      trending: formData.trending,
      bestSeller: formData.bestSeller,
      exclusive: formData.exclusive,
      price: formData.price ? Number(formData.price) : 0,
      price100ml: formData.price100ml ? Number(formData.price100ml) : null,
      sizePrices: {
        ...(formData.price && { "50ML": Number(formData.price) }),
        ...(formData.price100ml && { "100ML": Number(formData.price100ml) }),
      },
      images: formData.images || (formData.image ? [formData.image] : []),
      sizes: formData.sizes || ["50ML", "100ML"],
    };
    try {
      await setDoc(doc(db, "perfumes", productId), payload);
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      alert("خطأ في الحفظ: " + err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await deleteDoc(doc(db, "perfumes", id));
  };

  const seedDatabase = async () => {
    if (!window.confirm("سيتم رفع كل البيانات المحلية إلى Firebase. متابعة؟"))
      return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      localSeedData.forEach((item) => {
        batch.set(doc(db, "perfumes", item.id.toString()), item);
      });
      await batch.commit();
      alert("تمت المزامنة بنجاح!");
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // ── Stats ──
  const stats = {
    total: products.length,
    trending: products.filter((p) => p.trending).length,
    bestSeller: products.filter((p) => p.bestSeller).length,
    exclusive: products.filter((p) => p.exclusive).length,
  };

  // ── Filtered products ──
  const filtered = products.filter((p) => {
    const nameEn = p.name?.en?.toLowerCase() || "";
    const nameAr = p.name?.ar || "";
    const matchSearch =
      nameEn.includes(searchQuery.toLowerCase()) ||
      nameAr.includes(searchQuery);
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  // ── Loading ──
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              مرحباً! إدارة منتجات وإعدادات RAIHANA
            </p>
            {user ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full mt-2 border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                مسجل الدخول: <strong className="font-mono">{user.email}</strong>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2.5 py-1 rounded-full mt-2 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                ⚠️ غير مسجل الدخول — لن تتمكن من الحفظ
              </span>
            )}
          </div>
          <button
            onClick={async () => {
              await signOut(auth);
              navigate("/login");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors text-gray-700"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "products" ? "bg-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Package size={16} /> المنتجات
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "categories" ? "bg-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <LayoutDashboard size={16} /> {t("admin_categories")}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "orders" ? "bg-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <ShoppingCart size={16} /> الطلبات
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "settings" ? "bg-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Settings size={16} /> الإعدادات
          </button>
        </div>

        {/* ── Products Tab ── */}
        {activeTab === "products" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="إجمالي المنتجات"
                value={stats.total}
                icon={Package}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="Trending"
                value={stats.trending}
                icon={TrendingUp}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                label="Best Sellers"
                value={stats.bestSeller}
                icon={Star}
                color="bg-yellow-100 text-yellow-600"
              />
              <StatCard
                label="Exclusive"
                value={stats.exclusive}
                icon={Gem}
                color="bg-purple-100 text-purple-600"
              />
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-5 justify-between items-center">
              <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 pl-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm bg-white w-52"
                  />
                </div>
                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm bg-white"
                >
                  <option value="all">كل التصنيفات</option>
                  {(settings.categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                {orderChanged && (
                  <button
                    onClick={saveOrderToFirebase}
                    disabled={savingOrder}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-lg animate-pulse disabled:opacity-50"
                  >
                    <Save
                      size={16}
                      className={savingOrder ? "animate-spin" : ""}
                    />
                    {savingOrder ? "جاري الحفظ..." : "حفظ الترتيب"}
                  </button>
                )}
                <button
                  onClick={seedDatabase}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={syncing ? "animate-spin" : ""}
                  />
                  مزامنة البيانات
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
                >
                  <Plus size={16} /> إضافة منتج
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right min-w-175">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-widest">
                      <th className="p-4">الصورة</th>
                      <th className="p-4">الاسم</th>
                      <th className="p-4">التصنيف</th>
                      <th className="p-4">السعر</th>
                      <th className="p-4">العلامات</th>
                      <th className="p-4 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <Reorder.Group
                    as="tbody"
                    axis="y"
                    values={filtered}
                    onReorder={(newOrder) => {
                      if (filterCategory === "all" && !searchQuery) {
                        setProducts(newOrder);
                        setOrderChanged(true);
                      }
                    }}
                  >
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-12 text-center text-gray-400"
                        >
                          {searchQuery
                            ? "لا توجد نتائج للبحث"
                            : "لا توجد منتجات. أضف منتجاً أو زامن البيانات."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <Reorder.Item
                          as="tr"
                          key={p.id}
                          value={p}
                          className="border-b hover:bg-gray-50/70 transition-colors cursor-grab active:cursor-grabbing"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <GripVertical
                              size={16}
                              className="text-gray-300 cursor-grab active:cursor-grabbing"
                              title="اسحب لترتيب المنتج"
                            />
                            {p.image ? (
                              <img
                                src={p.image}
                                className="w-14 h-14 object-cover rounded-xl border border-gray-100"
                                alt=""
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                لا صورة
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-gray-900">
                              {p.name?.en}
                            </p>
                            <p className="text-sm text-gray-500">
                              {p.name?.ar}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                              {settings.categories?.find(
                                (c) => c.id === p.category,
                              )?.nameAr || p.category}
                            </span>
                          </td>
                          <td className="p-4">
                            {p.sizePrices?.["50ML"] || p.price ? (
                              <div>
                                <span className="font-bold text-gray-900 block">
                                  {p.sizePrices?.["50ML"] || p.price} ج.م
                                </span>
                                {p.sizePrices?.["100ML"] && (
                                  <span className="text-[10px] text-gray-400 block font-normal">
                                    100ML: {p.sizePrices["100ML"]} ج.م
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {p.trending && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  🔥 Trending
                                </span>
                              )}
                              {p.bestSeller && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                  ⭐ Best Seller
                                </span>
                              )}
                              {p.exclusive && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  💎 Exclusive
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-left">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setShowModal(true);
                                }}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="تعديل"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="حذف"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </Reorder.Item>
                      ))
                    )}
                  </Reorder.Group>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
                  يعرض {filtered.length} من {products.length} منتج
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === "settings" && <SettingsTab />}

        {/* ── Categories Tab ── */}
        {activeTab === "categories" && <CategoriesTab />}

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-200">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-widest">
                    <th className="p-4">تاريخ الطلب</th>
                    <th className="p-4">العميل</th>
                    <th className="p-4">المنتج</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-12 text-center text-gray-400"
                      >
                        لا توجد طلبات حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="p-4 text-sm text-gray-600">
                          {order.createdAt
                            ? new Date(
                                order.createdAt.toMillis(),
                              ).toLocaleString("ar-EG")
                            : "N/A"}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-gray-900">
                            {order.customerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-xs text-gray-600 font-mono"
                              dir="ltr"
                            >
                              {order.customerPhone}
                            </span>
                            {order.customerPhone && (
                              <a
                                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 p-0.5"
                                title="محادثة واتساب"
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}
                          </div>
                          {order.city && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              📍 {order.city}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap max-w-xs leading-relaxed">
                            {order.customerAddress}
                          </p>
                          {order.notes && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 rounded p-1 mt-1 border border-amber-100">
                              ملاحظة: {order.notes}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-2 min-w-55">
                              {order.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-gray-800"
                                >
                                  {it.image && (
                                    <img
                                      src={it.image}
                                      alt=""
                                      onClick={() => setViewingImage(it.image)}
                                      className="w-8 h-8 rounded object-cover border border-gray-100 shrink-0 cursor-pointer"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                      {it.nameAr || it.nameEn}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                      {it.size ? `${it.size} ` : ""}×{" "}
                                      {it.quantity} = {it.price * it.quantity}{" "}
                                      ج.م
                                    </p>
                                  </div>
                                </div>
                              ))}

                              {/* Price verification and total display */}
                              {(() => {
                                const calculatedItemsSum = order.items.reduce(
                                  (sum, item) =>
                                    sum +
                                    (Number(item.price) || 0) *
                                      (Number(item.quantity) || 1),
                                  0,
                                );
                                const expectedTotal =
                                  calculatedItemsSum +
                                  (Number(order.shippingCost) || 0);
                                const isDiscrepancy =
                                  order.totalAmount &&
                                  Math.abs(
                                    expectedTotal - Number(order.totalAmount),
                                  ) > 1;

                                return (
                                  <div className="pt-2 border-t border-gray-100 mt-1">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                                      <span>الإجمالي:</span>
                                      <span className="text-yellow-700">
                                        {order.totalAmount ||
                                          calculatedItemsSum}{" "}
                                        ج.م
                                      </span>
                                    </div>
                                    {isDiscrepancy && (
                                      <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 p-1 rounded font-bold mt-1 border border-red-200">
                                        <AlertTriangle
                                          size={12}
                                          className="shrink-0"
                                        />
                                        <span>
                                          تنبيه: اختلاف بين الإجمالي ومجموع
                                          المنتجات!
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            /* Legacy single-product order display */
                            <div className="flex items-center gap-3">
                              {(() => {
                                const relatedProduct = products.find(
                                  (p) => p.id === order.productId,
                                );
                                const img =
                                  order.productImage ||
                                  relatedProduct?.image ||
                                  relatedProduct?.images?.[0];
                                if (img) {
                                  return (
                                    <img
                                      src={img}
                                      alt="Product"
                                      onClick={() => setViewingImage(img)}
                                      className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0 cursor-pointer hover:shadow-md transition-shadow"
                                    />
                                  );
                                }
                                return (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] shrink-0">
                                    لا صورة
                                  </div>
                                );
                              })()}
                              <div>
                                <p className="font-semibold text-gray-900 line-clamp-2">
                                  {order.productNameAr || order.productNameEn}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {order.size}{" "}
                                  {order.price !== "N/A"
                                    ? `- ${order.price} جنيه`
                                    : ""}
                                </p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                          >
                            {order.status === "Pending"
                              ? "قيد الانتظار"
                              : "مكتمل"}
                          </span>
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() =>
                                toggleOrderStatus(order.id, order.status)
                              }
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="تغيير الحالة"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Image Viewer Overlay */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-100 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            alt="Fullscreen View"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-6 right-6 text-white bg-black/50 hover:bg-black p-2 rounded-full transition-colors cursor-pointer"
            onClick={() => setViewingImage(null)}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
